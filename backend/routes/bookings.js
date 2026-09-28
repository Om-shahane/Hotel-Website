const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Helper: calculate nights between two dates
function nightsBetween(checkIn, checkOut) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
  return Math.max(diff, 0);
}

// POST /api/bookings - create a new booking
router.post('/', async (req, res) => {
  try {
    const { room_id, guest_name, guest_email, guest_phone, check_in, check_out, guests } = req.body;

    if (!room_id || !guest_name || !guest_email || !check_in || !check_out) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    const nights = nightsBetween(check_in, check_out);
    if (nights <= 0) {
      return res.status(400).json({ error: 'check_out must be after check_in' });
    }

    const [[room]] = await pool.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Check availability before booking
    const [[{ bookedCount }]] = await pool.query(
      `SELECT COUNT(*) AS bookedCount FROM bookings
       WHERE room_id = ? AND status != 'cancelled'
       AND NOT (check_out <= ? OR check_in >= ?)`,
      [room_id, check_in, check_out]
    );
    if (bookedCount >= room.total_rooms) {
      return res.status(409).json({ error: 'No rooms of this type available for the selected dates' });
    }

    const total_price = (nights * parseFloat(room.price_per_night)).toFixed(2);

    const [result] = await pool.query(
      `INSERT INTO bookings (room_id, guest_name, guest_email, guest_phone, check_in, check_out, guests, total_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [room_id, guest_name, guest_email, guest_phone || null, check_in, check_out, guests || 1, total_price]
    );

    res.status(201).json({
      id: result.insertId,
      room_id, guest_name, guest_email, check_in, check_out, nights, total_price,
      status: 'pending'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings - list all bookings (admin use)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, r.name AS room_name FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// PATCH /api/bookings/:id/status - update booking status (admin use)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Booking status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

module.exports = router;

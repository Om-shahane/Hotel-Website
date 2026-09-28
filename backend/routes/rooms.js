const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/rooms - list all rooms (optional ?type= filter)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM rooms';
    const params = [];
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    query += ' ORDER BY price_per_night ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// GET /api/rooms/:id - single room details
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// GET /api/rooms/:id/availability?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
router.get('/:id/availability', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'checkIn and checkOut dates are required' });
    }

    const [[room]] = await pool.query('SELECT total_rooms FROM rooms WHERE id = ?', [req.params.id]);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Count overlapping confirmed/pending bookings for this room type & date range
    const [[{ bookedCount }]] = await pool.query(
      `SELECT COUNT(*) AS bookedCount FROM bookings
       WHERE room_id = ? AND status != 'cancelled'
       AND NOT (check_out <= ? OR check_in >= ?)`,
      [req.params.id, checkIn, checkOut]
    );

    const available = room.total_rooms - bookedCount;
    res.json({ available: Math.max(available, 0), totalRooms: room.total_rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

module.exports = router;

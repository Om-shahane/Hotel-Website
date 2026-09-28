let selectedRoom = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const roomId = params.get('room');
  const select = document.getElementById('room-select');
  const checkIn = document.getElementById('check_in');
  const checkOut = document.getElementById('check_out');

  checkIn.min = todayISO();
  checkOut.min = todayISO();

  let rooms;
  try {
    rooms = await apiRequest('/rooms');
  } catch (err) {
    // Backend/database not reachable yet — fall back to local sample data
    // (defined in rooms.js) so the booking form still works.
    rooms = typeof FALLBACK_ROOMS !== 'undefined' ? FALLBACK_ROOMS : [];
  }

  select.innerHTML = rooms.length
    ? rooms.map(r =>
        `<option value="${r.id}" data-price="${r.price_per_night}">${r.name} — ${formatCurrency(r.price_per_night)}/night</option>`
      ).join('')
    : `<option>Couldn't load rooms</option>`;

  if (roomId) select.value = roomId;
  updateSelectedRoom(rooms);

  select.addEventListener('change', () => updateSelectedRoom(rooms));
  checkIn.addEventListener('change', () => {
    checkOut.min = checkIn.value;
    updateSummary();
  });
  checkOut.addEventListener('change', updateSummary);

  document.getElementById('booking-form').addEventListener('submit', handleSubmit);

  function updateSelectedRoom(roomList) {
    selectedRoom = roomList.find(r => String(r.id) === String(select.value)) || roomList[0];
    updateSummary();
  }
});

function nightsBetween(a, b) {
  if (!a || !b) return 0;
  const diff = (new Date(b) - new Date(a)) / 86400000;
  return diff > 0 ? diff : 0;
}

function updateSummary() {
  const select = document.getElementById('room-select');
  const checkIn = document.getElementById('check_in').value;
  const checkOut = document.getElementById('check_out').value;
  const opt = select.options[select.selectedIndex];
  const price = opt ? parseFloat(opt.dataset.price) : 0;
  const nights = nightsBetween(checkIn, checkOut);
  const total = (price * nights).toFixed(2);

  document.getElementById('summary-room').textContent = opt ? opt.textContent.split(' — ')[0] : '—';
  document.getElementById('summary-nights').textContent = nights || '—';
  document.getElementById('summary-rate').textContent = price ? formatCurrency(price) : '—';
  document.getElementById('summary-total').textContent = nights ? formatCurrency(total) : '—';
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('form-msg');
  const submitBtn = form.querySelector('button[type="submit"]');

  const payload = {
    room_id: form.room_id.value,
    guest_name: form.guest_name.value.trim(),
    guest_email: form.guest_email.value.trim(),
    guest_phone: form.guest_phone.value.trim(),
    check_in: form.check_in.value,
    check_out: form.check_out.value,
    guests: parseInt(form.guests.value, 10) || 1
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  try {
    const result = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    msg.textContent = `Booking received! Confirmation #${result.id}. Total: ${formatCurrency(result.total_price)}. We'll email you shortly.`;
    msg.className = 'form-msg show success';
    form.reset();
    updateSummary();
  } catch (err) {
    msg.textContent = err.message || 'Something went wrong. Please try again.';
    msg.className = 'form-msg show error';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm booking';
  }
}

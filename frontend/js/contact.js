document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('contact-msg');
    const submitBtn = form.querySelector('button[type="submit"]');

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      await apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      msg.textContent = "Thanks for reaching out — we'll reply within one business day.";
      msg.className = 'form-msg show success';
      form.reset();
    } catch (err) {
      msg.textContent = err.message || 'Something went wrong. Please try again.';
      msg.className = 'form-msg show error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send message';
    }
  });
});

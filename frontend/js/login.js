const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

loginForm.addEventListener('submit', async (e) => {

  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  loginMessage.textContent = 'Logging in...';

  try {

    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password
      })
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);

    loginMessage.textContent = 'Login successful!';

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);

  } catch (error) {

    loginMessage.textContent = error.message;

  }

});
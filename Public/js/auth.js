
// frontend/js/auth.js

// Реалізація для форми входу
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Невірні дані');
        }
      } catch (error) {
        console.error('Login error:', error);
      }
    });
  }
  
  // Реалізація для форми реєстрації
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Помилка реєстрації');
        }
      } catch (error) {console.error('Registration error:', error);
      }
    });
  }
});



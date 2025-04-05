const apiUrl = 'https://vtjvlad.ddns.net'; // URL вашего сервера

function showRegistrationForm() {
    document.getElementById('registration-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

function showLoginForm() {
    document.getElementById('registration-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

document.getElementById('registrationForm').addEventListener('submit', register);
document.getElementById('loginForm').addEventListener('submit', login);

async function register(event) {
    event.preventDefault();

    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
        alert('Регистрация успешна!');
        showLoginForm(); // Показываем форму входа после успешной регистрации
        document.getElementById('registrationForm').reset(); // Очищаем поля формы регистрации
    } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message}`);
    }
}

async function login(event) {
    event.preventDefault();

    const login = document.getElementById('login-input').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        document.getElementById('auth-block').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
        const username = jwt_decode(data.token).username;
        document.getElementById('username-display').textContent = username;
        document.getElementById('loginForm').reset();  // Очищаем поля формы входа

    } else {
        const data = await response.json();
        alert(`Ошибка: ${data.message}`);
    }
}
// Функция для авторизации через Telegram WebApp
telegramAuthButton.addEventListener("click", async () => {
  try {
    // Telegram WebApp должен быть включён
    const telegramData = window.Telegram.WebApp.initDataUnsafe; // Данные от Telegram WebApp
    if (!telegramData.user) {
      throw new Error("Ошибка: данные Telegram недоступны.");
    }

    const { id, username, first_name, last_name } = telegramData.user;

    const response = await fetch(`${apiUrl}/auth/telegtam`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        username,
        first_name,
        last_name,
      }),
    });

    if (response.ok) {
      const data = await response.json();
    localStorage.setItem('token', data.token);
        document.getElementById('auth-block').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
        const username = jwt_decode(data.token).username;
        document.getElementById('username-display').textContent = username;
        document.getElementById('loginForm').reset();  // Очищаем поля формы входа
        } else {     
    const data = await response.json();
    alert(`Успешная авторизация через Telegram! Ваш токен: ${data.token}`);
        }
  } catch (error) {
    errorDiv.textContent = error.message;
  }
});

async function accessProtectedContent() {
    const token = localStorage.getItem('token');

    const response = await fetch(`${apiUrl}/protected`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

    if (response.ok) {
        const data = await response.json();
        document.getElementById('protected-data').textContent = JSON.stringify(data, null, 2);
    } else {
        alert('Ошибка доступа к защищенному контенту. Возможно, ваш токен истек.');
        logout(); // Выходим, если токен недействителен
    }
}
function logout() {
    localStorage.removeItem('token');
    document.getElementById('auth-block').style.display = 'block';
    document.getElementById('protected-content').style.display = 'none';
    document.getElementById('protected-data').textContent = '';
}

window.onload = () => {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('auth-block').style.display = 'none';
        document.getElementById('protected-content').style.display = 'block';
        try {
          const username = jwt_decode(token).username;
          document.getElementById('username-display').textContent = username;
        } catch (error) {
          console.error("Ошибка декодирования токена:", error);
          logout(); // Выполняем logout, если токен некорректный
        }
    }
};

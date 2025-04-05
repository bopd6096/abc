

document.addEventListener('DOMContentLoaded', function () {
    const authSection = document.getElementById('authSection');
    const authCard = document.getElementById('authcard');
    const AuthBtn = document.getElementById('AuthBtn');
    const flipToRegisterBtn = document.getElementById('flipToRegister');
    const flipToLoginBtn = document.getElementById('flipToLogin');
    const BtnStart = document.getElementById("telegramAuthButton");

    AuthBtn.addEventListener('click', function () {
        authSection.classList.remove('hidden');
        AuthBtn.style.display = 'none';
        BtnStart.style.display = 'none';
    });


    // Обработчик клика для закрытия карточки при клике вне ее
    document.addEventListener('click', function(event) {
    if (!authSection.contains(event.target) && !AuthBtn.contains(event.target) && !authSection.classList.contains('hidden')) {
        authSection.classList.add('hidden');
         AuthBtn.style.display = '';
        BtnStart.style.display = '';
    }
    });


    flipToRegisterBtn.addEventListener('click', function(event) {
        event.preventDefault();
        authCard.classList.toggle('flipped');
    });

     flipToLoginBtn.addEventListener('click', function(event) {
        event.preventDefault();
        authCard.classList.toggle('flipped');
    });
});

    let lastTouchTime = 0;

    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchTime <= 300) { // Если интервал между тапами меньше 300 мс
        e.preventDefault(); // Отменяем зум
      }
      lastTouchTime = now;
    });




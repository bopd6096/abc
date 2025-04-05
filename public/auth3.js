
const apiUrl = 'https://vtjvlad.ddns.net'; // URL вашего сервера
document.addEventListener('DOMContentLoaded', async function accessProtectedContent() {
    const token = localStorage.getItem('token');

    const response = await fetch(`${apiUrl}/protected`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });

console.log(`${token}`);
    if (response.ok) {
        const data = await response.json();
        console.log(data);
    } else {
        alert('Ошибка доступа к защищенному контенту. Возможно, ваш токен истек.');
    }
});



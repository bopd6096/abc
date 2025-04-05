/* cart.js */

const API_BASE_URL = 'https://vtjvlad.ddns.net'; // Замените на URL вашего backend

// Функция для получения токена (замените на ваш метод получения токена)
function getAuthToken() {
    return localStorage.getItem('token'); // Пример: получение токена из localStorage
}

// Функция для обновления счетчика товаров в корзине
async function updateCartCount() {
    const authToken = getAuthToken();
    if (!authToken) {
        document.getElementById('cart-count').innerText = 0; // Сбрасываем счетчик, если пользователь не авторизован
        
        document.getElementById('items-count').innerText = 0; // Сбрасываем счетчик, если пользователь не авторизован
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const cart = await response.json();
            const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
            document.getElementById('cart-count').innerText = cartCount;

            document.getElementById('items-count').innerText = cartCount;
        } else {
            console.error('Ошибка при получении данных корзины для счетчика');
            document.getElementById('cart-count').innerText = 0; // Сбрасываем счетчик в случае ошибки
        }
    } catch (error) {
        console.error('Ошибка при обновлении счетчика корзины:', error);
        document.getElementById('cart-count').innerText = 0; // Сбрасываем счетчик в случае ошибки
    }
}




//####################### КОРЗИНА #######################

async function loadCart() {
    const cartSection = document.getElementById('cart');
    if (!cartSection) return; // Выходим, если элемента cart не существует

    const authToken = getAuthToken();
    if (!authToken) {
        cartSection.innerHTML = '<p>Войдите в систему для просмотра корзины.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.status === 401) {
            cartSection.innerHTML = '<p>Пожалуйста, авторизуйтесь, чтобы увидеть корзину.</p>';
            return;
        }

        const cart = await response.json();
        displayCart(cart);
    } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
        cartSection.innerHTML = '<p>Ошибка загрузки корзины.</p>';
    }
}

function displayCart(cart) {
    const cartSection = document.getElementById('cart');
    if (!cartSection) return; // Выходим, если элемента cart не существует

    const cartItemsDiv = cartSection.querySelector('.cart-items');
    cartItemsDiv.innerHTML = `
                    <div class="pre-checkout"><p>Всього : </a></div>
        `; // Очищаем текущее содержимое корзины
   if (!cart || !cart.items || cart.items.length === 0) {
    cartItemsDiv.innerHTML = '<p>Корзина пуста.</p>';
    return;
} 

    if (!cart || cart.items.length === 0) {
        cartItemsDiv.innerHTML = '<p>Корзина пуста.</p>';
        return;
    }

    let totalAmount = 0; // Общая сумма товаров

    cart.items.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.innerHTML = `
            <img src="${item.productId.preview_link}" alt="${item.productId.name}" onclick="openProductModal('${item.productId._id}')">
            <p class="name"><b>${item.productId.name}</b></p>
            <p class="price">Цена:<b> ${item.productId.UAH} грн.</b></p>
            <p class="count"> ${item.quantity}</p>
            <button class="remove-from-cart" onclick="removeFromCart('${item.productId._id}')"> <i class="fa-solid fa-trash-can fa-xs"></i> </button>
            <button class="minus" onclick="updateQuantity('${item.productId._id}', ${item.quantity - 1})"> <i class="fa-regular fa-square-minus"></i> </button>
            <button class="plus" onclick="updateQuantity('${item.productId._id}', ${item.quantity + 1})"> <i class="fa-regular fa-square-plus"></i> </button>
        `;
        cartItemsDiv.prepend(cartItemElement);

        // Увеличиваем общую сумму на цену текущего товара с учетом его количества
        totalAmount += parseFloat(item.productId.UAH) * item.quantity; // Преобразуем UAH в число
    });

    // Отображаем общую сумму и кнопку для оплаты, если корзина не пуста
    if (cart.items.length > 0) {
        const preCheckoutDiv = cartSection.querySelector('.pre-checkout'); // Находим элемент для отображения общей суммы и кнопки оплаты
        const totalAmountDisplay = document.createElement('div');
        const checkoutButton = document.createElement('button');
        totalAmountDisplay.classList.add('total-amount');
        totalAmountDisplay.innerText = ` ${totalAmount.toFixed(2)} грн.`; // Ограничиваем двумя знаками после запятой

        checkoutButton.classList.add('checkout-button', "bttn-unite", "bttn-md", );
        checkoutButton.innerText = 'Оформити замовлення';
        checkoutButton.onclick = () => {
            // Здесь можно вызвать функцию для обработки оплаты
            showOrderForm();
            console.log('Переход к оплате...');
        };

        preCheckoutDiv.appendChild(totalAmountDisplay);
        preCheckoutDiv.appendChild(checkoutButton);
    }

}

async function addToCart(productId) {
    const authToken = getAuthToken();
    if (!authToken) {
        console.log('Пожалуйста, войдите в систему, чтобы добавлять товары в корзину.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/cart/add/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ quantity: 1 })
        });

        if (response.ok) {
            loadCart(); // Обновляем отображение корзины
            updateCartCount(); // Обновляем счетчик корзины (если у вас есть такая функция)
            console.log("Добавлено в корзину");
            alert("Товар добавлен в корзину");
        } else {
            const error = await response.json();
            console.log(`Не удалось добавить в корзину: ${error.message}`);
        }
    } catch (error) {
        console.error('Ошибка при добавлении в корзину:', error);
        console.log('Не удалось добавить в корзину из-за ошибки сервера.');
    }
}

async function removeFromCart(productId) {
    const authToken = getAuthToken();
    if (!authToken) {
        console.log('Пожалуйста, войдите в систему.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            loadCart(); // Обновляем отображение корзины
            updateCartCount(); // Обновляем счетчик корзины
        } else {
            const error = await response.json();
            console.log(`Не удалось удалить из корзины: ${error.message}`);
        }
    } catch (error) {
        console.error('Ошибка при удалении из корзины:', error);
        console.log('Не удалось удалить из корзины из-за ошибки сервера.');
    }
}

async function updateQuantity(productId, quantity) {
    const authToken = getAuthToken();
    if (!authToken) {
        console.log('Пожалуйста, войдите в систему.');
        return;
    }

    if (quantity <= 0) {
        removeFromCart(productId); // Если количество меньше или равно 0, удаляем товар из корзины
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ quantity: quantity })
        });

        if (response.ok) {
            loadCart(); // Обновляем отображение корзины
            updateCartCount(); // Обновляем счетчик корзины
        } else {
            const error = await response.json();
            console.log(`Не удалось обновить количество: ${error.message}`);
        }
    } catch (error) {
        console.error('Ошибка при обновлении количества:', error);
        console.log('Не удалось обновить количество из-за ошибки сервера.');
    }
}

//####################### КОНЕЦ КОРЗИНА #######################

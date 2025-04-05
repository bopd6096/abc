   // Функция для скрытия загрузочного экрана
            // function hideLoadingScreen() {
            //     const loadingScreen = document.getElementById('loadingScreen');
            //     if (loadingScreen) {
            //         loadingScreen.style.display = 'none'; // Скрываем загрузочный экран
            //         console.log('Загрузочный экран скрыт'); // Сообщение для отладки
            //     } else {
            //         console.log('Не найден элемент с id loadingScreen');
            //     }
            // }
            //
            // Скрываем загрузочный экран через 4 секунды
            // setTimeout(hideLoadingScreen, 4000);

            /*/ Скрыть загрузочный экран после полной загрузки страницы
window.addEventListener('load', function() {
    console.log('Страница загружена'); // Сообщение для отладки
    hideLoadingScreen();
}); */



//########################################################################################################################################################


// function logout() {
//     localStorage.removeItem('token');
//     document.getElementById('auth-block').style.display = 'block';
//     document.getElementById('protected-content').style.display = 'none';
//     document.getElementById('protected-data').textContent = '';
// }

// window.onload = () => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         try {
//           const username = jwt_decode(token).username;
//         } catch (error) {
//           console.error("Ошибка декодирования токена:", error);
//         }
//     }
// };




// function logout() {
//     localStorage.removeItem('token');
//     document.getElementById('auth-block').style.display = 'block';
//     document.getElementById('protected-content').style.display = 'none';
//     document.getElementById('protected-data').textContent = '';
// }

// window.onload = () => {
//     const token = localStorage.getItem('token');
//     if (token) {
//         try {
//           const username = jwt_decode(token).username;
//         } catch (error) {
//           console.error("Ошибка декодирования токена:", error);
//         }
//     }
// };



//########################################################################################################################################################


// function updateCartCount() {
//     const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
//     document.getElementById('cart-count').innerText = cartCount;
// }

/* cart.js */

// ... (предыдущий код)



//########################################################################################################################################################


// function openModal(productId) {
//    fetch(`https://dzshp24.com/api/products/${productId}`)
//     .then(response => response.json())
//     .then(productData => {
//         console.log(productId);
//             console.log(productData);       
//         })
//
//   document.getElementById("product-modal").style.display = "block";
// }







// <div id="product-modal" class="modal">
//    <div class="modal-content">
//             <span class="close" oneclick="closemodal()">&times;</span>
//         <img src="${product.preview_link}" alt="${product.name}" class="priduct-image">
//         <h3>${product.name}</h3>
//         <p>${product.description}</p>
//         <h6>идентификатор товара:   ${product.id}</h6>
//         <h6>артикул товара:   ${product.aricle}</h6>
//
//         <button class="add-to-cart" onclick="event.stoppropagation(); addtocart('${product._id}')">  ${product.uah} грн. </button>
//             </div>



//########################################################################################################################################################


//
// fetch('https://vtjvlad.ddns.net/api/products')
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     return response.json(); // Преобразуем ответ в JSON
//   })
//   .then((products) => {
//     console.log(products); // data - массив объектов (если API возвращает массив)
//   })
//   .catch(error => console.error('Ошибка:', error));
//


//########################################################################################################################################################


// function updateCartDisplay() {
//     const cartSection = document.getElementById('cart');
//     const cartList = cartSection.querySelector('.cart-items');
//
//     // Очистка текущего отображения
//     cartList.innerHTML = '';
//
//     let totalAmount = 0; // Общая сумма товаров
//
//     cart.forEach(item => {
//         const cartItem = document.createElement('div');
//         cartItem.classList.add('cart-item');
//         cartItem.innerHTML = `
//         <p>${item.name}</p>
//         <p>Цена: ${item.price} руб.</p>
//         <p>Количество: ${item.quantity}</p>
//         <button class="remove-from-cart" onclick="removeFromCart('${item.name}')">Удалить</button>
//         `;
//
//         cartList.appendChild(cartItem);
//
//         // Увеличиваем общую сумму на цену текущего товара с учетом его количества
//         totalAmount += item.price * item.quantity;
//     });
//
//     // Отображаем общую сумму и кнопку для оплаты, если корзина не пуста
//     if (cart.length > 0) {
//         const totalAmountDisplay = document.createElement('div');
//         totalAmountDisplay.classList.add('total-amount');
//         totalAmountDisplay.innerText = `Сумма к оплате: ${totalAmount} грн.`;
//
//         const checkoutButton = document.createElement('button');
//         checkoutButton.classList.add('checkout-button');
//         checkoutButton.innerText = 'Оплатить';
//         checkoutButton.onclick = () => {
//             // Здесь можно вызвать функцию для обработки оплаты
//             const isUserReady = confirm('Перейти к оплате');
//
//             showOrderForm();
//         };
//
//         cartList.appendChild(totalAmountDisplay);
//         cartList.appendChild(checkoutButton);
//     }
// }
//
// function updateCartCount() {
//     const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
//     document.getElementById('cart-count').innerText = cartCount;
// }
//



//########################################################################################################################################################

 // .catch(
        //     error => {
        //     console.error("Ошибка при Download данных о товаре:", error);
        // });
    // fetch(`/api/products/${productId}`)
    //   .then(response => response.json())
    //   .then(product => {
    //     // Заполнить модальное окно данными о товаре
    //   });




//########################################################################################################################################################

/* const burgerButton = document.getElementById('burgerButton');
const menu = document.getElementById('menu');
burgerButton.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'flex' ? 'none': 'flex';
});

document.getElementById('burgerButton').addEventListener('click', function() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('active');
    this.classList.toggle('active'); // Добавляем анимацию для кнопки
}); */





//########################################################################################################################################################


//
    // const navbar = document.querySelector('.navbar');
    // if (sectionId === 'catalog') {
    //     navbar.style.display = 'flex';
    // } else {
    //     navbar.style.display = 'none';
    // }



//########################################################################################################################################################


// Функция для обработки отправки формы
// document.getElementById('checkout-form').addEventListener('submit', (event) => {
//     event.preventDefault();
//
//     const name = document.getElementById('name').value;
//     const phone = document.getElementById('phone').value;
//     const email = document.getElementById('email').value;
//     const address = document.getElementById('address').value;
//     const paymentMethod = document.getElementById('payment-method').value;
//
//     // Здесь можно выполнить действия для отправки заказа на сервер
//     console.log("Заказ оформлен:", {
//         name, phone, email, address, paymentMethod,
//     });
//     alert("Ваш заказ успешно оформлен!");
//
//     // Очистка корзины и скрытие формы
//     cart = [];
//     loadCart();
//     document.getElementById('order-form').style.display = 'none';
// });
//
// Вызов функции для добавления обработчика после обновления корзины




//########################################################################################################################################################


/*

const categories = {
    category1: [
        {
            id: 1,
            name: "Товар 1",
            price: 100,
            description: "Описание товара 1",
            image: "img/product1.jpg"
        },
        {
            id: 2,
            name: "Товар 2",
            price: 200,
            description: "Описание товара 2",
            image: "img/product2.jpg"
        }
    ],
    category2: [
        {
            id: 3,
            name: "Товар 3",
            price: 300,
            description: "Описание товара 3",
            image: "img/product3.jpg"
        },
        {
            id: 4,
            name: "Товар 4",
            price: 400,
            description: "Описание товара 4",
            image: "img/product4.jpg"
        }
    ]
};
*/



//########################################################################################################################################################


  // Кнопка "До верху": отображение при прокрутке и плавный скролл
    // const backToTopBtn = document.getElementById('backToTop');
    // window.addEventListener('scroll', function() {
    //   backToTopBtn.style.display = (window.scrollY > 300) ? 'block' : 'none';
    // });
    // backToTopBtn.addEventListener('click', function() {
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    // });



//########################################################################################################################################################





//########################################################################################################################################################






//########################################################################################################################################################





//########################################################################################################################################################





//########################################################################################################################################################






//########################################################################################################################################################





//########################################################################################################################################################





//########################################################################################################################################################





//########################################################################################################################################################





//########################################################################################################################################################





//########################################################################################################################################################

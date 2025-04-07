
document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
displayProducts2(); 
displayProducts3();
displayProducts4(); 
displayProducts5();
displayProducts6();  
    loadCart(); // <-- Добавьте эту строку
    updateCartCount();
});

const storedProducts = localStorage.getItem('products');
const products = storedProducts ? JSON.parse(storedProducts) : [];

const items = products;
        
const groupedItems = items.reduce((acc, item) => {
  const key = item.category;  // Ключ, по которому группируем
  if (!acc[key]) {
    acc[key] = [];
  }
  acc[key].push(item);
  return acc;
}, {});

console.log(groupedItems);


const mediaItems = groupedItems["Media"];
const kitchenItems = groupedItems["Для кухні"];
const relaxItems = groupedItems["Для затишку"];
const homeItems = groupedItems["Для дому"];
const herItems = groupedItems["Для Неї"];
const barberItems = groupedItems["Для Догляду за волоссям"];

  




function displayProducts() {
    const catalogSection = document.querySelector("#catalog .products");
    catalogSection.innerHTML = "";

    relaxItems.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.dataset.productId = product._id;
        productCard.setAttribute("onclick", "toggleFlip(event)");

        productCard.innerHTML = `
            <div class="product-inner">
                <div class="product-front">
                    <img 
                        src="${product.preview_link}" 
                        alt="${product.name}" 
                        class="product-image" 
                        onclick="event.stopPropagation(); openProductModal('${product._id}')" 
                    >
                    <h3>${product.name}</h3>
                    <div class="price"><p>${product.UAH} грн.</p></div>
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product._id}')">В корзину</button>
                </div>
                <div class="product-back">
                    <h2>Описание продукта</h2>
                    <p>${product.description}</p>
                    <button class="more" onclick="event.stopPropagation(); openProductModal('${product._id}')">Подробнее</button> 
                </div>
            </div>
        `;

        catalogSection.appendChild(productCard);
    });
}

// Функция для открытия модального окна (не забудьте ее добавить)
function openProductModal(productId) {
    // Здесь ваш код для открытия модального окна и загрузки данных о товаре по ID
    console.log("Открываем модальное окно для товара с ID:", productId);
fetch(`https://vtjvlad.ddns.net/api/products/${productId}`)
    .then(response => {
            if (!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }) 
        .then(product => {
            renderModal(product);
            showModal();
        })
       }

function renderModal(product) {
    const  modalTitle = document.getElementById('modal-title');
    const  modalImg = document.getElementById('modal-img');
    const  modalDescription = document.getElementById('modal-description');
    const  modalId = document.getElementById('modal-id');
    const  modalIdShort = document.getElementById('modal-id-short');
    const  modalArticle = document.getElementById('modal-article');
    const  modalBuyBtn = document.getElementById('modal-buy-btn');
    const  modalPrice = document.getElementById('modal-price');
    const modalCount = document.getElementById('modal-count');


    modalTitle.textContent = product.name;
    modalImg.src = product.preview_link;
    modalImg.alt = product.name;
    modalDescription.innerHTML = product.description;
    modalIdShort.textContent = `ID: ${product.id}`;
    modalArticle.textContent = `Артикул: ${product.article}`;
    modalPrice.textContent = product.UAH;
    modalId.textContent = product._id;
    modalId.value = product._id;
    modalCount.textContent = `Залишилось: ${product.count}`;
    modalBuyBtn.setAttribute('onclick', `addToCart('${product._id}')`);
}


function showModal() {
    document.getElementById("product-modal").style.display = "block";
}
function closeModal(event) {
    document.getElementById("product-modal").style.display = "none";
}

function displayProducts2() {
    const catalogSection = document.querySelector("#catalog .products2");
    catalogSection.innerHTML = "";

    herItems.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.dataset.productId = product._id;
        productCard.setAttribute("onclick", "toggleFlip(event)");

        productCard.innerHTML = `
        <div class="product-inner">
        <div class="product-front">
         <img 
                        src="${product.preview_link}" 
                        alt="${product.name}" 
                        class="product-image" 
                        onclick="event.stopPropagation(); openProductModal('${product._id}')" 
                    >
        <h3>${product.name}</h3>
        <div class="price"><p>${product.UAH} грн.</p> </div>
        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product._id}')">В корзину</button>
        </div>
        <div class="product-back">
        <h2>Описание продукта</h2>
        <p>${product.description}</p>
                    <button class="more" onclick="event.stopPropagation(); openProductModal('${product._id}')">Подробнее</button> 
        </div>
        </div>
        `;

        catalogSection.appendChild(productCard);
    });
}


function displayProducts3() {
    const catalogSection = document.querySelector("#catalog .products3");
    catalogSection.innerHTML = "";

    barberItems.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.dataset.productId = product._id;
        productCard.setAttribute("onclick", "toggleFlip(event)");

        productCard.innerHTML = `
        <div class="product-inner">
        <div class="product-front">
        <img 
                        src="${product.preview_link}" 
                        alt="${product.name}" 
                        class="product-image" 
                        onclick="event.stopPropagation(); openProductModal('${product._id}')" 
                    >
        <h3>${product.name}</h3>
        <div class="price"><p>${product.UAH} грн.</p> </div>
        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product._id}')">В корзину</button>
        </div>
        <div class="product-back">
        <h2>Описание продукта</h2>
        <p>${product.description}</p>
                    <button class="more" onclick="event.stopPropagation(); openProductModal('${product._id}')">Подробнее</button> 
        </div>
        </div>
        `;

        catalogSection.appendChild(productCard);
    });
}

function displayProducts4() {
    const catalogSection = document.querySelector("#catalog .products4");
    catalogSection.innerHTML = "";

    kitchenItems.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.dataset.productId = product._id;
        productCard.setAttribute("onclick", "toggleFlip(event)");

        productCard.innerHTML = `
        <div class="product-inner">
        <div class="product-front">
         <img 
                        src="${product.preview_link}" 
                        alt="${product.name}" 
                        class="product-image" 
                        onclick="event.stopPropagation(); openProductModal('${product._id}')" 
                    >
        <h3>${product.name}</h3>
        <div class="price"><p>${product.UAH} грн.</p> </div>
        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product._id}')">В корзину</button>
        </div>
        <div class="product-back">
        <h2>Описание продукта</h2>
        <p>${product.description}</p>
                    <button class="more" onclick="event.stopPropagation(); openProductModal('${product._id}')">Подробнее</button> 
        </div>
        </div>
        `;

        catalogSection.appendChild(productCard);
    });
}

function displayProducts5() {
    const catalogSection = document.querySelector("#catalog .products5");
    catalogSection.innerHTML = "";

    homeItems.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.dataset.productId = product._id;
        productCard.setAttribute("onclick", "toggleFlip(event)");

        productCard.innerHTML = `
        <div class="product-inner">
        <div class="product-front">
         <img 
                        src="${product.preview_link}" 
                        alt="${product.name}" 
                        class="product-image" 
                        onclick="event.stopPropagation(); openProductModal('${product._id}')" 
                    >
        <h3>${product.name}</h3>
        <div class="price"><p>${product.UAH} грн.</p> </div>
        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product._id}')">В корзину</button>
        </div>
        <div class="product-back">
        <h2>Описание продукта</h2>
        <p>${product.description}</p>
                    <button class="more" onclick="event.stopPropagation(); openProductModal('${product._id}')">Подробнее</button> 
        </div>
        </div>
        `;

        catalogSection.appendChild(productCard);
    });
}

function displayProducts6() {
    const catalogSection = document.querySelector("#catalog .products6");
    catalogSection.innerHTML = "";

    mediaItems.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.dataset.productId = product._id;
        productCard.setAttribute("onclick", "toggleFlip(event)");

        productCard.innerHTML = `
        <div class="product-inner">
        <div class="product-front">
         <img 
                        src="${product.preview_link}" 
                        alt="${product.name}" 
                        class="product-image" 
                        onclick="event.stopPropagation(); openProductModal('${product._id}')" 
                    >
        <h3>${product.name}</h3>
        <div class="price"><p>${product.UAH} грн.</p> </div>
        <button class="add-to-cart" onclick="event.stopPropagation(); addToCart('${product._id}')">В корзину</button>
        </div>
        <div class="product-back">
        <h2>Описание продукта</h2>
        <p>${product.description}</p>
                    <button class="more" onclick="event.stopPropagation(); openProductModal('${product._id}')">Подробнее</button> 
        </div>
        </div>
        `;

        catalogSection.appendChild(productCard);
    });
}

function toggleFlip(event) {
    if (!event.target.classList.contains('add-to-cart') && event.target.tagName !== 'IMG') {
        event.currentTarget.classList.toggle('flipped');
    }
}


const burgerButton = document.getElementById('burgerButton');
const menu = document.getElementById('menu');

// Переключение бургер-меню
burgerButton.addEventListener('click', () => {
    if (menu.classList.contains('active')) {
        // Закрытие меню
        menu.style.maxHeight = '0';
        menu.style.padding = '0';
        setTimeout(() => {
            menu.classList.remove('active'); // Убираем класс после завершения анимации
            menu.style.maxHeight = '700px'; // Сбрасываем инлайновый стиль
            menu.style.padding = '';
        }, 300); // Учитываем длительность анимации
    } else {
        // Открытие меню
        menu.classList.add('active');
        menu.style.maxHeight = menu.scrollHeight + 'px'; // Автоматическая высота
        menu.style.padding = '10px'; // Добавляем отступы
    }
    burgerButton.classList.toggle('active'); // Поворот кнопки
});

// Закрытие меню при выборе элемента
menu.querySelectorAll('a').forEach((menuItem) => {
    menuItem.addEventListener('click', () => {
        menu.style.maxHeight = '0';
        menu.style.padding = '0';
        setTimeout(() => {
            menu.classList.remove('active'); // Убираем класс после завершения анимации
            menu.style.maxHeight = '700px'; // Сбрасываем инлайновый стиль
            menu.style.padding = '';
        }, 300); // Учитываем длительность анимации
        burgerButton.classList.remove('active'); // Возвращаем кнопку в исходное состояние
    });
});


function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach((section) => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
        const navbarbot = document.querySelector('.navbarbot');
    const sectionsWithNavbar = ['user',
        'catalog',
        'cart',
        'payment',
        'delivery',
        'home',
        'order-history',
        'users-tag-items',
        'top-sujestions']; // вкладки, где отображается нижний бар

    if (sectionsWithNavbar.includes(sectionId)) {
        navbarbot.style.display = 'flex';
    } else {
        navbarbot.style.display = 'none';
    }
}


let cart = [];

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (event) => {
        const productCard = event.target.closest('.product-card');
        const productName = productCard.querySelector('h3').innerText;
        const productPrice = productCard.querySelector('.price').innerText;

        addToCart(productName, productPrice);
        event.stopPropagation();
    });
});




function renderCategoryProducts(categoryId, container) {
    container.innerHTML = ""; // Очищаем контейнер
    categories[categoryId].forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");
        productCard.innerHTML = `
        <img src="${product.preview_link}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="price">${product.UAH} </span>
        `;
        container.appendChild(productCard);
    });
}






// Вызов функции при загрузке страницы
displayProducts();
displayProducts2(); 
displayProducts3();
displayProducts4(); 
displayProducts5();
displayProducts6(); 



// Функция для показа формы оформления заказа
function showOrderForm() {
    console.log("показ чекаута");
    const orderForm = document.getElementById('order-form');
    orderForm.style.display = 'grid';
}
function hideOrderForm() {
    const orderForm = document.getElementById('order-form');
    orderForm.style.display = 'none';
}






document.getElementById('checkout-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const paymentMethod = document.getElementById('payment-method').value;

    const orderData = {
        name,
        phone,
        email,
        address,
        paymentMethod,
        cart: getCartItems() //  Функция для получения товаров из корзины (см. ниже)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/checkout`, {  // Замените на ваш URL для оформления заказа
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}` // Используйте функцию для получения токена
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Заказ успешно оформлен:', data);
alert(`Заказ успешно оформлен! Номер вашего заказа: ${data.orderId}`);

                // Опционально: Перенаправление на страницу благодарности
                window.location.href = 'thenk-you.html'; // <-- Добавлена переадресация

            // Опционально: Перенаправление на страницу платежного шлюза
            // window.location.href = data.paymentUrl;

            // Очистка корзины (если нужно)
            clearCart();
            loadCart();
            showSection('home'); // Перенаправляем на главную страницу после оформления заказа
        } else {
            const error = await response.json();
            console.error('Ошибка при оформлении заказа:', error);
            alert(`Ошибка при оформлении заказа: ${error.message}`);
        }
    } catch (error) {
        console.error('Ошибка при отправке данных заказа:', error);
        alert('Ошибка при отправке данных заказа. Пожалуйста, попробуйте позже.');
    }
});

// Функция для очистки корзины (пример, нужно реализовать в cart.js, если вы храните корзину на клиенте)
function clearCart() {
    // Реализация очистки корзины (например, удаление из localStorage или Cookie)
    localStorage.removeItem('cart'); // Пример для localStorage
}

// Функция для получения товаров из корзины (нужно реализовать в cart.js)
function getCartItems() {
    // Пример: получение товаров из localStorage
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}








loadCart();
addCheckoutButtonListener();

document.querySelector('.burger-menu').addEventListener('click', function() {
    this.classList.toggle('active');
});

const toggleNavbarButton = document.getElementById('toggleNavbar');
const navbar = document.querySelector('.navbar');

toggleNavbarButton.addEventListener('click', () => {
    navbar.classList.toggle('hidden');

    // Обновляем текст кнопки в зависимости от состояния
    toggleNavbarButton.innerText = navbar.classList.contains('hidden')
    ? 'Показать навигацию': 'Скрыть навигацию';
});

function toggleCategory(header, categoryId) {
    const categoryCard = header.parentElement; // Родительский элемент (карточка категории)
    const categoryContent = document.getElementById(categoryId);
    const background = categoryCard.getAttribute('data-bg'); // Получаем фон категории



    if (categoryCard.classList.contains('expanded')) {
        // Закрываем категорию
        categoryCard.classList.remove('expanded');
    } else {
        // Закрываем другие категории
        document.querySelectorAll('.category-card').forEach(card => card.classList.remove('expanded'));

        // Открываем текущую категорию
        categoryCard.classList.add('expanded');

    window.scrollTo({ top: categoryCard.offsetTop, behavior: 'smooth' });
        // Устанавливаем фон для контента и шапки
        header.style.backgroundImage = `url(${background})`;
        if (categoryContent) {
            categoryContent.style.backgroundImage = `url(${background})`;
        }

        // Загружаем товары, если они ещё не были загружены
        if (categoryContent && categoryContent.innerHTML.trim() === "") {
            renderCategoryProducts(categoryId, categoryContent);
        }
    }
}

  
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


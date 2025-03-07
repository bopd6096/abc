import { debounce } from 'lodash';

let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
  loadProducts(currentPage);
  document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
});

async function loadProducts(page) {
  try {
    const response = await fetch(`/api/products?page=${page}`);
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function renderProducts(products) {
  const container = document.getElementById('product-container');
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-id', product._id);
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p><strong>${product.price} грн</strong></p>
      <button onclick="addToCart('${product._id}')">Додати в кошик</button>
    `;
    container.appendChild(card);
  });
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Товар додано до кошика!");
}

// Бескінечна прокрутка
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    currentPage++;
    loadProducts(currentPage);
  }
});

// Динамічний пошук
document.getElementById('searchInput').addEventListener('input', debounce(async function() {
  const query = this.value;
  if (query.length < 3) return;
  
  try {
    const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
    const products = await response.json();
    const container = document.getElementById('product-container');
    container.innerHTML = '';
    renderProducts(products);
  } catch (error) {
    console.error('Error searching products:', error);
  }
}, 300));


// frontend/js/cart.js
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

async function renderCart() {
  const container = document.getElementById('cartContainer');
  let cart = getCart();
  if (!cart.length) {
    container.innerHTML = "<p>Кошик порожній.</p>";
    return;
  }
  
  // Завантаження деталей товарів із бекенду
  const productsResponse = await fetch(`/api/products?ids=${cart.join(',')}`);
  const products = await productsResponse.json();
  
  container.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <h3>${product.name}</h3>
      <p>${product.price} грн</p>
      <button onclick="removeFromCart('${product._id}')">Видалити</button>
    `;
    container.appendChild(div);
  });
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(itemId => itemId !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}




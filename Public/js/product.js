
// frontend/js/product.js
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  if (!productId) return;try {
    const response = await fetch(`/api/products/${productId}`);
    const product = await response.json();
    renderProduct(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
  }
});

function renderProduct(product) {
  const container = document.getElementById('product-detail');
  if (!container) return;
  
  container.innerHTML = `
    <div class="product-detail-card">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      <div class="product-info">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
        <p><strong>${product.price} грн</strong></p>
        <label for="quantity">Кількість:</label>
        <input type="number" id="quantity" value="1" min="1">
        <button onclick="addToCart('${product._id}')">Додати в кошик</button>
      </div>
    </div>
  `;
}




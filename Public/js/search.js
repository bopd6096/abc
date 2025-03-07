// Додатковий модуль для розширеного пошуку (за бажанням)
// Приклад: відображення результатів пошуку у окремому контейнері
document.getElementById('searchInput').addEventListener('input', debounce(async function() {
  const query = this.value;
  if (query.length < 3) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }
  
  try {
    const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
    const products = await response.json();
    displaySearchResults(products);
  } catch (error) {
    console.error('Error during search:', error);
  }
}, 300));

function displaySearchResults(products) {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `<strong>${product.name}</strong> - ${product.price} грн`;
    div.addEventListener('click', () => {
      // Прокрутка до товару або відкриття сторінки товару
      window.scrollTo({ top: document.querySelector(`[data-id="${product._id}"]`).offsetTop, behavior: 'smooth' });
      resultsContainer.innerHTML = '';
    });
    resultsContainer.appendChild(div);
  });
}

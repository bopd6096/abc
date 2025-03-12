// frontend/js/catalog.js
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('catalogSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  const sortOptions = document.getElementById('sortOptions');
  const container = document.getElementById('catalogContainer');
  
  function loadCatalog() {
    let query = '';
    if (searchInput.value) {
      query += `&search=${encodeURIComponent(searchInput.value)}`;
    }
    if (categoryFilter.value) {
      query += &category=${encodeURIComponent(categoryFilter.value)};
    }
    if (sortOptions.value) {
      query += &sort=${encodeURIComponent(sortOptions.value)};
    }
    
    fetch(`/api/products?${query}`)
      .then(res => res.json())
      .then(products => {
        container.innerHTML = '';
        products.forEach(product => {
          const card = document.createElement('div');
          card.className = 'product-card';
          card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p>${product.price} грн</p>
            <button onclick="location.href='product.html?id=${product._id}'">Детальніше</button>
          `;
          container.appendChild(card);
        });
      })
      .catch(err => console.error('Catalog error:', err));
  }
  
  searchInput?.addEventListener('input', debounce(loadCatalog, 300));
  categoryFilter?.addEventListener('change', loadCatalog);
  sortOptions?.addEventListener('change', loadCatalog);
  
  loadCatalog();
});




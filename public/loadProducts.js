
async function lodaProducts() {
    try {
const response = await fetch('https://vtjvlad.ddns.net/api/products');
        products = await response.json();
        
    console.log(products); // data - массив объектов (если API возвращает массив)
        localStorage.setItem('products', JSON.stringify(products)); // Сохраняем данные в localStorage
            console.log("Данные о товарах успешно сохранены в localStorage.");
    } catch {
console.error('Error', error);
console.error("Некорректные данные о товарах.");
    }
}

    lodaProducts();



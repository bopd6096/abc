// Простий модуль для роботи з кошиком (при потребі)
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function updateCartCount() {
  const cart = getCart();
  // Припустимо, є елемент з id "cart-count" для відображення кількості товарів
  document.getElementById("cart-count").textContent = cart.length;
}

export { getCart, updateCartCount };

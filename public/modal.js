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







function openModal() {
  document.getElementById("product-modal").style.display = "block";
}

function closeModal() {
  document.getElementById("product-modal").style.display = "none";
}

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


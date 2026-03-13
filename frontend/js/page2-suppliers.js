// Page 2 Suppliers Management

const Suppliers = {

async loadAvailableSuppliers(){

const token = localStorage.getItem("token");

const res = await fetch(
"http://localhost:5000/api/suppliers/all",
{
headers:{ Authorization:"Bearer "+token }
});

const suppliers = await res.json();

const grid = document.getElementById("availableSuppliersGrid");

if(!suppliers.length){

grid.innerHTML = '<p class="empty-state">No suppliers available</p>';
return;

}

grid.innerHTML = suppliers.map(s=>`

<div class="supplier-card" id="supplier-${s._id}">

<div class="supplier-info">
<div class="supplier-name">${s.name}</div>
<div class="supplier-detail">${s.role}</div>
</div>

<div class="supplier-actions">

<button class="btn btn-primary"
onclick="requestSupplier('${s._id}')">
Request Supplier
</button>

</div>

</div>

`).join("");

},


async loadApprovedSuppliers(){

const token = localStorage.getItem("token");

const res = await fetch(
"http://localhost:5000/api/supplier-request/approved",
{
headers:{ Authorization:"Bearer "+token }
});

const data = await res.json();

const grid = document.getElementById("approvedSuppliersGrid");

if(!data.length){

grid.innerHTML =
'<p class="empty-state">No approved suppliers yet</p>';

return;

}

grid.innerHTML = data.map(req=>`

<div class="supplier-card">

<div class="supplier-info">
<div class="supplier-name">${req.supplier.name}</div>
</div>

<div class="supplier-actions">

<button class="btn btn-secondary"
onclick="viewSupplierProducts('${req.supplier._id}')">
View Products
</button>

<button class="btn btn-danger"
onclick="deleteSupplier('${req.supplier._id}')">
Remove Supplier
</button>

</div>

</div>

`).join("");

}

};



/* ----------------------------
   Request Supplier
-----------------------------*/
async function requestSupplier(supplierId){

const token = localStorage.getItem("token");

const res = await fetch(
"http://localhost:5000/api/supplier-request",
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},
body:JSON.stringify({ supplierId })
});

const data = await res.json();

showToast(data.message || "Request sent");


// remove supplier card immediately
const card = document.getElementById(`supplier-${supplierId}`);
if(card){
card.remove();
}

}



/* ----------------------------
   View Supplier Products
-----------------------------*/

async function viewSupplierProducts(supplierId){

const token = localStorage.getItem("token");

const res = await fetch(
`http://localhost:5000/api/products/by-supplier/${supplierId}`,
{
headers:{ Authorization:"Bearer "+token }
});

const products = await res.json();

const productsList = document.getElementById("supplierProductsList");

if(!products || products.length === 0){

productsList.innerHTML =
'<p class="empty-state">No products available from this supplier</p>';

openModal("productsModal");

return;

}

productsList.innerHTML = products.map(product => `

<div style="padding:15px;border:1px solid #e0e0e0;border-radius:4px;margin-bottom:10px">

<div style="display:flex;justify-content:space-between;margin-bottom:10px">

<strong>${product.name}</strong>

<span>₹${product.price}</span>

</div>

<div style="font-size:13px;color:#666">

GST: ${product.gst}% | Stock: ${product.stock}

</div>

<button class="btn btn-primary"
onclick="addToCart('${product.owner}','${product.name}','${product.price}','${product.gst}')">
Add to Cart
</button>

</div>

`).join("");

openModal("productsModal");

}



/* ----------------------------
   Close Products Modal
-----------------------------*/

function closeProductsModal(){

closeModal("productsModal");

}



/* ----------------------------
   Add Product To Cart
-----------------------------*/

async function addToCart(supplier,name,price,gst){

const token = localStorage.getItem("token");

const res = await fetch(
"http://localhost:5000/api/supplier-request/approved",
{
headers:{ Authorization:"Bearer "+token }
});

const approved = await res.json();

const allowed = approved.some(s => s.supplier._id === supplier);

if(!allowed){

showToast("Supplier not approved yet","error");
return;

}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

cart.push({
supplier,
name,
price,
gst
});

localStorage.setItem("cart",JSON.stringify(cart));

window.location.href="page2-cart.html";

}



/* ----------------------------
   Initialize Page
-----------------------------*/

document.addEventListener("DOMContentLoaded",function(){

Suppliers.loadAvailableSuppliers();
Suppliers.loadApprovedSuppliers();

// auto refresh every 10 seconds
setInterval(()=>{
Suppliers.loadAvailableSuppliers();
Suppliers.loadApprovedSuppliers();
},10000);

});
async function deleteSupplier(id){

if(!confirm("Remove this supplier?")) return;

const token = localStorage.getItem("token");

try{

await fetch(
`http://localhost:5000/api/supplier-request/remove/${id}`,
{
method:"DELETE",
headers:{ Authorization:"Bearer "+token }
});

alert("Supplier removed");

Suppliers.loadApprovedSuppliers();
Suppliers.loadAvailableSuppliers();

}catch(err){

console.error(err);
alert("Failed to remove supplier");

}

}
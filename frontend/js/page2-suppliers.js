// Page 2 Suppliers Management

function ensureRetailerPage() {
  const role = localStorage.getItem('role');
  if (!role) {
    window.location.href = 'index.html';
    return false;
  }
  if (role === 'wholesaler' || role === 'manufacturer' || role === 'distributor') {
    window.location.href = 'page1-dashboard.html';
    return false;
  }
  return true;
}

const Suppliers = {

async loadAvailableSuppliers(){

const token = localStorage.getItem("token");

const res = await fetch(
"http://localhost:5000/api/suppliers/all",
{
headers:{ Authorization:"Bearer "+token }
});

const suppliers = await res.json();

// Remove suppliers that have already been requested/approved
const requestsRes = await fetch(
  "http://localhost:5000/api/supplier-request/my-requests",
  {
    headers:{ Authorization:"Bearer "+token }
  }
);
const requests = await requestsRes.json();
const excludedSupplierIds = (requests || [])
  .filter(r => r.status === 'pending' || r.status === 'approved')
  .map(r => (r.supplier?._id || r.supplier || '').toString());

const availableSuppliers = (suppliers || []).filter(
  s => !excludedSupplierIds.includes(s._id.toString())
);

const grid = document.getElementById("availableSuppliersGrid");

if(!availableSuppliers.length){

  grid.innerHTML = '<p class="empty-state">No suppliers available</p>';
  return;

}

grid.innerHTML = availableSuppliers.map(s=>`

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
onclick="viewSupplierProducts('${req.supplier?._id || req.supplier}')">
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

  // Check if already requested
  try {
    const requestsRes = await fetch(
      "http://localhost:5000/api/supplier-request/my-requests",
      {
        headers:{ Authorization:"Bearer "+token }
      }
    );
    const requests = await requestsRes.json();
    const alreadyRequested = (requests || []).some(r => r.supplier?._id === supplierId || r.supplier === supplierId);

    if (alreadyRequested) {
      alert("You have already requested this supplier");
      return;
    }
  } catch (err) {
    console.error("Failed to check existing requests", err);
  }

  const res = await fetch(
    "http://localhost:5000/api/supplier-request",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        Authorization:"Bearer "+token
      },
      body:JSON.stringify({ supplierId })
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to send request");
    console.error("Supplier request failed", data);
    return;
  }

  alert(data.message || "Request sent");

  // remove supplier card immediately
  const card = document.getElementById(`supplier-${supplierId}`);
  if(card){
    card.remove();
  }

  // note: the supplier will see this request on their notifications page
}



/* ----------------------------
   View Supplier Products
-----------------------------*/

async function viewSupplierProducts(supplierId){
  window.location.href = `supplier-products.html?supplierId=${supplierId}`;
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

async function addToCart(productId, supplierId, name, price, gst, stock){
  const token = localStorage.getItem("token");

  // Ensure supplier is approved
  const res = await fetch(
    "http://localhost:5000/api/supplier-request/approved",
    {
      headers:{ Authorization:"Bearer "+token }
    }
  );

  const approved = await res.json();
  const allowed = approved.some(s => s.supplier._id === supplierId);

  if(!allowed){
    alert("Supplier not approved yet");
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Enforce single supplier per cart
  if(cart.length > 0 && cart[0].supplierId !== supplierId){
    const ok = confirm("Your cart already contains items from a different supplier. Clear cart and add this item?");
    if(!ok) return;
    cart = [];
  }

  cart.push({
    productId,
    supplierId,
    name,
    price: Number(price),
    gst: Number(gst),
    stock: Number(stock),
    quantity: 1
  });

  localStorage.setItem("cart",JSON.stringify(cart));

  window.location.href="page2-cart.html";
}



/* ----------------------------
   Initialize Page
-----------------------------*/

document.addEventListener("DOMContentLoaded",function(){
  if (!ensureRetailerPage()) return;

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
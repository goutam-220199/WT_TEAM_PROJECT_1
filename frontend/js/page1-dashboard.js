// Page 1 Dashboard (Wholesaler / Manufacturer / Distributor)

const Dashboard = {

products: [],
invoices: [],

async loadProducts() {

const token = localStorage.getItem("token");

const res = await fetch("http://localhost:5000/api/products/my-products", {

headers:{
"Authorization":"Bearer "+token
}

});

this.products = await res.json();

},

async loadInvoices(){

const token = localStorage.getItem("token");

const res = await fetch("http://localhost:5000/api/invoices/my-invoices",{

headers:{
"Authorization":"Bearer "+token
}

});

this.invoices = await res.json();

},

async loadDashboardStats(){

await this.loadProducts();
await this.loadInvoices();

const totalProducts = this.products.length;

const totalSalesAmount = this.invoices.reduce((sum,i)=>sum + (i.total || 0),0);

const totalOrders = this.invoices.length;

const lowStockProducts = this.products.filter(p => p.stock < 10);

document.getElementById("totalProducts").textContent = totalProducts;

document.getElementById("totalSales").textContent =
"₹" + totalSalesAmount.toLocaleString();

document.getElementById("totalOrders").textContent = totalOrders;

document.getElementById("lowStockCount").textContent = lowStockProducts.length;

this.loadRecentSales();
this.loadLowStockAlerts();

},

loadRecentSales(){

const tbody = document.getElementById("recentSalesBody");

const recent = this.invoices.slice(-5).reverse();

if(recent.length === 0){

tbody.innerHTML =
'<tr><td colspan="5" class="empty-state">No recent sales yet</td></tr>';

return;

}

tbody.innerHTML = recent.map(inv => `

<tr>

<td>${inv._id}</td>

<td>${new Date(inv.createdAt).toLocaleDateString()}</td>

<td>${inv.product?.name || "Product"}</td>

<td>${inv.quantity}</td>

<td>₹${inv.total}</td>

</tr>

`).join("");

},

loadLowStockAlerts(){

const container = document.getElementById("lowStockAlerts");

const lowStock = this.products.filter(p => p.stock < 10);

if(lowStock.length === 0){

container.innerHTML =
'<p class="empty-state">No low stock items</p>';

return;

}

container.innerHTML = lowStock.map(product => `

<div class="alert">

<div class="alert-title">⚠️ Low Stock: ${product.name}</div>

<div class="alert-message">
Current stock: ${product.stock} units. Please reorder soon.
</div>

</div>

`).join("");

}

};


// Initialize
document.addEventListener("DOMContentLoaded", function(){

Dashboard.loadDashboardStats();

setInterval(() => {

Dashboard.loadDashboardStats();

},30000);

});
async function loadDashboard(){

const token = localStorage.getItem("token");

const res = await fetch("http://localhost:5000/api/invoices/stats",{

headers:{
"Authorization":"Bearer "+token
}

});

const stats = await res.json();

document.getElementById("totalSales").innerText = stats.totalSales;
document.getElementById("totalInvoices").innerText = stats.totalInvoices;

}
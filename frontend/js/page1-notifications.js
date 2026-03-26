// Page 1 Notifications (Supplier Requests)

const Notifications = {

async loadRequests(){
  try {

    const token = localStorage.getItem("token");

    if(!token){
      console.error("Token not found");
      return;
    }

    const res = await fetch(
      "http://localhost:5000/api/supplier-request/my-requests",
      {
        headers:{ Authorization:"Bearer "+token }
      }
    );

    if(!res.ok){
      const err = await res.json().catch(()=>({message:'Failed to load requests'}));
      throw new Error(err.message || 'Failed to load requests');
    }

    const requests = await res.json();

    // Also load incoming orders for this supplier
    const ordersRes = await fetch("http://localhost:5000/api/orders/supplier", {
      headers:{ Authorization:"Bearer "+token }
    });

    if(!ordersRes.ok){
      const err = await ordersRes.json().catch(()=>({message:'Failed to load orders'}));
      throw new Error(err.message || 'Failed to load orders');
    }

    const orders = await ordersRes.json();
    console.log("[Notifications] Loaded orders:", orders);

    // Also load products to check for general low stock
    const productsRes = await fetch("http://localhost:5000/api/products/my-products", {
      headers:{ Authorization:"Bearer "+token }
    });
    const products = await productsRes.json();
    const lowStockProducts = (products || []).filter(p => p.stock < 10);

    const container = document.getElementById("notificationsList");
    if(!container) return;

    const requestCount = (requests || []).length;
    const orderCount = (orders || []).filter(o => o.lowStockAlert === true || o.status === 'low_stock').length;
    const lowStockProdCount = (lowStockProducts || []).length;

    if (requestCount === 0 && orderCount === 0 && lowStockProdCount === 0) {
      container.innerHTML = `<p class="empty-state">No new notifications</p>`;
      return;
    }

    // 1. Retailer Connection Requests
    const requestHtml = (requests || []).map(req => {
      const retailerName = req.retailer?.name || 'Retailer';
      const showActions = req.status === 'pending';
      return `
        <div class="notification-item unread">
          <div class="notification-header">
            <div class="notification-type">🔔 Request from ${retailerName}</div>
            <div class="notification-time">${getTimeAgo(req.createdAt)}</div>
          </div>
          <div class="notification-content">
            <strong>${retailerName}</strong>
            <p>${retailerName} is requesting to connect.</p>
          </div>
          <div class="notification-action">
            ${showActions ? `
              <button class="btn btn-primary" onclick="approveRequest('${req._id}')">Approve</button>
              <button class="btn btn-danger" onclick="rejectRequest('${req._id}')">Reject</button>
            ` : `<span class="status-tag">${req.status}</span>`}
          </div>
        </div>
      `;
    }).join("");

    // 2. Low Stock Alerts from Orders
    const orderHtml = (orders || [])
    .filter(o => o.lowStockAlert === true || o.status === 'low_stock')
    .map(order => {
        const productNames = order.items.map(i => i.name).join(', ');
        return `
          <div class="notification-item unread" style="border-left: 5px solid #ff9800; background: #fffaf0;">
            <div class="notification-header">
              <div class="notification-type" style="color: #e67e22; font-weight: bold;">⚠️ LOW STOCK ORDER ALERT</div>
              <div class="notification-time">${getTimeAgo(order.createdAt)}</div>
            </div>
            <div class="notification-content">
              <strong>Order #${order._id.slice(-6).toUpperCase()} - ${order.retailer?.name || 'Retailer'}</strong>
              <p>Items needing stock attention: <strong>${productNames}</strong>.</p>
            </div>
          </div>
        `;
    }).join("");

    // 3. General Low Stock Product Alerts
    const productHtml = lowStockProducts.map(p => `
      <div class="notification-item unread" style="border-left: 5px solid #f44336; background: #fff5f5;">
        <div class="notification-header">
          <div class="notification-type" style="color: #c0392b; font-weight: bold;">🚩 CRITICAL: LOW INVENTORY</div>
          <div class="notification-time">Real-time status</div>
        </div>
        <div class="notification-content">
          <strong>${p.name}</strong>
          <p>This product is running low. Current stock: <span style="color: #c0392b; font-weight: bold;">${p.stock} units</span>.</p>
        </div>
      </div>
    `).join("");

    container.innerHTML = requestHtml + orderHtml + productHtml;

  } catch (error) {
    console.error("[Notifications] loadRequests error", error);
    const container = document.getElementById("notificationsList");
    if (container) {
      container.innerHTML = `<p class="empty-state">Failed to load notifications</p>`;
    }
  }

}

};


/* ----------------------------
   Approve Request
-----------------------------*/

async function approveRequest(id){

const token = localStorage.getItem("token");

if(!token) return;

try{

const res = await fetch(
`http://localhost:5000/api/supplier-request/approve/${id}`,
{
method:"PUT",
headers:{ Authorization:"Bearer "+token }
});

if(!res.ok) throw new Error("Approve failed");

if(typeof showToast === "function"){
showToast("Retailer request approved","success");
}

Notifications.loadRequests();

}catch(err){
console.error(err);
}

}



/* ----------------------------
   Reject Request
-----------------------------*/

async function rejectRequest(id){

const token = localStorage.getItem("token");

if(!token) return;

try{

const res = await fetch(
`http://localhost:5000/api/supplier-request/reject/${id}`,
{
method:"PUT",
headers:{ Authorization:"Bearer "+token }
});

if(!res.ok) throw new Error("Reject failed");

if(typeof showToast === "function"){
showToast("Retailer request rejected","success");
}

Notifications.loadRequests();

}catch(err){
console.error(err);
}

}


/* ----------------------------
   Time Ago Helper
-----------------------------*/

function getTimeAgo(dateString){

const date = new Date(dateString);
const now = new Date();
const seconds = Math.floor((now - date) / 1000);

if(seconds < 60) return "Just now";
if(seconds < 3600) return Math.floor(seconds/60)+"m ago";
if(seconds < 86400) return Math.floor(seconds/3600)+"h ago";
if(seconds < 604800) return Math.floor(seconds/86400)+"d ago";

return date.toLocaleDateString();

}



/* ----------------------------
   Initialize Page
-----------------------------*/

document.addEventListener("DOMContentLoaded",function(){

Notifications.loadRequests();

setInterval(() => {
Notifications.loadRequests();
}, 8000);

});
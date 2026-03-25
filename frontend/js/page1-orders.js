// Page 1 Orders Management

const Orders = {
    orders: [],

    async loadOrders() {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/orders/supplier', {
            headers: { Authorization: 'Bearer ' + token }
        });

        this.orders = await res.json();
        this.renderOrders();
    },

    renderOrders() {
        const grid = document.getElementById('ordersGrid');

        grid.innerHTML = this.orders.length === 0
            ? '<p class="empty-state">No orders found</p>'
            : this.orders.map(order => this.renderOrderCard(order)).join('');
    },

    renderOrderCard(order) {
        const total = order.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const products = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

        return `
            <div class="order-card" style="width: 100%; max-width: none;">
                <div class="order-header">
                    <div class="order-id">Order #${order._id.slice(-6).toUpperCase()}</div>
                    <div class="order-status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
                </div>
                <div class="order-info">
                    <strong>Retailer:</strong> ${order.retailer?.name || 'N/A'}<br>
                    <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
                    <strong>Products:</strong> ${products}<br>
                    <strong>Total Amount:</strong> ₹${total.toFixed(2)}
                </div>
                <div class="order-actions">
                    <button class="btn btn-secondary" disabled>Automatically Approved</button>
                    <button class="btn btn-primary" onclick="viewOrderDetails('${order._id}')">View Details</button>
                </div>
            </div>
        `;
    }
};

function viewOrderDetails(orderId) {
    // Placeholder for viewing details if needed, for now just show a message
    showToast('Order details for ' + orderId, 'info');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    Orders.loadOrders();
});

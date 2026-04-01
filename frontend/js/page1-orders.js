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
        const approvedGrid = document.getElementById('approvedOrdersGrid');

        const approved = this.orders.filter(o => o.status === 'approved');

        approvedGrid.innerHTML = approved.length === 0
            ? '<p class="empty-state">No approved orders</p>'
            : approved.map(order => this.renderOrderCard(order)).join('');
    },

    renderOrderCard(order) {
        const total = order.items.reduce((sum, item) => sum + (item.total || 0), 0);
        
        const productsHtml = order.items.map(i => `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding: 4px 0;">
                <span>${i.product?.name || i.name || 'Unknown Product'} (x${i.quantity})</span>
                <span>₹${(i.total || i.price * i.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        return `
            <div class="order-card" style="width: 100%;">
                <div class="order-header">
                    <div class="order-id">Order #${order._id.slice(-6).toUpperCase()}</div>
                    <div class="order-status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
                </div>
                <div class="order-info">
                    <strong>Retailer:</strong> ${order.retailer?.name || 'N/A'}<br>
                    <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
                    <strong>Ordered Products:</strong>
                    <div style="margin-top: 8px; margin-bottom: 12px; background: #fafafa; padding: 10px; border-radius: 4px;">
                        ${productsHtml}
                    </div>
                    <div style="text-align: right; font-size: 1.1em;"><strong>Total Amount:</strong> ₹${total.toFixed(2)}</div>
                </div>
            </div>
        `;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    Orders.loadOrders();
});

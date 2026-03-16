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
        const pendingGrid = document.getElementById('pendingOrdersGrid');
        const approvedGrid = document.getElementById('approvedOrdersGrid');
        const rejectedGrid = document.getElementById('rejectedOrdersGrid');

        const pending = this.orders.filter(o => o.status === 'pending');
        const approved = this.orders.filter(o => o.status === 'approved');
        const rejected = this.orders.filter(o => o.status === 'rejected');

        pendingGrid.innerHTML = pending.length === 0
            ? '<p class="empty-state">No pending orders</p>'
            : pending.map(order => this.renderOrderCard(order)).join('');

        approvedGrid.innerHTML = approved.length === 0
            ? '<p class="empty-state">No approved orders</p>'
            : approved.map(order => this.renderOrderCard(order)).join('');

        rejectedGrid.innerHTML = rejected.length === 0
            ? '<p class="empty-state">No rejected orders</p>'
            : rejected.map(order => this.renderOrderCard(order)).join('');
    },

    renderOrderCard(order) {
        const total = order.items.reduce((sum, item) => sum + (item.total || 0), 0);
        const products = order.items.map(i => `${i.name} (x${i.quantity})`).join(', ');

        return `
            <div class="order-card">
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
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success" onclick="approveOrder('${order._id}')">Approve</button>
                        <button class="btn btn-danger" onclick="rejectOrder('${order._id}')">Reject</button>
                    ` : `
                        <button class="btn btn-secondary" disabled>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</button>
                    `}
                </div>
            </div>
        `;
    },

    async approveOrder(orderId) {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/orders/approve/${orderId}`, {
            method: 'PUT',
            headers: { Authorization: 'Bearer ' + token }
        });
        showToast('Order approved successfully!', 'success');
        await this.loadOrders();
    },

    async rejectOrder(orderId) {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/orders/reject/${orderId}`, {
            method: 'PUT',
            headers: { Authorization: 'Bearer ' + token }
        });
        showToast('Order rejected!', 'success');
        await this.loadOrders();
    }
};

function approveOrder(orderId) {
    Orders.approveOrder(orderId);
}

function rejectOrder(orderId) {
    Orders.rejectOrder(orderId);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    Orders.loadOrders();
});

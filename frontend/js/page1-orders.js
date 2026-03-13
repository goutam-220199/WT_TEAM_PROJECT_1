// Page 1 Orders Management
const Orders = {
    data: JSON.parse(localStorage.getItem('page1Data')) || {
        products: [],
        orders: [],
        sales: [],
        invoices: []
    },

    saveData() {
        localStorage.setItem('page1Data', JSON.stringify(this.data));
    },

    loadOrders(filter = '') {
        const grid = document.getElementById('ordersGrid');
        
        let orders = this.data.orders;
        if (filter) {
            orders = orders.filter(o => o.status === filter);
        }

        if (orders.length === 0) {
            grid.innerHTML = '<p class="empty-state">No orders yet</p>';
            return;
        }

        grid.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">Order #${order.id.slice(-6).toUpperCase()}</div>
                    <div class="order-status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
                </div>
                <div class="order-info">
                    <strong>Buyer:</strong> ${order.buyerName}<br>
                    <strong>Email:</strong> ${order.buyerEmail}<br>
                    <strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}<br>
                    <strong>Products:</strong> ${order.items.length} item(s)<br>
                    <strong>Total Amount:</strong> ₹${order.total}
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn btn-success" onclick="approveOrder('${order.id}')">Approve</button>
                        <button class="btn btn-danger" onclick="rejectOrder('${order.id}')">Reject</button>
                    ` : `
                        <button class="btn btn-secondary" disabled>Already ${order.status}</button>
                    `}
                </div>
            </div>
        `).join('');
    },

    approveOrder(orderId) {
        const order = this.data.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = 'approved';
        order.statusUpdatedAt = new Date().toISOString();
        this.saveData();
        
        this.loadOrders(document.getElementById('statusFilter').value);
        showToast('Order approved successfully!', 'success');
    },

    rejectOrder(orderId) {
        const order = this.data.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = 'rejected';
        order.statusUpdatedAt = new Date().toISOString();
        this.saveData();
        
        this.loadOrders(document.getElementById('statusFilter').value);
        showToast('Order rejected!', 'success');
    }
};

// Filter orders
function filterOrders() {
    const filter = document.getElementById('statusFilter').value;
    Orders.loadOrders(filter);
}

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

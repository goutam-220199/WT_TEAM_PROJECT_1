// Page 2 Previous Invoices (Retailer Orders)
let invoicesData = [];
let currentInvoiceId = null;

async function fetchInvoices() {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: 'Bearer ' + token }
    });
    invoicesData = await res.json();
}

async function loadInvoices(filter = '') {
    const tbody = document.getElementById('invoicesBody');

    if (!invoicesData.length) {
        await fetchInvoices();
    }

    let orders = invoicesData;
    if (filter) {
        orders = orders.filter(order => {
            const supplierName = order.supplier?.name || '';
            return (
                supplierName.toLowerCase().includes(filter.toLowerCase()) ||
                order._id.toLowerCase().includes(filter.toLowerCase())
            );
        });
    }

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const orderId = order._id;
        const supplier = order.supplier?.name || 'Unknown Supplier';
        const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';
        const itemCount = order.items?.length || 0;
        const total = order.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
        const status = order.status || 'pending';

        return `
            <tr>
                <td>${orderId}</td>
                <td>${supplier}</td>
                <td>${date}</td>
                <td>${itemCount} item(s)</td>
                <td>₹${total.toFixed(2)}</td>
                <td>
                    <span class="status-tag status-${status}">${status}</span>
                    <button class="btn btn-secondary" onclick="viewOrderDetails('${orderId}')" style="padding: 6px 10px; font-size: 12px; margin-left: 5px;">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function searchInvoices() {
    const searchText = document.getElementById('searchInvoice').value;
    loadInvoices(searchText);
}

function filterInvoices() {
    loadInvoices();
}

function viewOrderDetails(orderId) {
    currentInvoiceId = orderId;
    const order = invoicesData.find(order => order._id === orderId);
    if (!order) return;

    const content = document.getElementById('invoiceDetailsContent');

    const supplierName = order.supplier?.name || 'Unknown Supplier';
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';
    const status = order.status || 'pending';

    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
        itemsHtml = order.items.map(item => `
            <tr>
                <td>${item.name || 'Unknown Product'}</td>
                <td>${item.quantity || 0}</td>
                <td>₹${(item.price || 0).toFixed(2)}</td>
                <td>${item.gst || 0}%</td>
                <td>₹${(item.total || 0).toFixed(2)}</td>
            </tr>
        `).join('');
    }

    const total = order.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

    content.innerHTML = `
        <div class="invoice-header">
            <h3>Order Details</h3>
            <div class="invoice-info">
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Supplier:</strong> ${supplierName}</p>
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Status:</strong> <span class="status-tag status-${status}">${status}</span></p>
            </div>
        </div>

        <div class="invoice-items">
            <h4>Items Ordered</h4>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>GST</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" style="text-align: right;"><strong>Grand Total:</strong></td>
                        <td><strong>₹${total.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;

    openModal('invoiceDetailsModal');
}

function closeInvoiceDetails() {
    closeModal('invoiceDetailsModal');
}

function printInvoice() {
    window.print();
}

function downloadInvoice() {
    if (!currentInvoiceId) return;
    const order = invoicesData.find(order => order._id === currentInvoiceId);
    if (!order) return;

    const supplierName = order.supplier?.name || 'Unknown Supplier';
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';
    const status = order.status || 'pending';
    const total = order.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

    let content = `Order ID: ${order._id}\nSupplier: ${supplierName}\nDate: ${orderDate}\nStatus: ${status}\n\nItems:\n`;

    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            content += `${item.name || 'Unknown Product'} - Qty: ${item.quantity || 0}, Price: ₹${(item.price || 0).toFixed(2)}, GST: ${item.gst || 0}%, Total: ₹${(item.total || 0).toFixed(2)}\n`;
        });
    }

    content += `\nGrand Total: ₹${total.toFixed(2)}\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Order downloaded', 'success');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadInvoices();
});

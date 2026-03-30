// Page 2 Previous Invoices (Retailer Orders)
let invoicesData = [];
let currentInvoiceId = null;

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
                <td>${item.name || item.product?.name || 'Unknown Product'}</td>
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

    generatePurchaseInvoicePDF(order);
}

function generatePurchaseInvoicePDF(order) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const supplierName = order.supplier?.name || 'Unknown Supplier';
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '';
    const status = order.status || 'pending';
    const total = order.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

    const content = `
<!DOCTYPE html>
<html>
<head>
<title>Invoice - ${order._id}</title>
<style>
body { font-family: Arial, sans-serif; margin: 20px; background: #f9f9f9; }
.logo { text-align: center; margin-bottom: 20px; }
.logo img { width: 120px; }
.header { text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 20px; color: #333; }
.details { margin-bottom: 20px; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.details p { margin: 5px 0; font-size: 16px; }
.table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
.table th { background: #007bff; color: white; font-weight: bold; }
.table tr:nth-child(even) { background: #f2f2f2; }
.total { text-align: right; font-size: 20px; font-weight: bold; color: #28a745; margin-top: 20px; }
</style>
</head>
<body>
<div class="logo"><img src="images/b2blogo.png" alt="B2B Manager Logo"></div>
<div class="header">Invoice</div>
<div class="details">
<p><strong>Order ID:</strong> ${order._id}</p>
<p><strong>Supplier:</strong> ${supplierName}</p>
<p><strong>Date:</strong> ${orderDate}</p>
<p><strong>Status:</strong> ${status}</p>
</div>
<table class="table">
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
${order.items?.map(item => `
<tr>
<td>${item.name || 'Unknown Product'}</td>
<td>${item.quantity || 0}</td>
<td>₹${(item.price || 0).toFixed(2)}</td>
<td>${item.gst || 0}%</td>
<td>₹${(item.total || 0).toFixed(2)}</td>
</tr>
`).join('')}
</tbody>
</table>
<div class="total">Grand Total: ₹${total.toFixed(2)}</div>
</body>
</html>
`;

    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order._id}.html`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Invoice downloaded', 'success');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!ensureRetailerPage()) return;
    loadInvoices();
});

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

    // Create table rows HTML
    let tableRowsHtml = '';
    if (order.items && order.items.length > 0) {
        tableRowsHtml = order.items.map(item => `
<tr>
<td style="padding:10px;border:1px solid #ddd;">${item.name || item.product?.name || 'Unknown Product'}</td>
</tr>
`).join('');
    }

    // Full HTML Template
    const htmlContent = `
<div style="width: 700px; box-sizing: border-box; padding: 20px; margin: 0 auto; background: white; color: #333; font-family: 'Inter', Helvetica, Arial, sans-serif;">
            
<table style="width: 100%; margin-bottom: 30px;">
<tr>
<td style="width: 50%; vertical-align: middle;">
<img src="images/b2blogo.png" style="max-height: 50px;">
<h2 style="margin: 0; font-size: 22px; color: #2c3e50;">InventoryPro</h2>
</td>
<td style="width: 50%; text-align: right;">
<h1 style="margin: 0; font-size: 28px; color: #3498db;">Purchase Invoice</h1>
<p><strong>Order #:</strong> ${order._id}</p>
<p><strong>Date:</strong> ${orderDate}</p>
<p><strong>Status:</strong> ${status}</p>
</td>
</tr>
</table>

<div style="background:#f8f9fa;padding:15px;margin-bottom:25px;display:flex;justify-content:space-between;">
<div>
<h3>Supplier:</h3>
<p><strong>Supplier Name:</strong> ${supplierName}</p>
</div>
<div>
<h3>Order Details:</h3>
<p><strong>Order ID:</strong> ${order._id}</p>
</div>
</div>

<table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
<thead>
<tr style="background:#2c3e50;color:white;">
<th style="padding:10px;border:1px solid #2c3e50;">Product Name</th>
<th style="padding:10px;border:1px solid #2c3e50;">Qty</th>
<th style="padding:10px;border:1px solid #2c3e50;">Price</th>
<th style="padding:10px;border:1px solid #2c3e50;">Total</th>
</tr>
</thead>
<tbody>
${tableRowsHtml}
</tbody>
</table>

<div style="text-align:right;">
<h2>Grand Total: ₹${Number(total).toFixed(2)}</h2>
</div>

<div style="margin-top:40px;text-align:center;font-size:12px;color:#777;">
<p>Thank you for your business!</p>
</div>

</div>
`;

    // Use html2canvas to render HTML to canvas, then add to PDF
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '700px';
    document.body.appendChild(tempDiv);

    html2canvas(tempDiv, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        doc.save("purchase-invoice-" + order._id + ".pdf");
        document.body.removeChild(tempDiv);
        showToast('Invoice downloaded', 'success');
    }).catch(error => {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!ensureRetailerPage()) return;
    loadInvoices();
});

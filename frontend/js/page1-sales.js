// Page 1 Sales Invoice
const Sales = {

products: [],
invoices: [],

async loadProducts() {

const token = localStorage.getItem("token");

const res = await fetch("http://localhost:5000/api/products/my-products",{

headers:{
"Authorization":"Bearer "+token
}

});

this.products = await res.json();

},

loadProductsInSelect() {

const selects = document.querySelectorAll('.product-select');

const productOptions = this.products.map(p => 
`<option value="${p._id}" data-price="${p.price}" data-gst="${p.gst}">
${p.name} - ₹${p.price}
</option>`
).join('');

selects.forEach(select=>{
select.innerHTML = '<option value="">Select Product</option>' + productOptions;
});

},

async loadPreviousInvoices(){

const token = localStorage.getItem("token");

const res = await fetch("http://localhost:5000/api/invoices/my-invoices",{

headers:{
"Authorization":"Bearer "+token
}

});

this.invoices = await res.json();



const container = document.getElementById('previousInvoices');

if (this.invoices.length === 0) {
container.innerHTML = '<p class="empty-state">No invoices created yet</p>';
return;
}

container.innerHTML = this.invoices.map(invoice => `
<div style="background:#f9f9f9;padding:15px;margin-bottom:10px;border-radius:4px;border-left:4px solid #000;">

<div style="display:flex;justify-content:space-between;margin-bottom:10px;">
<strong>Invoice #${invoice._id}</strong>
<span style="color:#666;font-size:12px;">
${new Date(invoice.createdAt).toLocaleDateString()}
</span>
</div>

<div style="font-size:13px;color:#666;margin-bottom:8px;">
Product: ${invoice.product?.name || "Product"}
</div>

<div style="font-size:13px;color:#666;margin-bottom:8px;">
Quantity: ${invoice.quantity}
</div>

<div style="font-size:13px;color:#666;margin-bottom:8px;">
Total: <strong>₹${invoice.total}</strong>
</div>

<button class="btn btn-secondary"
onclick="downloadInvoice('${invoice._id}')">
Download Invoice
</button>

</div>
`).join('');

}

};


function openNewInvoice(){

document.getElementById('invoiceForm').style.display='block';
document.getElementById('invoicesList').style.display='none';

const today = new Date().toISOString().split('T')[0];
document.getElementById('invoiceDate').value = today;

Sales.loadProductsInSelect();

}


function cancelInvoice(){

document.getElementById('invoiceForm').style.display='none';
document.getElementById('invoicesList').style.display='block';

document.getElementById('invoiceForm').reset();

}


function addProductRow(){

const container=document.getElementById('productsList');

const newRow=document.createElement('div');

newRow.className='product-row';

newRow.innerHTML=`

<select class="product-select" onchange="updatePrice(this)">
<option value="">Select Product</option>
</select>

<input type="number" class="product-qty" placeholder="Qty" min="1" onchange="calculateInvoiceTotal()">

<input type="number" class="product-price" readonly>

<input type="number" class="product-gst" readonly>

<button type="button" class="btn btn-delete" onclick="removeProductRow(this)">Remove</button>

`;

container.appendChild(newRow);

Sales.loadProductsInSelect();

}


function removeProductRow(btn){

btn.parentElement.remove();

calculateInvoiceTotal();

}


function updatePrice(select){

const option=select.options[select.selectedIndex];

const price=option.getAttribute('data-price') || 0;
const gst=option.getAttribute('data-gst') || 0;

const row=select.closest('.product-row');

row.querySelector('.product-price').value=price;
row.querySelector('.product-gst').value=gst;

calculateInvoiceTotal();

}


function calculateInvoiceTotal(){

const rows=document.querySelectorAll('.product-row');

let subtotal=0;
let totalGst=0;

rows.forEach(row=>{

const qty=parseInt(row.querySelector('.product-qty').value)||0;
const price=parseFloat(row.querySelector('.product-price').value)||0;
const gst=parseFloat(row.querySelector('.product-gst').value)||0;

const lineTotal=qty*price;
const lineGst=(lineTotal*gst)/100;

subtotal+=lineTotal;
totalGst+=lineGst;

});

const total=subtotal+totalGst;

document.getElementById('subtotal').textContent='₹'+subtotal.toFixed(2);
document.getElementById('gstAmount').textContent='₹'+totalGst.toFixed(2);
document.getElementById('totalAmount').textContent='₹'+total.toFixed(2);

}


async function createInvoice(){

const customerName=document.getElementById('customerName').value;

const rows=document.querySelectorAll('.product-row');

if(!customerName){

alert("Enter customer name");

return;

}

const token=localStorage.getItem("token");

for(const row of rows){

const productId=row.querySelector('.product-select').value;
const qty=parseInt(row.querySelector('.product-qty').value)||0;

if(productId && qty>0){

await fetch("http://localhost:5000/api/invoices/create",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body:JSON.stringify({
productId:productId,
quantity:qty
})

});

}

}

alert("Invoice created successfully");

cancelInvoice();

Sales.loadPreviousInvoices();

}


// Initialize
document.addEventListener("DOMContentLoaded", async ()=>{

await Sales.loadProducts();

Sales.loadPreviousInvoices();

});
async function downloadInvoice(id){
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/api/invoices/${id}`,{
            headers:{
                "Authorization":"Bearer "+token
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch invoice');
        }

        const invoice = await res.json();

        generateInvoicePDF(invoice);
    } catch (error) {
        console.error('Error downloading invoice:', error);
        alert('Failed to download invoice. Please try again.');
    }
}
function generateInvoicePDF(invoice){

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

// Create table rows HTML
let tableRowsHtml = `
<tr>
<td style="padding:10px;border:1px solid #ddd;">${invoice.product.name}</td>
<td style="padding:10px;border:1px solid #ddd;text-align:center;">${invoice.quantity}</td>
<td style="padding:10px;border:1px solid #ddd;text-align:right;">₹${invoice.price}</td>
<td style="padding:10px;border:1px solid #ddd;text-align:right;">₹${invoice.total}</td>
</tr>
`;

let finalTotal = invoice.total;

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
<h1 style="margin: 0; font-size: 28px; color: #3498db;">Sales Invoice</h1>
<p><strong>Invoice #:</strong> ${invoice._id}</p>
<p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
</td>
</tr>
</table>

<div style="background:#f8f9fa;padding:15px;margin-bottom:25px;display:flex;justify-content:space-between;">
<div>
<h3>Billed To:</h3>
<p><strong>Customer Name:</strong> ${invoice.customerName || "Retailer / Guest"}</p>
</div>
<div>
<h3>Order Details:</h3>
<p><strong>Order ID:</strong> ${invoice.orderId || "Manual Invoice"}</p>
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
<h2>Grand Total: ₹${Number(finalTotal).toFixed(2)}</h2>
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

    doc.save("invoice-" + invoice._id + ".pdf");
    document.body.removeChild(tempDiv);
}).catch(error => {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
});
}
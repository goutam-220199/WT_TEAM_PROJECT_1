// Page 1 Sales Invoice
const Sales = {
    invoices: [],

    async loadPreviousInvoices() {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/invoices/my-invoices", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        this.invoices = await res.json();

        const container = document.getElementById('previousInvoices');

        if (this.invoices.length === 0) {
            container.innerHTML = '<p class="empty-state">No invoices generated yet. Invoices are automatically created when orders are placed.</p>';
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
                <button class="btn btn-secondary" onclick="downloadInvoice('${invoice._id}')">
                    Download Invoice
                </button>
            </div>
        `).join('');
    }
};

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
    Sales.loadPreviousInvoices();
});
async function downloadInvoice(id){

const token = localStorage.getItem("token");

const res = await fetch(`http://localhost:5000/api/invoices/${id}`,{

headers:{
"Authorization":"Bearer "+token
}

});

const invoice = await res.json();

generateInvoicePDF(invoice);

}
function generateInvoicePDF(invoice){

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

doc.setFontSize(18);
doc.text("InventoryPro Invoice",20,20);

doc.setFontSize(12);

doc.text("Invoice ID: "+invoice._id,20,40);

doc.text("Date: "+new Date(invoice.createdAt).toLocaleDateString(),20,50);

doc.text("Product: "+invoice.product.name,20,70);

doc.text("Quantity: "+invoice.quantity,20,80);

doc.text("Price: ₹"+invoice.price,20,90);

doc.text("GST: "+invoice.gst+"%",20,100);

doc.text("Total Amount: ₹"+invoice.total,20,120);

doc.save("invoice-"+invoice._id+".pdf");

}
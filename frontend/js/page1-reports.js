// Page 1 Reports

const Reports = {

async fetchData(endpoint){

const token = localStorage.getItem("token");

const res = await fetch(`http://localhost:5000/api/reports/${endpoint}`,{
headers:{
"Authorization":"Bearer "+token
}
});

return await res.json();

},

// -------- DAILY SALES --------

async loadDailySalesReport(){

const tbody = document.getElementById('dailySalesBody');

const data = await this.fetchData("daily");

if(!data || data.count === 0){
tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No data available</td></tr>';
return;
}

tbody.innerHTML = `
<tr>
<td>${new Date().toLocaleDateString()}</td>
<td>All Products</td>
<td>${data.count}</td>
<td>₹${data.totalSales}</td>
</tr>
`;

},


// -------- MONTHLY SALES --------

async loadMonthlySalesReport(){

const tbody = document.getElementById('monthlySalesBody');

const data = await this.fetchData("monthly");

if(data.length === 0){
tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No data available</td></tr>';
return;
}

tbody.innerHTML = data.map(row=>`

<tr>

<td>${row._id.month}/${row._id.year}</td>

<td>₹${row.totalSales}</td>

<td>-</td>

</tr>

`).join("");

},


// -------- TOP PRODUCTS --------

async loadTopProductsReport(){

const tbody = document.getElementById('topProductsBody');

const data = await this.fetchData("top-products");

if(data.length === 0){
tbody.innerHTML = '<tr><td colspan="3" class="empty-state">No data available</td></tr>';
return;
}

tbody.innerHTML = data.map(product=>`

<tr>

<td>${product._id}</td>

<td>${product.totalSold}</td>

<td>₹${product.totalRevenue}</td>

</tr>

`).join("");

},


// -------- SALES COMPARISON GRAPH --------

async loadComparisonChart(){

const container = document.getElementById('comparisonChart');

const data = await this.fetchData("sales-comparison");

if(data.length === 0){
container.innerHTML = '<p class="empty-state">No data for comparison</p>';
return;
}

const max = Math.max(...data.map(d=>d.totalSales));

let html = '<table class="data-table" style="width:100%"><thead><tr><th>Month</th><th>Sales</th></tr></thead><tbody>';

data.forEach(d=>{

const width = (d.totalSales / max) * 100;

html += `
<tr>

<td>Month ${d._id}</td>

<td>
<div style="background:#eee;border-radius:4px;overflow:hidden">
<div style="background:black;width:${width}%;height:20px;color:white;padding-left:5px;font-size:11px">
₹${d.totalSales}
</div>
</div>
</td>

</tr>
`;

});

html += '</tbody></table>';

container.innerHTML = html;

}

};


// -------- GENERATE REPORT --------

function generateReport(){

Reports.loadDailySalesReport();
Reports.loadMonthlySalesReport();
Reports.loadTopProductsReport();
Reports.loadComparisonChart();

showToast("Report generated successfully","success");

}


// -------- PAGE INIT --------

document.addEventListener("DOMContentLoaded",function(){

generateReport();

});
async function loadSalesGraph(){

const token = localStorage.getItem("token");

const data = await fetch(
"http://localhost:5000/api/reports/sales-comparison",
{headers:{Authorization:"Bearer "+token}}
).then(r=>r.json());

const labels = data.map(d=>"Month "+d._id);
const values = data.map(d=>d.totalSales);

new Chart(document.getElementById("salesChart"),{

type:"line",

data:{
labels:labels,
datasets:[{
label:"Sales",
data:values,
borderColor:"black",
fill:false
}]
}

});

}
// Page 1 Notifications (Supplier Requests)

const Notifications = {

async loadRequests(){

const token = localStorage.getItem("token");

const res = await fetch(
"http://localhost:5000/api/supplier-request/my-requests",
{
headers:{ Authorization:"Bearer "+token }
});

const requests = await res.json();

const container = document.getElementById("notificationsList");

if(!requests || requests.length === 0){
container.innerHTML =
'<p class="empty-state">No new retailer requests</p>';
return;
}

container.innerHTML = requests.map(req => `

<div class="notification-item unread">

<div class="notification-header">

<div class="notification-type">
🔔 Retailer Request
</div>

<div class="notification-time">
${getTimeAgo(req.createdAt)}
</div>

</div>

<div class="notification-content">

<strong>${req.retailer.name}</strong>

<p>${req.retailer.name} wants to connect as a retailer.</p>

</div>

<div class="notification-action">

<button class="btn btn-primary"
onclick="approveRequest('${req._id}')">
Approve
</button>

<button class="btn btn-danger"
onclick="rejectRequest('${req._id}')">
Reject
</button>

</div>

</div>

`).join("");

}

};



/* ----------------------------
   Approve Request
-----------------------------*/

async function approveRequest(id){

const token = localStorage.getItem("token");

await fetch(
`http://localhost:5000/api/supplier-request/approve/${id}`,
{
method:"PUT",
headers:{ Authorization:"Bearer "+token }
});

showToast("Retailer request approved","success");

Notifications.loadRequests();

}



/* ----------------------------
   Reject Request
-----------------------------*/

async function rejectRequest(id){

const token = localStorage.getItem("token");

await fetch(
`http://localhost:5000/api/supplier-request/reject/${id}`,
{
method:"PUT",
headers:{ Authorization:"Bearer "+token }
});

showToast("Retailer request rejected","success");

Notifications.loadRequests();

}



/* ----------------------------
   Time Ago Helper
-----------------------------*/

function getTimeAgo(dateString){

const date = new Date(dateString);
const now = new Date();
const seconds = Math.floor((now - date) / 1000);

if(seconds < 60) return "Just now";
if(seconds < 3600) return Math.floor(seconds/60)+"m ago";
if(seconds < 86400) return Math.floor(seconds/3600)+"h ago";
if(seconds < 604800) return Math.floor(seconds/86400)+"d ago";

return date.toLocaleDateString();

}



/* ----------------------------
   Initialize Page
-----------------------------*/

document.addEventListener("DOMContentLoaded",function(){

Notifications.loadRequests();

});
import { getCurrentUID } from "/js/login.js";

async function getClients() {
    const userID = await getCurrentUID();
    if (!userID) {
        alert("User not logged in!");
        return;
    }

    const response = await fetch(`/api/clients`);
    if (!response.ok) {
        alert("Failed to fetch clients");
        return;
    }

    const clients = await response.json();
    console.log(clients);

    const tableBody = document.querySelector("#clientsTable tbody");
    tableBody.innerHTML = ""; 

	Object.entries(clients).forEach(([key, client]) => {
        console.log(key);
		const row = document.createElement("tr");
		
		const nameCell = document.createElement("td");
		const editCell = document.createElement("td");
		const deleteCell = document.createElement("td");

		nameCell.innerHTML = `<a href="clientPortfolio/${key}">${client.name}</a>`;
		editCell.innerHTML = `<a href="editClient/${key}">✏️</a>`;
		deleteCell.innerHTML = `<a href="#" onclick="deleteClient('${key}')">❌</a>`;

		row.appendChild(nameCell);
		row.appendChild(editCell);
		row.appendChild(deleteCell);

		tableBody.appendChild(row);
	});
}

async function deleteClient(id) {
    const confirmed = confirm("Are you sure you want to delete this client?");
    if (!confirmed) {
        return;
    }

    const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        alert("Client deleted successfully");
        await getClients();
    } else {
        alert("Failed to delete client");
    }
}

async function createClient() {
    const userID = await getCurrentUID();
    if (!userID) {
        alert("User not logged in!");
        return;
    }

    const clientName = document.getElementById('clientName').value;
    const clientEmail = document.getElementById('clientEmail').value;

    if (!clientName || !clientEmail) {
        alert("Please fill in both fields.");
        return;
    }

    const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: clientName, email: clientEmail })
    });

    if (response.ok) {
        const form = document.getElementById('clientForm');
        form.style.display = 'none';
        alert("Client created successfully");
        await getClients();
    } else {
        alert("Failed to create client");
    }
}

function toggleClientForm() {
    const form = document.getElementById('clientForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function loadClient() {
    const pathParts = window.location.pathname.split('/');
    const clientId = pathParts[pathParts.length - 1];

    const response = await fetch(`/api/clients/${clientId}`);
    if (response.ok) {
        const client = await response.json();
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientEmail').value = client.email;
    } else {
        alert("Failed to load client data");
    }
}

async function saveClient() {
    const pathParts = window.location.pathname.split('/');
    const clientId = pathParts[pathParts.length - 1];
    const clientName = document.getElementById('clientName').value;
    const clientEmail = document.getElementById('clientEmail').value;

    const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: clientName, email: clientEmail })
    });

    if (response.ok) {
        alert("Client updated successfully");
        document.location = "/clients";
    } else {
        alert("Failed to update client");
    }
}

function cancelEdit() {
    document.location = "/clients";
}

async function loadStockForm() {

    const response = await fetch(`/api/stocks`);
    if (!response.ok) {
        alert("Failed to fetch shares");
        return;
    }

    const shares = await response.json();
    console.log(shares);

    const pathParts = window.location.pathname.split('/');
    const clientId = pathParts[pathParts.length - 1];

    const response2 = await fetch(`/api/clients/${clientId}`);
    let client = null;
    if (response2.ok) {
        client = await response2.json();
    }

    const clientShares = client.shares ? Object.values(client.shares).map(clientShare => clientShare.share_name) : [];

    const stockDropdown = document.getElementById("stock");

    stockDropdown.innerHTML = '<option value="" disabled selected>Choose a stock to add</option>';

    shares.forEach(share => {
        const option = document.createElement("option");
        option.value = share.short_name;
        option.textContent = share.short_name; 
        stockDropdown.appendChild(option);
    });
}

function toggleStockForm() {
    const form = document.getElementById('newStockForm');
    const stockDropdown = document.getElementById('stock');
    const quantityField = document.getElementById('quantity');

    form.style.display = form.style.display === 'none' ? 'block' : 'none';

    if (form.style.display === 'block') {
        stockDropdown.selectedIndex = 0;
        quantityField.value = '';
    }
}

async function addStock() {
    const stockDropdown = document.getElementById("stock");
    if (stockDropdown.selectedIndex == 0){
        alert("Select a valid stock!");
        return;
    }

    const selectedStockName = stockDropdown.options[stockDropdown.selectedIndex].text;
    const quantity = parseInt(document.getElementById("quantity").value, 10);

    const pathParts = window.location.pathname.split('/');
    const clientId = pathParts[pathParts.length - 1];

    const response = await fetch(`/api/clients/${clientId}/shares`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            share_name: selectedStockName,
            quantity: quantity,
        })
    });

    if (response.ok) {
        alert("Stock purchased successfully!");
        toggleStockForm();
        stockDropdown.selectedIndex = 0;
        getShares()
    } else {
        const errorData = await response.json();
        alert(`Failed to purchase stock: ${errorData.error}`);
    }
}

async function getShares() {
    const pathParts = window.location.pathname.split('/');
    const clientId = pathParts[pathParts.length - 1];
    const userID = await getCurrentUID();

    if (!userID) {
        alert("User not logged in!");
        return;
    }

    const response2 = await fetch(`/api/clients/${clientId}`);
    let client = null;
    if (response2.ok) {
        client = await response2.json();
    } else {
        alert("Failed to load client data");
        return;
    }

    const response = await fetch(`/api/stocks`);
    if (!response.ok) {
        alert("Failed to fetch shares");
        return;
    }

    const shares = await response.json();
    const tableBody = document.querySelector("#clientsStockTable tbody");
    tableBody.innerHTML = "";

    Object.entries(client.shares).forEach(([purchaseId, shareData]) => {
        let matchedStock = shares.find(stock => stock.short_name === shareData.share_name);
        if (matchedStock) {
            const row = document.createElement("tr");
            const codeCell = document.createElement("td");
            const typeCell = document.createElement("td");
            const quantityCell = document.createElement("td");
            const valueCell = document.createElement("td");
            const alertValueCell = document.createElement("td");
            const sellCell = document.createElement("td");

            codeCell.innerHTML = `${matchedStock.short_name}`;
            typeCell.innerHTML = `${matchedStock.long_name}`;
            quantityCell.innerHTML = `${shareData.quantity}`;
            valueCell.innerHTML = `$${matchedStock.price}`;
            sellCell.innerHTML = `<a href="#" onclick="sellClientShare('${matchedStock.short_name}', '${purchaseId}')">💰</a>`;
            if (shareData.alerts) {
                const alertValues = Object.values(shareData.alerts).map(alert => `$${alert.price}`).join(', ');
                alertValueCell.innerHTML = `${alertValues}<br>`;
            } else {
                alertValueCell.innerHTML = '-';
            }

            const manageAlertsLink = document.createElement('a');
            manageAlertsLink.href = `#`;
            manageAlertsLink.innerHTML = "Manage";
            manageAlertsLink.onclick = function() {
                manageAlerts(shareData.share_name, purchaseId, shareData.alerts);
            };

            alertValueCell.appendChild(manageAlertsLink);

            row.appendChild(codeCell);
            row.appendChild(typeCell);
            row.appendChild(quantityCell);
            row.appendChild(valueCell);
            row.appendChild(alertValueCell);
            row.appendChild(sellCell);

            tableBody.appendChild(row);
        }
    });
}


async function sellClientShare(share_name, purchaseId) {
    const pathParts = window.location.pathname.split('/');
    const clientId = pathParts[pathParts.length - 1];

    const quantityToDelete = prompt(`Enter the quantity of ${share_name} to delete: `);
    if (isNaN(quantityToDelete) || quantityToDelete <= 0) {
        alert("Please enter a valid quantity!");
        return;
    }

    const response = await fetch(`/api/clients/${clientId}/shares`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ share_name: share_name, purchase_id: purchaseId, quantity: parseInt(quantityToDelete) })
    });

    if (response.ok) {
        alert("Share(s) sold successfully!");
        getShares();
    } else {
        alert("Failed to sell share!");
    }
}

function manageAlerts(shareName, purchaseId, alerts) {
    document.getElementById('manageAlertsShareName').innerText = shareName;

    const alertTableBody = document.querySelector("#alertTable tbody");
    alertTableBody.innerHTML = '';
    if (alerts) {
        Object.entries(alerts).forEach(([alertId, alert]) => {
            const row = document.createElement("tr");

            const alertValueCell = document.createElement("td");
            alertValueCell.innerText = `$${alert.price}`;
            const actionCell = document.createElement("td");
            actionCell.innerHTML = `<a href="#" onclick="deleteAlert('${purchaseId}', '${alertId}');">❌</a>`;

            row.appendChild(alertValueCell);
            row.appendChild(actionCell);

            alertTableBody.appendChild(row);
        });
    }

    const addAlertLink = document.getElementById('addAlertLink');
    addAlertLink.onclick = function () {
        addAlert(purchaseId);
    };

    document.getElementById('manageAlertsForm').style.display = 'flex';
}

function closeManageAlertsForm() {
    document.getElementById('manageAlertsForm').style.display = 'none';
}

async function addAlert(purchaseId) {
    const alertValue = prompt("Enter a new alert value:");

    if (alertValue) {
        const userID = await getCurrentUID();
        if (!userID) {
            alert("User not logged in!");
            return;
        }

        const pathParts = window.location.pathname.split('/');
        const clientId = pathParts[pathParts.length - 1];

        const response = await fetch(`/api/clients/${clientId}/shares/${purchaseId}/alerts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ alert_value: alertValue }),
        });

        if (response.ok) {
            alert("Alert added successfully!");
            await getShares();
            closeManageAlertsForm();
        } else {
            const errorData = await response.json();
            alert(`Failed to add alert: ${errorData.error}`);
        }
    }
}

async function deleteAlert(purchaseId, alertId) {
    const confirmed = confirm("Are you sure you want to delete this alert?");
    if (!confirmed) {
        return;
    }

    const userID = await getCurrentUID();
    if (!userID) {
        alert("User not logged in!");
        return;
    }

    const pathParts = window.location.pathname.split('/');
    const clientId = pathParts[pathParts.length - 1];

    const response = await fetch(`/api/clients/${clientId}/shares/${purchaseId}/alerts/${alertId}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        alert("Alert deleted successfully!");
        await getShares();
        closeManageAlertsForm();
    } else {
        const errorData = await response.json();
        alert(`Failed to delete alert: ${errorData.error}`);
    }
}

document.getClients = getClients;
document.createClient = createClient;
document.deleteClient = deleteClient;
document.toggleClientForm = toggleClientForm;
document.saveClient = saveClient;
document.cancelEdit = cancelEdit;
document.loadStockForm = loadStockForm;
document.toggleStockForm = toggleStockForm;
document.addStock = addStock;
document.getShares = getShares;
document.sellClientShare = sellClientShare;
document.manageAlerts = manageAlerts;
document.closeManageAlertsForm = closeManageAlertsForm;
document.addAlert = addAlert;
document.deleteAlert = deleteAlert;

document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    const secondPart = pathParts[1];

    if (secondPart === "clients") {
        getClients();
    } else if (secondPart === "editClient") {
        loadClient();
    }
    else if (secondPart === "clientPortfolio") {
        getShares();
    }
});
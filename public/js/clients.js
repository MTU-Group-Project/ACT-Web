import { getCurrentUID } from "/js/login.js";

async function getClients() {
    const userID = await getCurrentUID();
    if (!userID) {
        alert("User not logged in!");
        return;
    }

    const response = await fetch(`/api/clients/user/${userID}`);
    if (!response.ok) {
        alert("Failed to fetch clients");
        return;
    }

    const clients = await response.json();
    console.log(clients);

    const tableBody = document.querySelector("#clientsTable tbody");
    tableBody.innerHTML = ""; 

	Object.values(clients).forEach(client => {
		const row = document.createElement("tr");
		
		const nameCell = document.createElement("td");
		const editCell = document.createElement("td");
		const deleteCell = document.createElement("td");

		nameCell.innerHTML = `<a href="clientPortfolio/${client.id}">${client.name}</a>`;
		editCell.innerHTML = `<a href="editClient/${client.id}">✏️</a>`;
		deleteCell.innerHTML = `<a href="#" onclick="deleteClient('${client.id}')">❌</a>`;

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
        body: JSON.stringify({ name: clientName, email: clientEmail, userID })
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

    const response = await fetch(`/api/shares`);
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

        if (clientShares.includes(share.short_name)) {
            option.disabled = true;
            option.style.color = "gray";
        }

        stockDropdown.appendChild(option);
    });
}

function toggleStockForm() {
    const form = document.getElementById('newStockForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addStock() {
    const stockDropdown = document.getElementById("stock");
    const selectedStockName = stockDropdown.options[stockDropdown.selectedIndex].text;

    const pathParts = window.location.pathname.split('/');
    const clientId = pathParts[pathParts.length - 1];

    const response = await fetch(`/api/clients/${clientId}/shares`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ share_name: selectedStockName })
    });

    if (response.ok) {
        alert("Stock added to client successfully!");
        toggleStockForm();
        stockDropdown.selectedIndex = 0;
        getShares()
    } else {
        const errorData = await response.json();
        alert(`Failed to add stock: ${errorData.error}`);
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

    const response = await fetch(`/api/shares`);
    if (!response.ok) {
        alert("Failed to fetch shares");
        return;
    }

    const shares = await response.json();
    const tableBody = document.querySelector("#clientsStockTable tbody");
    tableBody.innerHTML = ""; 
    console.log(client.shares);
    Object.values(client.shares).forEach(clientShare => {
        let matchedStock = shares.find(stock => stock.short_name === clientShare.share_name);
        if (matchedStock) {
            console.log(`Client has share ${matchedStock.short_name}`);

            const row = document.createElement("tr");
            const nameCell = document.createElement("td");
            const descriptionCell = document.createElement("td");
            const valueCell = document.createElement("td");
            const deleteCell = document.createElement("td");

            nameCell.innerHTML = `${matchedStock.short_name}`;
            descriptionCell.innerHTML = `${matchedStock.long_name}`;
            valueCell.innerHTML = `${matchedStock.price}`;
            deleteCell.innerHTML = `<a href="#" onclick="deleteClientShare('${matchedStock.short_name}')">❌</a>`;

            row.appendChild(nameCell);
            row.appendChild(descriptionCell);
            row.appendChild(valueCell);
            row.appendChild(deleteCell);

            tableBody.appendChild(row);
        }
    });
}

async function deleteClientShare(share_name){
    const pathParts = window.location.pathname.split('/');
    const clientId = pathParts[pathParts.length - 1];

    const confirmed = confirm("Are you sure you want to delete this share?");
    if (!confirmed) {
        return;
    }

    const response = await fetch(`/api/clients/${clientId}/shares`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ share_name }) 
    });

    if (response.ok) {
        alert("Share deleted successfully!");
        getShares(); 
    } else {
        alert("Failed to delete share!");
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
document.deleteClientShare = deleteClientShare;

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
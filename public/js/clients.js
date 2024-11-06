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

		nameCell.innerHTML = `<a href="editClient/${client.id}">${client.name}</a>`;
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

document.getClients = getClients;
document.createClient = createClient;
document.deleteClient = deleteClient;
document.toggleClientForm = toggleClientForm;
document.saveClient = saveClient;
document.cancelEdit = cancelEdit;

document.addEventListener('DOMContentLoaded', () => {
    const pathParts = window.location.pathname.split('/');
    const secondPart = pathParts[1];

    if (secondPart === "clients") {
        getClients();
    } else if (secondPart === "editClient") {
        loadClient();
    }
});
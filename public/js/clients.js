import { getCurrentUID } from "/js/login.js";

async function getClients() {
    const response = await fetch('/api/clients');
    if (!response.ok) {
        alert("Failed to fetch clients");
        return;
    }

    const clients = await response.json();
    console.log(clients);

    const tableBody = document.querySelector("#clientsTable tbody");
	clients.forEach(client => {
		const row = document.createElement("tr");
		
		const nameCell = document.createElement("td");
		const editCell = document.createElement("td");
		const deleteCell = document.createElement("td");

		nameCell.innerHTML = `<a href="./editClient.html/${client.id}">${client.name}</a>`;
		editCell.innerHTML = `<a href="./editClient.html/${client.id}">✏️</a>`;
		deleteCell.innerHTML = `<a href="#" onclick="deleteClient(${client.id})">❌</a>`;

		row.appendChild(nameCell);
		row.appendChild(editCell);
		row.appendChild(deleteCell);

		tableBody.appendChild(row);
	});
}

async function deleteClient(id){
	console.log(`Want to delete client ${id}!`)
}

async function createClient() {
    const clientName = "Daniel";
    const clientEmail = "daniel@gmail.com"
    const userID = await getCurrentUID();
    console.log(userID);

    const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: clientName, email: clientEmail, userID })
    });

    if (response.ok) {
        alert("Client created successfully");
    } else {
        alert("Failed to create client");
    }
}

document.getClients = getClients
document.deleteClient = deleteClient

document.addEventListener('DOMContentLoaded', () => {
    getClients();
    createClient();
});
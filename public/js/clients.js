// For now I'm using dummy data to test the client record system
const clients = [
	{ id: 1, name: "Client A" },
	{ id: 2, name: "Client B" },
	{ id: 3, name: "Client C" },
	{ id: 4, name: "Client D" },
];

async function getClients() {
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

document.getClients = getClients
document.deleteClient = deleteClient

document.addEventListener('DOMContentLoaded', () => {
    getClients();
});
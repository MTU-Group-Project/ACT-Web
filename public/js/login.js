import { API } from "/js/api.js";

async function login(username, password) {
	// Call API with username and password
	let loginResponse = await API("login", {username, password});

	// Handle error
	if(!loginResponse.userID) return alert(loginResponse);
	
	// Refresh on successful login
	document.location.reload()
}

document.login = login
/**
 * Calls the flask backend API specified in url, sends data as JSON
 * @returns parsed JSON data from the API
 */
export async function API(url, data={}) {
	const response = await fetch(`/api/${url}`, {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(data) || "{}"
	});

	let responseValue = await response.text();
	try {
		responseValue = JSON.parse(responseValue);
	} catch {}
	return responseValue;
}
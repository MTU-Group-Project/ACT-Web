fetch("/api/stocks")
.then(response => response.json())
.then(data => {
    const tableBody = document.getElementById('stock-table-body');
    data.forEach(stock => {
        const row = document.createElement('tr');

        const shortNameCell = document.createElement('td');
        const link = document.createElement('a');
        link.href = "reports/" + stock.short_name;
        link.textContent = stock.short_name;

        shortNameCell.appendChild(link);

        const longNameCell = document.createElement('td');
        longNameCell.textContent = stock.long_name;

        const priceCell = document.createElement('td');
        priceCell.textContent = stock.price;

        const currencyCell = document.createElement('td');
        currencyCell.textContent = stock.currency;

        row.appendChild(shortNameCell);
        row.appendChild(longNameCell);
        row.appendChild(priceCell);
        row.appendChild(currencyCell);

        tableBody.appendChild(row);
    });
})
.catch(error => console.error('Error fetching data:', error));
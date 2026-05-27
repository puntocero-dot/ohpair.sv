document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');
    const adminPass = document.getElementById('admin-pass');
    const inventoryBody = document.getElementById('inventory-body');
    const bulkJsonArea = document.getElementById('bulk-json');
    const processBulkBtn = document.getElementById('process-bulk');

    let products = [];

    const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000'
        ? 'http://localhost:3002'
        : '/api';

    // Simple Authentication Mock
    loginBtn.addEventListener('click', () => {
        if (adminPass.value === 'admin123') {
            loginModal.style.display = 'none';
            loadInventory();
        } else {
            alert('Incorrect password.');
        }
    });

    async function loadInventory() {
        try {
            const response = await fetch(`${API_URL}/products`);
            products = await response.json();
            renderInventory();
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    }

    function renderInventory() {
        inventoryBody.innerHTML = '';
        products.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-family: monospace;">${product.id}</td>
                <td>${product.name}</td>
                <td><input type="number" class="edit-input" value="${product.price}" data-index="${index}" data-field="price"></td>
                <td><input type="number" class="edit-input" value="${product.stock}" data-index="${index}" data-field="stock"></td>
                <td><button class="btn-save save-row" data-index="${index}" style="padding: 4px 8px;">Save</button></td>
            `;
            inventoryBody.appendChild(row);
        });

        document.querySelectorAll('.save-row').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                saveRow(idx);
            });
        });
    }

    async function saveRow(index) {
        const priceInput = document.querySelector(`.edit-input[data-index="${index}"][data-field="price"]`);
        const stockInput = document.querySelector(`.edit-input[data-index="${index}"][data-field="stock"]`);

        products[index].price = parseFloat(priceInput.value);
        products[index].stock = parseInt(stockInput.value);

        try {
            await fetch(`${API_URL}/products/${products[index].id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(products[index])
            });
            console.log('SKU Updated via API:', products[index]);
            alert(`SKU ${products[index].id} updated successfully.`);
        } catch (error) {
            console.error('Error updating SKU:', error);
            alert('Error updating database');
        }
    }

    processBulkBtn.addEventListener('click', async () => {
        try {
            const newData = JSON.parse(bulkJsonArea.value);
            if (Array.isArray(newData)) {
                // Loop to upload each product to API
                for (const product of newData) {
                    await fetch(`${API_URL}/products`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(product)
                    });
                }
                loadInventory();
                alert('Bulk upload processed via API successfully.');
            } else {
                alert('Invalid JSON format. Expected an array of products.');
            }
        } catch (e) {
            alert('JSON Parse or API Error: ' + e.message);
        }
    });

    // Load recent orders from API
    async function loadOrders() {
        const ordersList = document.getElementById('orders-list');
        try {
            const response = await fetch(`${API_URL}/orders?_sort=id&_order=desc`);
            const savedOrders = await response.json();

            if (savedOrders.length > 0) {
                ordersList.innerHTML = savedOrders.map(order => `
                    <div style="border: 1px solid var(--border-soft); padding: 1.5rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <strong>Order #${order.id} - ${order.status} ${order.isEmployeeOrder ? '<span style="color:var(--accent-red);">(Employee)</span>' : ''}</strong>
                            <span>${order.date}</span>
                        </div>
                        <p style="font-size: 0.8rem;">Employee / Email: ${order.userEmail}</p>
                        <p style="font-size: 0.8rem;">Items: ${order.items.map(i => i.name).join(', ')}</p>
                        <p style="font-size: 0.9rem; margin-top: 1rem; font-weight: 600;">Total: $${order.total}</p>
                    </div>
                `).join('');
            } else {
                ordersList.innerHTML = '<p style="font-style: italic; color: var(--text-brown);">No orders found.</p>';
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }

    loadOrders();
    
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            themeToggle.innerText = document.body.classList.contains('dark-mode') ? 'Paper Light' : 'Paper Dark';
        });
    }
});

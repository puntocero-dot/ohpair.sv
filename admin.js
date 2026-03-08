document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');
    const adminPass = document.getElementById('admin-pass');
    const inventoryBody = document.getElementById('inventory-body');
    const bulkJsonArea = document.getElementById('bulk-json');
    const processBulkBtn = document.getElementById('process-bulk');

    let products = [];

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
            const response = await fetch('db.json');
            const data = await response.json();
            products = data.products;
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

    function saveRow(index) {
        const priceInput = document.querySelector(`.edit-input[data-index="${index}"][data-field="price"]`);
        const stockInput = document.querySelector(`.edit-input[data-index="${index}"][data-field="stock"]`);

        products[index].price = parseFloat(priceInput.value);
        products[index].stock = parseInt(stockInput.value);

        // Simulation of notifying the system
        console.log('SKU Updated:', products[index]);
        alert(`SKU ${products[index].id} updated successfully.`);

        // In a real app, this would be a POST/PUT to an API
        localStorage.setItem('ohpair_products', JSON.stringify(products));
    }

    processBulkBtn.addEventListener('click', () => {
        try {
            const newData = JSON.parse(bulkJsonArea.value);
            if (Array.isArray(newData)) {
                products = newData;
                renderInventory();
                alert('Bulk upload processed. (Live in local state)');
                localStorage.setItem('ohpair_products', JSON.stringify(products));
            } else {
                alert('Invalid JSON format. Expected an array of products.');
            }
        } catch (e) {
            alert('JSON Parse Error: ' + e.message);
        }
    });

    // Load recent orders from localStorage
    const loadOrders = () => {
        const ordersList = document.getElementById('orders-list');
        const savedOrders = JSON.parse(localStorage.getItem('ohpair_orders') || '[]');

        if (savedOrders.length > 0) {
            ordersList.innerHTML = savedOrders.map(order => `
                <div style="border: 1px solid var(--border-soft); padding: 1.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <strong>Order #${order.id} - ${order.status}</strong>
                        <span>${order.date}</span>
                    </div>
                    <p style="font-size: 0.8rem;">Employee: ${order.userEmail}</p>
                    <p style="font-size: 0.8rem;">Items: ${order.items.map(i => i.name).join(', ')}</p>
                    <p style="font-size: 0.9rem; margin-top: 1rem; font-weight: 600;">Total: $${order.total}</p>
                </div>
            `).join('');
        }
    };

    loadOrders();
});

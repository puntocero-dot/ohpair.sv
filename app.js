document.addEventListener('DOMContentLoaded', () => {
    let products = [];
    let cart = [];

    const productGrid = document.getElementById('product-grid');
    const cartToggle = document.getElementById('cart-toggle');
    const closeAgent = document.getElementById('close-agent');
    const orderingAgent = document.getElementById('ordering-agent');
    const cartContent = document.getElementById('cart-content');
    const checkoutSection = document.getElementById('checkout-section');
    const totalPriceDisplay = document.getElementById('total-price');
    const themeToggle = document.getElementById('theme-toggle');

    // Fetch Products from Mock DB
    async function fetchProducts() {
        try {
            // Check if we have modified products in localStorage first
            const savedProducts = localStorage.getItem('ohpair_products');
            if (savedProducts) {
                products = JSON.parse(savedProducts);
            } else {
                const response = await fetch('db.json');
                const data = await response.json();
                products = data.products;
            }
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    // Render Products Grid
    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card fade-in';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '1.5rem';

            // Smart Stock Logic
            const isOutOfStock = product.stock === 0;
            const isLowStock = product.stock > 0 && product.stock < 3;

            card.innerHTML = `
                <div style="position: relative; overflow: hidden; aspect-ratio: 4/5;">
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease;">
                    ${isLowStock ? '<span class="badge-retro" style="position: absolute; top: 1rem; right: 1rem;">Last Pairs</span>' : ''}
                    ${isOutOfStock ? '<span class="badge-retro" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: var(--text-primary);">Sold Out</span>' : ''}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <h3 style="font-size: 1.25rem;">${product.name}</h3>
                    <span style="font-family: var(--font-serif);">$${product.price}</span>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-secondary); height: 3em; overflow: hidden;">${product.description}</p>
                <div class="product-actions" style="margin-top: auto;">
                    ${isOutOfStock
                    ? `<button class="preorder-btn" data-id="${product.id}" style="width: 100%; border: 1px solid var(--text-primary); padding: 1rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.1em;">Pre-order (Est. ${product.preorder_date})</button>`
                    : `<button class="add-to-cart-btn" data-id="${product.id}" style="width: 100%; background-color: var(--text-primary); color: white; padding: 1rem; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.1em;">Add to Cart</button>`
                }
                </div>
            `;

            // Hover effects
            const img = card.querySelector('img');
            card.addEventListener('mouseenter', () => img.style.transform = 'scale(1.05)');
            card.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');

            productGrid.appendChild(card);
        });

        attachButtonListeners();
    }

    function attachButtonListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                addToCart(id);
            });
        });

        document.querySelectorAll('.preorder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                // Could logic for "Pre-order" specifically if needed
                addToCart(id, true);
            });
        });
    }

    // Cart Logic
    function addToCart(productId, isPreorder = false) {
        const product = products.find(p => p.id === productId);
        cart.push({ ...product, isPreorder });
        updateCartUI();
        openAgentPanel();
    }

    function updateCartUI() {
        cartToggle.innerText = `Cart (${cart.length})`;

        if (cart.length === 0) {
            cartContent.innerHTML = '<p style="font-family: var(--font-serif); font-style: italic; color: var(--text-secondary);">Your cart is currently empty.</p>';
            checkoutSection.style.display = 'none';
        } else {
            cartContent.innerHTML = cart.map((item, index) => `
                <div style="display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center;">
                    <img src="${item.image}" style="width: 60px; height: 75px; object-fit: cover;">
                    <div style="flex: 1;">
                        <h4 style="font-family: var(--font-serif); font-size: 1rem;">${item.name}</h4>
                        <p style="font-size: 0.7rem; color: var(--text-secondary);">${item.isPreorder ? 'Pre-order Shipment' : 'Stock Ready'}</p>
                    </div>
                    <span>$${item.price}</span>
                    <button class="remove-item" data-index="${index}" style="font-size: 1rem; margin-left: 1rem;">&times;</button>
                </div>
            `).join('');

            const total = cart.reduce((sum, item) => sum + item.price, 0);
            totalPriceDisplay.innerText = `$${total.toFixed(2)}`;
            checkoutSection.style.display = 'block';

            // Attach remove listeners
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = e.target.getAttribute('data-index');
                    cart.splice(idx, 1);
                    updateCartUI();
                });
            });
        }
    }

    function openAgentPanel() {
        orderingAgent.style.right = '0';
    }

    function closeAgentPanel() {
        orderingAgent.style.right = '-100%';
    }

    // Event Listeners
    cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        openAgentPanel();
    });

    closeAgent.addEventListener('click', closeAgentPanel);

    // Simulated Stripe Checkout & Webhook
    document.getElementById('stripe-checkout').addEventListener('click', async () => {
        const btn = document.getElementById('stripe-checkout');
        const userEmail = prompt("Please enter your employee email to complete the purchase:");
        if (!userEmail) return;

        btn.innerText = 'Processing...';
        btn.disabled = true;

        // Generate Order Object
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const newOrder = {
            id: 'ORD-' + Math.floor(Math.random() * 100000),
            date: new Date().toLocaleDateString(),
            items: [...cart],
            total: total.toFixed(2),
            status: 'Processing',
            userEmail: userEmail
        };

        // Save to LocalStorage for Admin visibility
        const currentOrders = JSON.parse(localStorage.getItem('ohpair_orders') || '[]');
        currentOrders.unshift(newOrder); // Add to beginning
        localStorage.setItem('ohpair_orders', JSON.stringify(currentOrders));

        // Simulate API call to Stripe/Webhook
        await new Promise(resolve => setTimeout(resolve, 2000));

        alert(`Order Placed Successfully, ${userEmail}!\n\nA summary has been sent to the Internal Call Center and your email ${userEmail}.\n\n(WhatsApp Notification Triggered)`);

        cart = [];
        updateCartUI();
        closeAgentPanel();
        btn.innerText = 'Proceed to Checkout';
        btn.disabled = false;

        // Show tracking if employee
        showOrderTracking(newOrder);
    });

    function showOrderTracking(order) {
        cartContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3 style="margin-bottom: 1rem;">Tracking Order #${order.id}</h3>
                <div style="background: var(--bg-tan); padding: 1.5rem; margin-bottom: 1rem;">
                    <p style="font-size: 0.8rem; text-transform: uppercase;">Status</p>
                    <p style="font-size: 1.2rem; font-family: var(--font-serif); font-style: italic;">${order.status}</p>
                </div>
                <p style="font-size: 0.7rem;">Expected delivery: 2-3 business days.</p>
                <button id="back-to-shop" style="margin-top: 2rem; border-bottom: 1px solid var(--text-primary); font-size: 0.7rem; text-transform: uppercase;">Continue Shopping</button>
            </div>
        `;
        checkoutSection.style.display = 'none';
        document.getElementById('back-to-shop').addEventListener('click', () => {
            updateCartUI();
        });
    }

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeToggle.innerText = document.body.classList.contains('dark-mode') ? 'Paper Light' : 'Paper Dark';
    });

    // Initialize
    fetchProducts();
});

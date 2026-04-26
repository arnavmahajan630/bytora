import './style.css';

// --- Mock Data ---
const products = [
  {
    id: 1,
    name: "CYBERPUNK GRAPHIC TEE",
    price: 45.00,
    category: "T-Shirts",
    image: "/images/graphic_tee_1777203051077.png",
    badge: "NEW"
  },
  {
    id: 2,
    name: "TACTICAL CARGO PANTS",
    price: 89.00,
    category: "Bottoms",
    image: "/images/baggy_cargo_1777203068239.png",
    badge: "BESTSELLER"
  },
  {
    id: 3,
    name: "NEON RIOT OVERSIZED TEE",
    price: 50.00,
    category: "T-Shirts",
    image: "/images/hero_banner_1777203035232.png", // Reusing hero for now or generic
    badge: ""
  }
];

// --- State ---
let cart = [];
let isLoggedIn = false;
let userEmail = '';

// --- DOM Elements ---
const productGrid = document.getElementById('productGrid');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartSidebar = document.getElementById('cartSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const emptyCartMsg = document.getElementById('emptyCartMsg');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLoginBtn = document.getElementById('closeLoginBtn');
const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginContent = document.getElementById('loginContent');

const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
const toastIcon = document.getElementById('toastIcon');

// --- Functions ---

// Render Products
function renderProducts() {
  productGrid.innerHTML = products.map(product => `
    <div class="group relative bg-dark-900 rounded-sm overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
      ${product.badge ? `<div class="absolute top-4 left-4 z-10 bg-white text-dark-900 text-xs font-bold px-3 py-1 rounded-sm">${product.badge}</div>` : ''}
      <div class="aspect-[4/5] overflow-hidden bg-dark-800 relative">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" loading="lazy">
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button onclick="addToCart(${product.id})" class="px-6 py-3 bg-neon-green text-dark-900 font-bold tracking-wide rounded-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white hover:scale-105">
            ADD TO CART
          </button>
        </div>
      </div>
      <div class="p-6">
        <p class="text-xs text-gray-500 mb-1 uppercase tracking-wider">${product.category}</p>
        <div class="flex justify-between items-start">
          <h3 class="font-bold text-lg leading-tight w-2/3">${product.name}</h3>
          <p class="text-neon-blue font-bold">$${product.price.toFixed(2)}</p>
        </div>
      </div>
    </div>
  `).join('');
}

// Cart Operations
window.addToCart = (productId) => {
  const product = products.find(p => p.id === productId);
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  updateCartUI();
  showToast('Added to cart', 'success');
  
  // Flash cart icon
  cartBtn.classList.add('scale-125');
  setTimeout(() => cartBtn.classList.remove('scale-125'), 200);
};

window.removeFromCart = (productId) => {
  cart = cart.filter(item => item.id !== productId);
  updateCartUI();
};

window.updateQuantity = (productId, delta) => {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      updateCartUI();
    }
  }
};

function updateCartUI() {
  // Update count
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  
  // Update items
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '';
    cartItemsContainer.appendChild(emptyCartMsg);
    checkoutBtn.disabled = true;
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="flex gap-4 bg-dark-900 p-3 rounded-sm border border-white/5">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-24 object-cover rounded-sm bg-dark-800">
        <div class="flex-1 flex flex-col justify-between py-1">
          <div>
            <h4 class="font-bold text-sm leading-tight">${item.name}</h4>
            <p class="text-neon-blue text-sm font-bold mt-1">$${item.price.toFixed(2)}</p>
          </div>
          <div class="flex justify-between items-center mt-2">
            <div class="flex items-center gap-3 bg-dark-800 rounded-sm px-2 py-1">
              <button onclick="updateQuantity(${item.id}, -1)" class="text-gray-400 hover:text-white">-</button>
              <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
              <button onclick="updateQuantity(${item.id}, 1)" class="text-gray-400 hover:text-white">+</button>
            </div>
            <button onclick="removeFromCart(${item.id})" class="text-gray-500 hover:text-red-500 text-xs uppercase tracking-wider transition-colors">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
    checkoutBtn.disabled = false;
  }
  
  // Update total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotal.textContent = '$' + total.toFixed(2);
}

// UI Toggles
function toggleCart() {
  const isOpen = !cartSidebar.classList.contains('translate-x-full');
  if (isOpen) {
    cartSidebar.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
    cartOverlay.classList.remove('opacity-100');
    document.body.style.overflow = '';
  } else {
    cartSidebar.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden');
    // slight delay for transition
    setTimeout(() => cartOverlay.classList.add('opacity-100'), 10);
    document.body.style.overflow = 'hidden';
  }
}

function openLogin() {
  loginModal.classList.remove('hidden');
  loginModal.classList.add('flex');
  setTimeout(() => {
    loginContent.classList.remove('scale-95', 'opacity-0');
    loginContent.classList.add('scale-100', 'opacity-100');
  }, 10);
  document.body.style.overflow = 'hidden';
}

function closeLogin() {
  loginContent.classList.remove('scale-100', 'opacity-100');
  loginContent.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    loginModal.classList.add('hidden');
    loginModal.classList.remove('flex');
    document.body.style.overflow = '';
  }, 300);
}

// Toast Notification
function showToast(message, type = 'info') {
  toastMsg.textContent = message;
  
  if (type === 'success') {
    toastIcon.className = 'w-2 h-full bg-neon-green absolute left-0 top-0 bottom-0 rounded-l-sm';
  } else if (type === 'info') {
    toastIcon.className = 'w-2 h-full bg-neon-purple absolute left-0 top-0 bottom-0 rounded-l-sm';
  }
  
  toast.classList.remove('translate-y-24', 'opacity-0');
  
  setTimeout(() => {
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 3000);
}

// --- Event Listeners ---

cartBtn.addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

loginBtn.addEventListener('click', () => {
  if (isLoggedIn) {
    // Logout
    isLoggedIn = false;
    userEmail = '';
    loginBtn.textContent = 'LOGIN';
    showToast('Logged out successfully');
  } else {
    openLogin();
  }
});

closeLoginBtn.addEventListener('click', closeLogin);
loginOverlay.addEventListener('click', closeLogin);

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  isLoggedIn = true;
  userEmail = email;
  loginBtn.textContent = 'LOGOUT';
  closeLogin();
  showToast(`Welcome back, ${email.split('@')[0]}!`, 'success');
  e.target.reset();
});

checkoutBtn.addEventListener('click', () => {
  if (cart.length > 0) {
    if (!isLoggedIn) {
      toggleCart(); // close cart
      openLogin();
      showToast('Please login to checkout');
      return;
    }
    
    // Process Checkout
    toggleCart();
    cart = [];
    updateCartUI();
    showToast('Order Placed! You will be contacted shortly.', 'success');
  }
});

// Scroll effect for navbar
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('py-2', 'shadow-lg');
    navbar.classList.remove('py-4');
  } else {
    navbar.classList.add('py-4');
    navbar.classList.remove('py-2', 'shadow-lg');
  }
});

// Init
renderProducts();
updateCartUI();

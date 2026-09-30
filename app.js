import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDoc, doc, deleteDoc, query, where, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyBlZIwhWgeWkHrskLCuOVuW4l2P6NZ9__4",
  authDomain: "mabukstock.firebaseapp.com",
  projectId: "mabukstock",
  storageBucket: "mabukstock.firebasestorage.app",
  messagingSenderId: "749625031008",
  appId: "1:749625031008:web:a8e565bcbdde99c22d0605",
  measurementId: "G-0K9NNGR1R7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.querySelector('.dashboard-container');

function updateUIState(user) {
  if (!authContainer || !dashboardContainer) return;

  if (user) {
    authContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
  } else {
    authContainer.style.display = 'block';
    dashboardContainer.style.display = 'none';
  }
}

signupBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    alert("Account created successfully!");
  } catch (error) {
    alert("Error: " + error.message);
  }
});

loginBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    alert("Logged in successfully!");
  } catch (error) {
    alert("Login Error: " + error.message);
  }
});

const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      alert("Logged out successfully!");
    } catch (error) {
      alert("Error logging out: " + error.message);
    }
  });
}

window.handleForgotPassword = async () => {
  const email = prompt("Enter your account email address to reset your password:");
  if (!email) return;

  try {
    await sendPasswordResetEmail(auth, email.trim());
    alert("Password reset email sent! Check your inbox and spam folder.");
  } catch (error) {
    alert("Error sending reset email: " + error.message);
  }
};

let unsubscribeInventory = null;

let currentInventory = [];
const searchBar = document.getElementById('searchBar');
const categoryFilter = document.getElementById('categoryFilter');

function renderInventory() {
  const inventoryList = document.getElementById('inventory-list');
  if (!inventoryList) return;

  const searchTerm = searchBar ? searchBar.value.trim().toLowerCase() : '';
  const selectedCategory = categoryFilter ? categoryFilter.value : 'All';

  inventoryList.innerHTML = '';
  let totalCostSum = 0;
  let totalRevenueSum = 0;

  const filteredItems = currentInventory.filter((item) => {
    const name = (item.name || '').toLowerCase();
    const category = item.category || 'General';
    const matchesSearch = name.includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  filteredItems.forEach((item) => {
    const docId = item.id;
    const name = (item.name && item.name.trim() !== "") ? item.name : "Unnamed Item";
    const category = item.category || "General";
    const qty = Number(item.quantity) || 0;
    const cost = Number(item.cost) || 0;
    const price = Number(item.price) || 0;

    totalCostSum += cost * qty;
    totalRevenueSum += price * qty;

    const itemElement = document.createElement('div');
    itemElement.className = 'stock-item-card';
    itemElement.style.cssText = "padding: 10px; margin-bottom: 8px; border: 1px solid #ddd; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;";
    itemElement.innerHTML = `
      <div>
        <strong>${name}</strong> <small style="color: #666;">(${category})</small>
        <div><small>Qty: ${qty} | Cost: ₦${cost.toLocaleString()} | Selling: ₦${price.toLocaleString()}</small></div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="editStockItem('${docId}')" style="background: #ffc107; color: black; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Edit</button>
        <button onclick="deleteStockItem('${docId}')" style="background: #ff4d4d; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">Delete</button>
      </div>
    `;
    inventoryList.appendChild(itemElement);
  });

  const totalCostEl = document.getElementById('display-cost');
  const totalRevenueEl = document.getElementById('display-revenue');
  const totalProfitEl = document.getElementById('display-profit');

  if (totalCostEl) totalCostEl.textContent = totalCostSum.toLocaleString();
  if (totalRevenueEl) totalRevenueEl.textContent = totalRevenueSum.toLocaleString();
  if (totalProfitEl) totalProfitEl.textContent = (totalRevenueSum - totalCostSum).toLocaleString();
}

if (searchBar) searchBar.addEventListener('input', renderInventory);
if (categoryFilter) categoryFilter.addEventListener('change', renderInventory);

const inventoryForm = document.getElementById('add-item-form');

if (inventoryForm) {
  inventoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to add items.");
      return;
    }

    const nameInput = document.getElementById('itemName');
    const categoryInput = document.getElementById('itemCategory');
    const qtyInput = document.getElementById('itemQty');
    const costInput = document.getElementById('itemCost');
    const priceInput = document.getElementById('itemPrice');

    try {
      await addDoc(collection(db, 'inventory'), {
        name: nameInput.value.trim(),
        category: categoryInput.value || 'General',
        quantity: Number(qtyInput.value) || 0,
        cost: Number(costInput.value) || 0,
        price: Number(priceInput.value) || 0,
        uid: user.uid,
        createdAt: serverTimestamp()
      });

      inventoryForm.reset();
      alert("Item added successfully!");
    } catch (error) {
      alert("Error adding item: " + error.message);
    }
  });
}

onAuthStateChanged(auth, (user) => {
  updateUIState(user);

  if (user) {
    const q = query(collection(db, 'inventory'), where('uid', '==', user.uid));
    unsubscribeInventory = onSnapshot(q, (snapshot) => {
      currentInventory = [];
      snapshot.forEach((docSnap) => {
        currentInventory.push({ id: docSnap.id, ...docSnap.data() });
      });
      renderInventory();
    },
      (error) => {
        console.error("Firestore Subscription Error:", error);
      }
    );
  } else {
    currentInventory = [];
    renderInventory();
    if (unsubscribeInventory) unsubscribeInventory();
  }
});

window.editStockItem = async (docId) => {
  try {
    const docRef = doc(db, 'inventory', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      document.getElementById('itemName').value = data.name || '';
      document.getElementById('itemCategory').value = data.category || 'Tiles';
      document.getElementById('itemQty').value = data.quantity || 1;
      document.getElementById('itemCost').value = data.cost || 0;
      document.getElementById('itemPrice').value = data.price || 0;

      await deleteDoc(docRef);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      alert("Item loaded into form for editing. Make your changes and click 'Add to Inventory'.");
    }
  } catch (error) {
    alert("Error preparing item for edit: " + error.message);
  }
};

window.deleteStockItem = async (docId) => {
  if (confirm("Are you sure you want to delete this item?")) {
    try {
      await deleteDoc(doc(db, 'inventory', docId));
    } catch (error) {
      alert("Error deleting item: " + error.message);
    }
  }
};

document.addEventListener('click', (e) => {
  const btn = e.target.closest('#export-btn') || (e.target.id === 'export-btn' ? e.target : null);
  if (!btn) return;

  e.preventDefault();

  if (!currentInventory || currentInventory.length === 0) {
    alert("No inventory data to export!");
    return;
  }

  let csvContent = "Item Name,Category,Quantity,Unit Cost (Naira),Selling Price (Naira),Total Cost Value,Total Projected Revenue\n";

  currentInventory.forEach((item) => {
    const name = (item.name || "Unnamed Item").replace(/,/g, "");
    const category = item.category || "General";
    const qty = Number(item.quantity) || 0;
    const cost = Number(item.cost) || 0;
    const price = Number(item.price) || 0;

    const totalCostValue = qty * cost;
    const totalRevenueValue = qty * price;

    csvContent += `${name},${category},${qty},${cost},${price},${totalCostValue},${totalRevenueValue}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `MabukStock_Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
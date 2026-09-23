const savedData = localStorage.getItem("businessInventoryDB");

const inventory = savedData ? JSON.parse(savedData) : [
  {
    id: 1,
    name: "Sample Product A",
    quantity: 100,
    unitCost: 1000,
    sellingPrice: 1500
  }
];

function saveInventory() {
  localStorage.setItem("businessInventoryDB", JSON.stringify(inventory));
}

function calculateFinancials(inventoryArray) {
  let totalCost = 0;
  let totalRevenue = 0;

  for (let item of inventoryArray) {
    totalCost += (item.quantity * item.unitCost);
    totalRevenue += (item.quantity * item.sellingPrice);
  }

  let totalProfit = totalRevenue - totalCost;

  return {
    cost: totalCost,
    revenue: totalRevenue,
    profit: totalProfit
  };
}

const listElement = document.getElementById("inventory-list");
const costElement = document.getElementById("display-cost");
const revenueElement = document.getElementById("display-revenue");
const profitElement = document.getElementById("display-profit");
const formElement = document.getElementById("add-item-form");

let editingId = null;
const submitBtn = formElement.querySelector("button");

function editItem(idToEdit) {
  const item = inventory.find(function (i) {
    return i.id === idToEdit;
  });

  if (item) {
    document.getElementById("itemName").value = item.name;
    document.getElementById("itemQty").value = item.quantity;
    document.getElementById("itemCost").value = item.unitCost;
    document.getElementById("itemPrice").value = item.sellingPrice;
    document.getElementById("itemCategory").value = item.category || "Tiles";

    editingId = idToEdit;

    submitBtn.textContent = "Update Item";
    submitBtn.style.background = "#ffc107";
    submitBtn.style.color = "black";
  }
}
function updateDashboard(dataToDisplay = inventory) {  listElement.innerHTML = "";

for (let item of dataToDisplay) {    const li = document.createElement("li");

    const textContainer = document.createElement("div");
    textContainer.style.flexGrow = "1"; // Pushes your Edit/Delete buttons to the right
    textContainer.innerHTML = `
        <strong>${item.name}</strong> 
        <span class="category-badge">${item.category || "Other"}</span>
        <br>
        <span style="font-size: 0.9rem; color: #6c757d;">Qty: ${item.quantity} | Cost: ₦${item.unitCost} | Price: ₦${item.sellingPrice}</span>
    `;
    li.appendChild(textContainer);

const searchBar = document.getElementById("searchBar");
const categoryFilter = document.getElementById("categoryFilter");

function applyFilters() {
    const searchTerm = searchBar.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredResults = inventory.filter(function(item) {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    updateDashboard(filteredResults);
}

searchBar.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginLeft = "15px";
    editBtn.style.background = "#ffc107";
    editBtn.style.border = "none";
    editBtn.style.cursor = "pointer";
    editBtn.style.padding = "2px 8px";

    editBtn.addEventListener("click", function () {
      editItem(item.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "15px";
    deleteBtn.style.background = "#dc3545";
    deleteBtn.style.color = "white";
    deleteBtn.style.border = "none";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.padding = "2px 8px";

    deleteBtn.addEventListener("click", function () {
      deleteItem(item.id);
    });

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    listElement.appendChild(li);
  }

  const financials = calculateFinancials(dataToDisplay);

  costElement.textContent = financials.cost.toLocaleString();
  revenueElement.textContent = financials.revenue.toLocaleString();
  profitElement.textContent = financials.profit.toLocaleString();
}

formElement.addEventListener("submit", function (event) {
  event.preventDefault();

  if (editingId === null) {
    const newItem = {
      id: Date.now(),
      name: document.getElementById("itemName").value,
      quantity: Number(document.getElementById("itemQty").value),
      unitCost: Number(document.getElementById("itemCost").value),
      sellingPrice: Number(document.getElementById("itemPrice").value),
      category: document.getElementById("itemCategory").value,
    };
    inventory.push(newItem);

  } else {
    const index = inventory.findIndex(function (item) {
      return item.id === editingId;
    });

    if (index !== -1) {
      inventory[index].name = document.getElementById("itemName").value;
      inventory[index].quantity = Number(document.getElementById("itemQty").value);
      inventory[index].unitCost = Number(document.getElementById("itemCost").value);
      inventory[index].sellingPrice = Number(document.getElementById("itemPrice").value);
      inventory[index].category = document.getElementById("itemCategory").value;
    }

    editingId = null;
    submitBtn.textContent = "Add to Inventory";
    submitBtn.style.background = "";
    submitBtn.style.color = "";
  }

  saveInventory();
  updateDashboard();
  formElement.reset();
});

updateDashboard();

const exportButton = document.getElementById("export-btn");

exportButton.addEventListener("click", function () {
  let csvContent = "Item ID,Product Name,Quantity,Unit Cost,Selling Price\n";

  for (let item of inventory) {
    csvContent += `${item.id},"${item.name}",${item.quantity},${item.unitCost},${item.sellingPrice}\n`;
  }

  const fileBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const temporaryLink = document.createElement("a");
  const virtualUrl = URL.createObjectURL(fileBlob);

  temporaryLink.setAttribute("href", virtualUrl);
  temporaryLink.setAttribute("download", "Mabuk_Inventory_Report.csv");

  document.body.appendChild(temporaryLink);
  temporaryLink.click();

  document.body.removeChild(temporaryLink);
});

function deleteItem(idToDelete) {
  const isConfirmed = confirm("Are you sure you want to delete this item? This cannot be undone.");

  if (isConfirmed) {
    const index = inventory.findIndex(function (item) {
      return item.id === idToDelete;
    });

    if (index !== -1) {
      inventory.splice(index, 1);
      saveInventory();
      updateDashboard();
    }
  }
}

const searchBar = document.getElementById("searchBar");

searchBar.addEventListener("input", function() {
    const searchTerm = searchBar.value.toLowerCase();
    
    const filteredResults = inventory.filter(function(item) {
        return item.name.toLowerCase().includes(searchTerm);
    });
    
    updateDashboard(filteredResults);
});
// ==========================================
// STEP 1 & 4: DATA SCHEMA & MEMORY
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

// ==========================================
// STEP 2: THE MATH ENGINE
// ==========================================
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

// ==========================================
// STEP 3: THE DASHBOARD INTERFACE
// ==========================================
const listElement = document.getElementById("inventory-list");
const costElement = document.getElementById("display-cost");
const revenueElement = document.getElementById("display-revenue");
const profitElement = document.getElementById("display-profit");
const formElement = document.getElementById("add-item-form");

// ==========================================
// STEP 7: EDIT FEATURE
// ==========================================
let editingId = null; // This will hold the ID of the item being edited
const submitBtn = formElement.querySelector("button"); // Grabs the form's submit button

function editItem(idToEdit) {
  // 1. Find the item in our array
  const item = inventory.find(function(i) {
    return i.id === idToEdit;
  });

  // 2. If we found it, plug its values back into the form inputs
  if (item) {
    document.getElementById("itemName").value = item.name;
    document.getElementById("itemQty").value = item.quantity;
    document.getElementById("itemCost").value = item.unitCost;
    document.getElementById("itemPrice").value = item.sellingPrice;

    // 3. Switch the app to "Edit Mode"
    editingId = idToEdit;
    
    // 4. Change the button so the user knows they are updating, not adding
    submitBtn.textContent = "Update Item";
    submitBtn.style.background = "#ffc107"; // Yellow warning color
    submitBtn.style.color = "black";
  }
}
function updateDashboard() {
  // Clear the list
  listElement.innerHTML = "";

  // Draw the items
  for (let item of inventory) {
    const li = document.createElement("li");
    
    // Set the text for the item
    li.textContent = `${item.name} — Qty: ${item.quantity} | Cost: ₦${item.unitCost} | Price: ₦${item.sellingPrice} `;
    
    // Create the Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginLeft = "15px";
    editBtn.style.background = "#ffc107"; // Yellow
    editBtn.style.border = "none";
    editBtn.style.cursor = "pointer";
    editBtn.style.padding = "2px 8px";
    
    editBtn.addEventListener("click", function() {
      editItem(item.id);
    });

    // Create the delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "15px";
    deleteBtn.style.background = "#dc3545"; // A standard red warning color
    deleteBtn.style.color = "white";
    deleteBtn.style.border = "none";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.padding = "2px 8px";
    
    // Tell the button to run our new deleteItem function when clicked
    deleteBtn.addEventListener("click", function() {
      deleteItem(item.id);
    });

    li.appendChild(editBtn); // Attach Edit first
    li.appendChild(deleteBtn); // Attach Delete second
    listElement.appendChild(li);
  }

  // Run the math engine
  const financials = calculateFinancials(inventory);

  // Update the screen
  costElement.textContent = financials.cost.toLocaleString();
  revenueElement.textContent = financials.revenue.toLocaleString();
  profitElement.textContent = financials.profit.toLocaleString();
}

// Form submission listener (Handles BOTH Add and Edit)
formElement.addEventListener("submit", function(event) {
  event.preventDefault();

  if (editingId === null) {
    // ADD MODE: Create a brand new item
    const newItem = {
      id: Date.now(),
      name: document.getElementById("itemName").value,
      quantity: Number(document.getElementById("itemQty").value),
      unitCost: Number(document.getElementById("itemCost").value),
      sellingPrice: Number(document.getElementById("itemPrice").value)
    };
    inventory.push(newItem);

  } else {
    // EDIT MODE: Find the existing item and update its properties
    const index = inventory.findIndex(function(item) {
      return item.id === editingId;
    });

    if (index !== -1) {
      inventory[index].name = document.getElementById("itemName").value;
      inventory[index].quantity = Number(document.getElementById("itemQty").value);
      inventory[index].unitCost = Number(document.getElementById("itemCost").value);
      inventory[index].sellingPrice = Number(document.getElementById("itemPrice").value);
    }

    // Reset the form back to Add Mode for the next time
    editingId = null;
    submitBtn.textContent = "Add to Inventory";
    submitBtn.style.background = ""; // Removes the yellow color
    submitBtn.style.color = "";
  }

  // Save, redraw, and clear the form (Runs for both modes)
  saveInventory();
  updateDashboard();
  formElement.reset();
});

// Run immediately on page load
updateDashboard();

// ==========================================
// STEP 5: EXPORT TO SPREADSHEET
// ==========================================
const exportButton = document.getElementById("export-btn");

exportButton.addEventListener("click", function() {
  // 1. Create the top row of the spreadsheet (the headers)
  let csvContent = "Item ID,Product Name,Quantity,Unit Cost,Selling Price\n";

  // 2. Loop through our inventory array and format each item as a spreadsheet row
  for (let item of inventory) {
    // We separate each value with a comma, and end the line with \n (new row)
    csvContent += `${item.id},"${item.name}",${item.quantity},${item.unitCost},${item.sellingPrice}\n`;
  }

  // 3. Convert that text into a virtual file (a Blob) in the browser's memory
  const fileBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // 4. Create a hidden HTML download link
  const temporaryLink = document.createElement("a");
  const virtualUrl = URL.createObjectURL(fileBlob);
  
  temporaryLink.setAttribute("href", virtualUrl);
  temporaryLink.setAttribute("download", "Mabuk_Inventory_Report.csv"); 
  
  // 5. Force the browser to secretly click the link and start the download
  document.body.appendChild(temporaryLink);
  temporaryLink.click();
  
  // Clean up by removing the hidden link
  document.body.removeChild(temporaryLink);
});

// ==========================================
// STEP 6: DELETE FEATURE
// ==========================================
function deleteItem(idToDelete) {
  // 1. Find the exact position (index) of the item in our array
  const index = inventory.findIndex(function(item) {
    return item.id === idToDelete;
  });

  // 2. If we found it, remove exactly 1 item at that position
  if (index !== -1) {
    inventory.splice(index, 1); // .splice() is JavaScript's built-in remove command
    
    // 3. Save the new, smaller array to the hard drive
    saveInventory();
    
    // 4. Redraw the screen so the item disappears immediately
    updateDashboard();
  }
}
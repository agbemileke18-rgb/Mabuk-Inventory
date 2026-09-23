# Mabuk Golden Enterprise: Commercial Inventory Dashboard
[Live Demo](https://agbemileke18-rgb.github.io/Mabuk-Inventory/)
[View Source Code](https://github.com/agbemileke18-rgb/Mabuk-Inventory)

A mobile-responsive, client-side web application engineered for commercial supply chain management. Built specifically for local building material suppliers to track stock levels, categorize products, and calculate profit margins in real-time without relying on continuous internet connectivity.

# Key Features

Real-Time Financial Engine: Instantly calculates total inventory valuation and projected gross revenue as items are added, edited, or deleted.

Dual-Parameter Filtering: Users can instantly drill down into inventory using simultaneous text search and category dropdowns (e.g., Tiles, Roofing Sheets).

Offline Data Persistence: Leverages the browser's native `localStorage` API to ensure business data survives page reloads and network interruptions.

Spreadsheet Export: Generates downloadable CSV reports directly in the browser using JavaScript Blobs, allowing seamless integration with Excel/accounting workflows.

Responsive UI: Mobile-first design utilizing CSS Grid and Flexbox for a native-app feel on smartphones and tablets.

# Tech Stack

HTML5 & CSS3 (Custom variables, CSS Grid, Media Queries)
Vanilla JavaScript / ES6+ (No external frameworks or libraries)
Browser APIs (DOM Manipulation, LocalStorage, Blob, URL Interface)

# Technical Highlights for Reviewers

I built this project without React or third-party libraries to demonstrate a rock-solid foundation in core web technologies:
1. State Management: Built a custom JavaScript function to synchronize the data array with the DOM and `localStorage` seamlessly.
2. Performance: Used native array methods (`.map()`, `.filter()`, `.reduce()`) to ensure instant UI updates even as the inventory grows.
3. Security & UX: Implemented form validation and destructive-action safeguards (native `confirm()` dialogs) to prevent accidental data loss.

# Local Setup

1. Clone the repository: `git clone https://github.com/agbemileke18-rgb/mabuk-inventory.git`
2. Open the directory in VS Code.
3. Launch with Live Server (no build steps or npm packages required).
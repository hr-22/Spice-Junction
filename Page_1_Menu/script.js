
// ---- 1. MENU DATA ARRAY ----

var menuItems = [
  // ---- STARTERS ----
  {
    name: "Paneer Tikka",
    price: 220,
    category: "Starters",
    emoji: "🧀",
    bg: "#fff3cd",
    description: "Marinated paneer cubes grilled to perfection in a tandoor.",
    isVeg: true
  },
  {
    name: "Chicken 65",
    price: 280,
    category: "Starters",
    emoji: "🍗",
    bg: "#f8d7da",
    description: "Crispy deep-fried chicken with curry leaves and green chillies.",
    isVeg: false
  },
  {
    name: "Veg Spring Roll",
    price: 160,
    category: "Starters",
    emoji: "🥢",
    bg: "#d4edda",
    description: "Crunchy rolls stuffed with fresh veggies and glass noodles.",
    isVeg: true
  },

  // ---- MAIN COURSE ----
  {
    name: "Butter Chicken",
    price: 340,
    category: "Main Course",
    emoji: "🍲",
    bg: "#fff3cd",
    description: "Tender chicken in a rich, creamy tomato-butter gravy.",
    isVeg: false
  },
  {
    name: "Paneer Butter Masala",
    price: 290,
    category: "Main Course",
    emoji: "🥘",
    bg: "#fce4e4",
    description: "Cottage cheese cubes in a silky, spiced makhani sauce.",
    isVeg: true
  },
  {
    name: "Dal Makhani",
    price: 220,
    category: "Main Course",
    emoji: "🫕",
    bg: "#d4edda",
    description: "Slow-cooked black lentils simmered overnight with butter and cream.",
    isVeg: true
  },

  // ---- BIRYANI ----
  {
    name: "Hyderabadi Dum Biryani",
    price: 380,
    category: "Biryani",
    emoji: "🍚",
    bg: "#fff0d4",
    description: "Aromatic basmati rice layered with spiced mutton, slow-cooked on dum.",
    isVeg: false
  },
  {
    name: "Veg Biryani",
    price: 260,
    category: "Biryani",
    emoji: "🌿",
    bg: "#d4edda",
    description: "Fragrant rice cooked with seasonal vegetables and whole spices.",
    isVeg: true
  },
  {
    name: "Chicken Biryani",
    price: 340,
    category: "Biryani",
    emoji: "🍗",
    bg: "#fce4e4",
    description: "Juicy chicken pieces cooked with saffron-infused basmati rice.",
    isVeg: false
  },

  // ---- DESSERTS ----
  {
    name: "Gulab Jamun",
    price: 90,
    category: "Desserts",
    emoji: "🍮",
    bg: "#fce4d4",
    description: "Soft milk-solid balls soaked in rose-flavored sugar syrup.",
    isVeg: true
  },
  {
    name: "Rasmalai",
    price: 110,
    category: "Desserts",
    emoji: "🍨",
    bg: "#fdf0ff",
    description: "Delicate paneer discs soaked in chilled saffron-cardamom cream.",
    isVeg: true
  },

  // ---- BEVERAGES ----
  {
    name: "Mango Lassi",
    price: 110,
    category: "Beverages",
    emoji: "🥭",
    bg: "#fff3cd",
    description: "Thick chilled yoghurt drink blended with fresh Alphonso mango.",
    isVeg: true
  },
  {
    name: "Masala Chai",
    price: 60,
    category: "Beverages",
    emoji: "☕",
    bg: "#f8d7da",
    description: "Aromatic tea brewed with ginger, cardamom, and spices.",
    isVeg: true
  }
];

// ---- 2. CART STATE ----
var cart = [];

// ---- 3. RENDER MENU CARDS ----
// Builds card HTML for each menu item and inserts it into the grid
function renderCards(items) {
  var grid = document.getElementById("menuGrid");
  grid.innerHTML = ""; // clear existing cards before re-rendering

  // If no items match the filter, show a message
  if (items.length === 0) {
    grid.innerHTML = '<p style="text-align:center; color:#888; grid-column:1/-1;">No items in this category.</p>';
    return;
  }

  // Loop through each item and build a card
  items.forEach(function(item) {

    // Create the outer card div
    var card = document.createElement("div");
    card.className = "menu-card";

    // Build the card's inner HTML
    card.innerHTML =
      '<div class="card-placeholder" style="background:' + item.bg + '">' + item.emoji + '</div>' +
      '<div class="card-body">' +
        '<div class="card-top-row">' +
          '<span class="card-name">' + item.name + '</span>' +
          '<span class="veg-indicator ' + (item.isVeg ? "veg" : "non-veg") + '" title="' + (item.isVeg ? "Veg" : "Non-Veg") + '"></span>' +
        '</div>' +
        '<p class="card-description">' + item.description + '</p>' +
        '<p class="card-price">₹' + item.price + '</p>' +
      '</div>' +
      '<button class="add-btn" onclick="addToCart(this, \'' + item.name + '\')">Add to Cart</button>';

    grid.appendChild(card);
  });
}

// ---- 4. CATEGORY FILTER ----
// Grab filter buttons and add click listeners
var filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(function(btn) {
  btn.addEventListener("click", function() {

    // Remove active class from all buttons
    filterButtons.forEach(function(b) { b.classList.remove("active"); });

    // Add active to the clicked button
    btn.classList.add("active");

    var selected = btn.getAttribute("data-category");

    // Filter items based on selected category
    if (selected === "All") {
      renderCards(menuItems); // show all
    } else {
      var filtered = menuItems.filter(function(item) {
        return item.category === selected;
      });
      renderCards(filtered);
    }
  });
});

// ---- 5. ADD TO CART ----
function addToCart(btn, itemName) {
  // Find the item object from the data array
  var item = menuItems.find(function(m) { return m.name === itemName; });

  // Check if item already exists in cart
  var existing = cart.find(function(c) { return c.item.name === itemName; });

  if (existing) {
    // Item already in cart — increase quantity
    existing.quantity += 1;
  } else {
    // New item — add it to cart with quantity 1
    cart.push({ item: item, quantity: 1 });
  }

  // Update the cart display
  updateCartBar();

  // Button confirmation: briefly change text to "Added!" for 1 second
  btn.textContent = "Added!";
  btn.classList.add("added");
  setTimeout(function() {
    btn.textContent = "Add to Cart";
    btn.classList.remove("added");
  }, 1000);
}

// ---- 6. UPDATE CART BAR ----
// Recalculates total items + total price and updates the sticky bar
function updateCartBar() {
  var totalItems = 0;
  var totalAmount = 0;

  cart.forEach(function(c) {
    totalItems += c.quantity;
    totalAmount += c.item.price * c.quantity;
  });

  // Update the counts shown in the bar
  document.getElementById("cartCount").textContent = totalItems;
  document.getElementById("cartTotal").textContent = totalAmount;

  // Show or hide the cart bar
  var cartBar = document.getElementById("cartBar");
  if (totalItems > 0) {
    cartBar.classList.add("visible");
  } else {
    cartBar.classList.remove("visible");
  }

  // Update the expanded item-wise breakdown list
  var list = document.getElementById("cartItemList");
  list.innerHTML = "";
  cart.forEach(function(c) {
    var li = document.createElement("li");
    li.innerHTML =
      '<span>' + c.item.name + ' × ' + c.quantity + '</span>' +
      '<span>₹' + (c.item.price * c.quantity) + '</span>';
    list.appendChild(li);
  });
}

// ---- 7. TOGGLE CART EXPANDED VIEW ----
function toggleCartDetails() {
  var details = document.getElementById("cartDetails");
  var hint = document.querySelector(".cart-toggle-hint");

  details.classList.toggle("open");

  // Update the arrow hint text
  if (details.classList.contains("open")) {
    hint.textContent = "▼ Hide Cart";
  } else {
    hint.textContent = "▲ View Cart";
  }
}

// ---- 8. CLEAR CART ----
function clearCart() {
  cart = [];
  updateCartBar();
  // Also close the expanded panel
  document.getElementById("cartDetails").classList.remove("open");
}

// ---- 9. INITIAL RENDER ----
// Run on page load to show all menu items
renderCards(menuItems);

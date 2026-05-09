const productI18nKeys = {
    "Baseball caps": "product.baseballCaps",
    "Snapbacks": "product.snapbacks",
    "Beanies": "product.beanies",
    "Bucket hats": "product.bucketHats",

    "Mugs": "product.mugs",
    "Water bottles": "product.waterBottles",
    "Tumblers": "product.tumblers",

    "T-shirts": "product.tshirts",
    "Sweatshirts": "product.sweatshirts",
    "Hoodies": "product.hoodies",

    "Pillow cases": "product.pillowCases",
    "Tote bags": "product.toteBags",
    "Stickers": "product.stickers",

    "Posters": "product.posters",
    "Framed posters": "product.framedPosters",
    "Canvas prints": "product.canvasPrints"
};

function getProductDisplayName(productName) {
    const key = productI18nKeys[productName];

    if (window.i18n && key) {
        return window.i18n.t(key);
    }

    return productName;
}
function tr(key, fallback) {
    return window.i18n && typeof window.i18n.t === "function"
        ? window.i18n.t(key)
        : fallback;
}

function applyI18nNow() {
    if (window.i18n && typeof window.i18n.applyTranslations === "function") {
        window.i18n.applyTranslations();
    }
}

// user feedback logic
function showFeedback(message, type = 'success') {
    const existingFeedback = document.querySelector('.feedback-message');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    const feedback = document.createElement('div');
    feedback.className = `feedback-message feedback-${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        font-size: 16px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

//adding
function openSidebar() {
    var side = document.getElementById('sidebar');
    side.style.display = (side.style.display === "block") ? "none" : "block";
}

function closeSidebar() {
    document.getElementById('sidebar').style.display = 'none';
}


function openForm() {
    var form = document.getElementById("order-form")
    form.style.display = (form.style.display === "block") ? "none" : "block";
}

function closeForm() {
    const form = document.getElementById("order-form");
    form.style.display = "none";

    // === 新增：重置按钮和表单 ===
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.dataset.mode = "add";
    submitBtn.setAttribute("data-i18n", "common.add");
    submitBtn.textContent = tr("common.add", "Add");

    form.reset();
}

let orders = [];

window.onload = function () {
    const storedOrders = localStorage.getItem("bizTrackOrders");
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
    } else {
        orders = [
        {
            orderID: "1001",
            orderDate: "2024-01-05",
            itemName: "Baseball caps",
            itemPrice: 25.00,
            qtyBought: 2,
            shipping: 2.50,
            taxes: 9.00,
            orderTotal: 61.50,
            orderStatus: "Pending"
        },
        {
            orderID: "1002",
            orderDate: "2024-03-05",
            itemName: "Water bottles",
            itemPrice: 17.00,
            qtyBought: 3,
            shipping: 3.50,
            taxes: 6.00,
            orderTotal: 60.50,
            orderStatus: "Processing"
        },
        {
            orderID: "1003",
            orderDate: "2024-02-05",
            itemName: "Tote bags",
            itemPrice: 20.00,
            qtyBought: 4,
            shipping: 2.50,
            taxes: 2.00,
            orderTotal: 84.50,
            orderStatus: "Shipped"
        },
        {
            orderID: "1004",
            orderDate: "2023-01-05",
            itemName: "Canvas prints",
            itemPrice: 55.00,
            qtyBought: 1,
            shipping: 2.50,
            taxes: 19.00,
            orderTotal: 76.50,
            orderStatus: "Delivered"
        },
        {
            orderID: "1005",
            orderDate: "2024-01-15",
            itemName: "Beanies",
            itemPrice: 15.00,
            qtyBought: 2,
            shipping: 3.90,
            taxes: 4.00,
            orderTotal: 37.90,
            orderStatus: "Pending"
        },
        ];

        localStorage.setItem("bizTrackOrders", JSON.stringify(orders));
    }

    renderOrders(orders);
}

function addOrUpdate(event) {
    event.preventDefault();
    const submitBtn = document.getElementById("submitBtn");
    const mode = submitBtn.dataset.mode || "add";

    if (mode === "add") {
        newOrder(event);
    } else if (mode === "update") {
        const orderID = document.getElementById("order-id").value;
        updateOrder(orderID);
    }
}


function newOrder(event) {
  event.preventDefault();
  const orderID = document.getElementById("order-id").value;
  const orderDate = document.getElementById("order-date").value;
  const itemName = document.getElementById("item-name").value;
  const itemPrice = parseFloat(document.getElementById("item-price").value);
  const qtyBought = parseInt(document.getElementById("qty-bought").value);
  const shipping = parseFloat(document.getElementById("shipping").value);
  const taxes = parseFloat(document.getElementById("taxes").value);
  const orderTotal = ((itemPrice * qtyBought) + shipping + taxes);
  const orderStatus = document.getElementById("order-status").value;

  if (isDuplicateID(orderID, null)) {
    alert(tr("orders.duplicateId", "Order ID already exists. Please use a unique ID."));
    return;
  }

  const order = {
    orderID,
    orderDate,
    itemName,
    itemPrice,
    qtyBought,
    shipping,
    taxes,
    orderTotal,
    orderStatus,
  };

  orders.push(order);

  renderOrders(orders);
  localStorage.setItem("bizTrackOrders", JSON.stringify(orders));

  document.getElementById("order-form").reset();
  //adding
  closeForm();
  showFeedback(tr("common.addedSuccessfully", "Added successfully!"), "success");
}


function renderOrders(orders) {
    const orderTableBody = document.getElementById("tableBody");
    orderTableBody.innerHTML = "";

    const orderToRender = orders;
    const statusMap = {
        "Pending": "pending",
        "Processing": "processing",
        "Shipped": "shipped",
        "Delivered": "delivered"
    };

    const statusI18nMap = {
        "Pending": "status.pending",
        "Processing": "status.processing",
        "Shipped": "status.shipped",
        "Delivered": "status.delivered"
    };

    orderToRender.forEach(order => {
        const orderRow = document.createElement("tr");
        orderRow.className = "order-row";

        orderRow.dataset.orderID = order.orderID;
        orderRow.dataset.orderDate = order.orderDate;
        orderRow.dataset.itemName = order.itemName;
        orderRow.dataset.itemPrice = order.itemPrice;
        orderRow.dataset.qtyBought = order.qtyBought;
        orderRow.dataset.shipping = order.shipping;
        orderRow.dataset.taxes = order.taxes;
        orderRow.dataset.orderTotal = order.orderTotal;
        orderRow.dataset.orderStatus = order.orderStatus;

        const formattedPrice = typeof order.itemPrice === 'number' ? `$${order.itemPrice.toFixed(2)}` : '';
        const formattedShipping = typeof order.shipping === 'number' ? `$${order.shipping.toFixed(2)}` : '';
        const formattedTaxes = typeof order.taxes === 'number' ? `$${order.taxes.toFixed(2)}` : '';
        const formattedTotal = typeof order.orderTotal === 'number' ? `$${order.orderTotal.toFixed(2)}` : '';

        const orderIdTd = document.createElement("td");
        orderIdTd.textContent = order.orderID;
        orderRow.appendChild(orderIdTd);

        const orderDateTd = document.createElement("td");
        orderDateTd.textContent = order.orderDate;
        orderRow.appendChild(orderDateTd);

        const itemNameTd = document.createElement("td");
        itemNameTd.dataset.productName = order.itemName;
        itemNameTd.textContent = getProductDisplayName(order.itemName);
        orderRow.appendChild(itemNameTd);

        const itemPriceTd = document.createElement("td");
        itemPriceTd.textContent = formattedPrice;
        orderRow.appendChild(itemPriceTd);

        const qtyBoughtTd = document.createElement("td");
        qtyBoughtTd.textContent = order.qtyBought;
        orderRow.appendChild(qtyBoughtTd);

        const shippingTd = document.createElement("td");
        shippingTd.textContent = formattedShipping;
        orderRow.appendChild(shippingTd);

        const taxesTd = document.createElement("td");
        taxesTd.textContent = formattedTaxes;
        orderRow.appendChild(taxesTd);

        const totalTd = document.createElement("td");
        totalTd.className = "order-total";
        totalTd.textContent = formattedTotal;
        orderRow.appendChild(totalTd);

        const statusTd = document.createElement("td");
        const statusDiv = document.createElement("div");

        const statusClass = statusMap[order.orderStatus] || "";
        const statusKey = statusI18nMap[order.orderStatus] || "";

        statusDiv.className = "status " + statusClass;

        const statusSpan = document.createElement("span");
        statusSpan.setAttribute("data-i18n", statusKey);
        statusSpan.textContent = tr(statusKey, order.orderStatus);

        statusDiv.appendChild(statusSpan);
        statusTd.appendChild(statusDiv);
        orderRow.appendChild(statusTd);

        const actionTd = document.createElement("td");
        actionTd.className = "action";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "action-button edit-button";
        editButton.setAttribute("aria-label", `${tr("common.editOrder", "Edit order")} ${order.orderID}`);
        editButton.addEventListener("click", function() { editRow(order.orderID); });

        const editIcon = document.createElement("i");
        editIcon.className = "edit-icon fa-solid fa-pen-to-square";
        editIcon.setAttribute("aria-hidden", "true");
        editButton.appendChild(editIcon);
        actionTd.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "action-button delete-button";
        deleteButton.setAttribute("aria-label", `${tr("common.deleteOrder", "Delete order")} ${order.orderID}`);
        deleteButton.addEventListener("click", function() { deleteOrder(order.orderID); });

        const deleteIcon = document.createElement("i");
        deleteIcon.className = "delete-icon fas fa-trash-alt";
        deleteIcon.setAttribute("aria-hidden", "true");
        deleteButton.appendChild(deleteIcon);
        actionTd.appendChild(deleteButton);

        orderRow.appendChild(actionTd);
        orderTableBody.appendChild(orderRow);
    });
  displayRevenue();
  applyI18nNow();
}

function displayRevenue() {
    const resultElement = document.getElementById("total-revenue");

    const totalRevenue = orders
        .reduce((total, order) => total + order.orderTotal, 0);

    resultElement.innerHTML = `<span data-i18n="orders.totalRevenue">Total Revenue</span>: $${totalRevenue.toFixed(2)}`;
}

function editRow(orderID) {
    const orderToEdit = orders.find(order => order.orderID === orderID);

    document.getElementById("order-id").value = orderToEdit.orderID;
    document.getElementById("order-date").value = orderToEdit.orderDate;
    document.getElementById("item-name").value = orderToEdit.itemName;
    document.getElementById("item-price").value = orderToEdit.itemPrice;
    document.getElementById("qty-bought").value = orderToEdit.qtyBought;
    document.getElementById("shipping").value = orderToEdit.shipping;
    document.getElementById("taxes").value = orderToEdit.taxes;
    document.getElementById("order-total").value = orderToEdit.orderTotal;
    document.getElementById("order-status").value = orderToEdit.orderStatus;

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.dataset.mode = "update";
    submitBtn.setAttribute("data-i18n", "common.update");
    submitBtn.textContent = tr("common.update", "Update");

    document.getElementById("order-form").style.display = "block";
}

function deleteOrder(orderID) {
    //adding
    if (!confirm(tr("common.confirmDelete", "Are you sure you want to delete?"))) {
    return;
}
  const indexToDelete = orders.findIndex(order => order.orderID === orderID);

  if (indexToDelete !== -1) {
      orders.splice(indexToDelete, 1);

      localStorage.setItem("bizTrackOrders", JSON.stringify(orders));

      renderOrders(orders);
      //adding
      showFeedback(tr("common.deletedSuccessfully", "Deleted successfully!"), "success");

  }
}

function updateOrder(orderID) {
    const indexToUpdate = orders.findIndex(order => order.orderID === orderID);

    if (indexToUpdate !== -1) {
        const itemPrice = parseFloat(document.getElementById("item-price").value);
        const qtyBought = parseInt(document.getElementById("qty-bought").value);
        const shipping = parseFloat(document.getElementById("shipping").value);
        const taxes = parseFloat(document.getElementById("taxes").value);
        const updatedOrder = {
            orderID: document.getElementById("order-id").value,
            orderDate: document.getElementById("order-date").value,
            itemName: document.getElementById("item-name").value,
            itemPrice: itemPrice,
            qtyBought: qtyBought,
            shipping: shipping,
            taxes: taxes,
            orderTotal: ((itemPrice * qtyBought) + shipping + taxes),
            orderStatus: document.getElementById("order-status").value,
        };

        if (isDuplicateID(updatedOrder.orderID, orderID)) {
            alert(tr("orders.duplicateId", "Order ID already exists. Please use a unique ID."));
            return;
        }

        orders[indexToUpdate] = updatedOrder;

        localStorage.setItem("bizTrackOrders", JSON.stringify(orders));

        renderOrders(orders);

        document.getElementById("order-form").reset();
        const submitBtn = document.getElementById("submitBtn");
        submitBtn.dataset.mode = "add";
        submitBtn.setAttribute("data-i18n", "common.add");
        submitBtn.textContent = tr("common.add", "Add");
        //adding
        closeForm();
        showFeedback(tr("common.updatedSuccessfully", "Updated successfully!"), "success");
    }
}

function isDuplicateID(orderID, currentID) {
    return orders.some(order => order.orderID === orderID && order.orderID !== currentID);
}

function sortTable(column, button) {
    const tbody = document.getElementById("tableBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    const isNumeric = column === "itemPrice" || column === "qtyBought" || column === "shipping"|| column === "taxes"|| column === "orderTotal";

    const sortedRows = rows.sort((a, b) => {
        const aValue = isNumeric ? parseFloat(a.dataset[column]) : a.dataset[column];
        const bValue = isNumeric ? parseFloat(b.dataset[column]) : b.dataset[column];

        if (typeof aValue === "string" && typeof bValue === "string") {
            // Case-insensitive string comparison for text columns
            return aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
        } else {
            return aValue - bValue;
        }
    });

    rows.forEach(row => tbody.removeChild(row));

    sortedRows.forEach(row => tbody.appendChild(row));

    updateSortState(button);
}

function updateSortState(activeButton) {
    document.querySelectorAll("th[aria-sort]").forEach(th => {
        th.setAttribute("aria-sort", "none");
    });

    if (activeButton) {
        activeButton.closest("th").setAttribute("aria-sort", "ascending");
    }
}

document.getElementById("searchInput").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        performSearch();
    }
});


function performSearch() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    const rows = document.querySelectorAll(".order-row");

    rows.forEach(row => {
        const visible = row.innerText.toLowerCase().includes(searchInput);
        row.style.display = visible ? "table-row" : "none";
    });
}


function exportToCSV() {
    const ordersToExport = orders.map(order => {
        return {
            orderID: order.orderID,
            orderDate: order.orderDate,
            itemName: order.itemName,
            itemPrice: order.itemPrice.toFixed(2),
            qtyBought: order.qtyBought,
            shipping: order.shipping.toFixed(2),
            taxes: order.taxes.toFixed(2),
            orderTotal: order.orderTotal.toFixed(2),
            orderStatus: order.orderStatus,
        };
    });

    const csvContent = generateCSV(ordersToExport);

    const blob = new Blob([csvContent], { type: 'text/csv' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'biztrack_order_table.csv';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
}

function generateCSV(data) {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(order => Object.values(order).join(','));

    return `${headers}\n${rows.join('\n')}`;
}

if (typeof module !== "undefined") {
  module.exports = {
    showFeedback,
    openSidebar,
    closeSidebar,
    openForm,
    closeForm,
    addOrUpdate,
    newOrder,
    renderOrders,
    displayRevenue,
    editRow,
    deleteOrder,
    updateOrder,
    isDuplicateID,
    sortTable,
    updateSortState,
    performSearch,
    exportToCSV,
    generateCSV,
    getProductDisplayName,
  };
}

document.addEventListener("languageChanged", () => {
    renderOrders(orders);
});
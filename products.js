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
    var form = document.getElementById("product-form")
    form.style.display = (form.style.display === "block") ? "none" : "block";
}

function closeForm() {
    document.getElementById("product-form").style.display = "none";
}

function fillCategoryFromProductName() {
  const productNameSelect = document.getElementById("product-name");
  const productCatSelect = document.getElementById("product-cat");

  if (!productNameSelect || !productCatSelect) {
    return;
  }

  const selectedOption = productNameSelect.options[productNameSelect.selectedIndex];
  const category = selectedOption?.dataset.category;

  if (category) {
    productCatSelect.value = category;
  }
}

let products = [];

function init() {
  const storedProducts = localStorage.getItem("bizTrackProducts");
  if (storedProducts) {
      products = JSON.parse(storedProducts);
  } else {
      products = [
        {
          prodID: "PD001",
          prodName: "Baseball caps",
          prodDesc: "Peace embroidered cap",
          prodCat: "Hats",
          prodPrice: 25.00,
          prodSold: 20
        },
        {
          prodID: "PD002",
          prodName: "Water bottles",
          prodDesc: "Floral lotus printed bottle",
          prodCat: "Drinkware",
          prodPrice: 48.50,
          prodSold: 10
        },
        {
          prodID: "PD003",
          prodName: "Sweatshirts",
          prodDesc: "Palestine sweater",
          prodCat: "Clothing",
          prodPrice: 17.50,
          prodSold: 70
        },
        {
          prodID: "PD004",
          prodName: "Posters",
          prodDesc: "Vibes printed poster",
          prodCat: "Home decor",
          prodPrice: 12.00,
          prodSold: 60
        },
        {
          prodID: "PD005",
          prodName: "Pillow cases",
          prodDesc: "Morrocan print pillow case",
          prodCat: "Accessories",
          prodPrice: 17.00,
          prodSold: 40
        },
      ];

      localStorage.setItem("bizTrackProducts", JSON.stringify(products));
    }

    renderProducts(products);
    setupProductCategoryAutoFill();
}

function addOrUpdate(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const mode = submitBtn.dataset.mode || "add";

  if (mode === "add") {
    newProduct(event);
  } else if (mode === "update") {
    const prodID = document.getElementById("product-id").value;
    updateProduct(prodID);
  }
}

function newProduct(event) {
  event.preventDefault();
  const prodID = document.getElementById("product-id").value;
  const prodName = document.getElementById("product-name").value;
  const prodDesc = document.getElementById("product-desc").value;
  const prodCat = document.getElementById("product-cat").value;
  const prodPrice = parseFloat(document.getElementById("product-price").value);
  const prodSold = parseInt(document.getElementById("product-sold").value);

  if (isDuplicateID(prodID, null)) {
    alert(tr("products.duplicateId", "Product ID already exists. Please use a unique ID."));
    return;
  }

  const product = {
    prodID,
    prodName,
    prodDesc,
    prodCat,
    prodPrice,
    prodSold,
  };

  products.push(product);

  renderProducts(products);
  localStorage.setItem("bizTrackProducts", JSON.stringify(products));

  document.getElementById("product-form").reset();
  closeForm();
  showFeedback(tr("common.addedSuccessfully", "Added successfully!"), "success");
}


function renderProducts(products) {
  const prodTableBody = document.getElementById("tableBody");
  prodTableBody.innerHTML = "";

  const prodToRender = products;

  prodToRender.forEach(product => {
      const prodRow = document.createElement("tr");
      prodRow.className = "product-row";

      prodRow.dataset.prodID = product.prodID;
      prodRow.dataset.prodName = product.prodName;
      prodRow.dataset.prodDesc = product.prodDesc;
      prodRow.dataset.prodCat = product.prodCat;
      prodRow.dataset.prodPrice = product.prodPrice;
      prodRow.dataset.prodSold = product.prodSold;

      const textFields = [
        product.prodID,
        getProductNameLabel(product.prodName),
        product.prodDesc,
       getCategoryLabel(product.prodCat),
        `$${product.prodPrice.toFixed(2)}`,
        product.prodSold
      ];
      textFields.forEach(text => {
        const td = document.createElement("td");
        td.textContent = text;
        prodRow.appendChild(td);
      });

      const actionTd = document.createElement("td");
      actionTd.className = "action";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "action-button edit-button";
      editButton.setAttribute("aria-label", `${tr("common.editProduct", "Edit product")} ${product.prodID}`);
      editButton.addEventListener("click", function() { editRow(product.prodID); });

      const editIcon = document.createElement("i");
      editIcon.className = "edit-icon fa-solid fa-pen-to-square";
      editIcon.setAttribute("aria-hidden", "true");
      editButton.appendChild(editIcon);
      actionTd.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "action-button delete-button";
      deleteButton.setAttribute("aria-label", `${tr("common.deleteProduct", "Delete product")} ${product.prodID}`);
      deleteButton.addEventListener("click", function() { deleteProduct(product.prodID); });

      const deleteIcon = document.createElement("i");
      deleteIcon.className = "delete-icon fas fa-trash-alt";
      deleteIcon.setAttribute("aria-hidden", "true");
      deleteButton.appendChild(deleteIcon);
      actionTd.appendChild(deleteButton);

      prodRow.appendChild(actionTd);
      prodTableBody.appendChild(prodRow);
  });

  applyI18nNow();
}

function editRow(prodID) {
  const productToEdit = products.find(product => product.prodID === prodID);

  document.getElementById("product-id").value = productToEdit.prodID;
  document.getElementById("product-name").value = productToEdit.prodName;
  document.getElementById("product-desc").value = productToEdit.prodDesc;
  document.getElementById("product-cat").value = productToEdit.prodCat;
  document.getElementById("product-price").value = productToEdit.prodPrice;
  document.getElementById("product-sold").value = productToEdit.prodSold;

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.dataset.mode = "update";
  submitBtn.setAttribute("data-i18n", "common.update");
  submitBtn.textContent = tr("common.update", "Update");

  document.getElementById("product-form").style.display = "block";
}

function deleteProduct(prodID) {
  if (!confirm(tr("common.confirmDelete", "Are you sure you want to delete?"))) {
    return;
  }
  const indexToDelete = products.findIndex(product => product.prodID === prodID);

  if (indexToDelete !== -1) {
      products.splice(indexToDelete, 1);

      localStorage.setItem("bizTrackProducts", JSON.stringify(products));

      renderProducts(products);
      showFeedback(tr("common.deletedSuccessfully", "Deleted successfully!"), "success");
  }
}

function updateProduct(prodID) {
    const indexToUpdate = products.findIndex(product => product.prodID === prodID);

    if (indexToUpdate !== -1) {
        const updatedProduct = {
            prodID: document.getElementById("product-id").value,
            prodName: document.getElementById("product-name").value,
            prodDesc: document.getElementById("product-desc").value,
            prodCat: document.getElementById("product-cat").value,
            prodPrice: parseFloat(document.getElementById("product-price").value),
            prodSold: parseInt(document.getElementById("product-sold").value),
        };

        if (isDuplicateID(updatedProduct.prodID, prodID)) {
            alert(tr("products.duplicateId", "Product ID already exists. Please use a unique ID."));
            return;
        }

        products[indexToUpdate] = updatedProduct;

        localStorage.setItem("bizTrackProducts", JSON.stringify(products));

        renderProducts(products);

        document.getElementById("product-form").reset();

        const submitBtn = document.getElementById("submitBtn");
        submitBtn.dataset.mode = "add";
        submitBtn.setAttribute("data-i18n", "common.add");
        submitBtn.textContent = tr("common.add", "Add");

        closeForm();
        showFeedback(tr("common.updatedSuccessfully", "Updated successfully!"), "success");
    }
}

function isDuplicateID(prodID, currentID) {
    return products.some(product => product.prodID === prodID && product.prodID !== currentID);
}

function sortTable(column, button) {
    const tbody = document.getElementById("tableBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    const isNumeric = column === "prodPrice" || column === "prodSold";

    const sortedRows = rows.sort((a, b) => {
        const aValue = isNumeric ? parseFloat(a.dataset[column]) : a.dataset[column];
        const bValue = isNumeric ? parseFloat(b.dataset[column]) : b.dataset[column];

        if (typeof aValue === "string" && typeof bValue === "string") {
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
    const rows = document.querySelectorAll(".product-row");

    rows.forEach(row => {
        const visible = row.innerText.toLowerCase().includes(searchInput);
        row.style.display = visible ? "table-row" : "none";
    });
}


function exportToCSV() {
  const productsToExport = products.map(product => {
      return {
        prodID: product.prodID,
        prodName: product.prodName,
        prodDesc: product.prodDesc,
        prodCategory: product.prodCat,
        prodPrice: product.prodPrice.toFixed(2),
        QtySold: product.prodSold,
      };
  });

  const csvContent = generateCSV(productsToExport);

  const blob = new Blob([csvContent], { type: 'text/csv' });

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'biztrack_product_table.csv';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
}

function escapeCSVValue(value) {
  const stringValue = String(value);

  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function generateCSV(data) {
  if (!data.length) {
    return "";
  }

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row =>
    Object.values(row).map(escapeCSVValue).join(",")
  );

  return `${headers}\n${rows.join("\n")}`;
}

function setupProductCategoryAutoFill() {
  const productNameSelect = document.getElementById("product-name");

  if (!productNameSelect) {
    return;
  }

  if (productNameSelect.dataset.categoryAutofillBound === "true") {
    return;
  }

  productNameSelect.dataset.categoryAutofillBound = "true";
  productNameSelect.addEventListener("change", fillCategoryFromProductName);
}

function getCategoryLabel(category) {
  const categoryMap = {
    "Hats": "category.hats",
    "Drinkware": "category.drinkware",
    "Clothing": "category.clothing",
    "Accessories": "category.accessories",
    "Home decor": "category.homeDecor",
  };

  const key = categoryMap[category];

  return key ? tr(key, category) : category;
}

function getProductNameLabel(productName) {
  const productMap = {
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
    "Canvas prints": "product.canvasPrints",
  };

  const key = productMap[productName];

  return key ? tr(key, productName) : productName;
}

document.addEventListener("languageChanged", () => {
  renderProducts(products);
});

init();

if (typeof module !== "undefined") {
  module.exports = {
    showFeedback,
    openSidebar,
    closeSidebar,
    openForm,
    closeForm,
    init,
    addOrUpdate,
    newProduct,
    renderProducts,
    editRow,
    deleteProduct,
    updateProduct,
    isDuplicateID,
    sortTable,
    updateSortState,
    performSearch,
    exportToCSV,
    generateCSV,
    fillCategoryFromProductName,
    setupProductCategoryAutoFill,
    getCategoryLabel,
    getProductNameLabel,
  };
}

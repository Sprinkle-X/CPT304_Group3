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
    var form = document.getElementById("transaction-form")
    form.style.display = (form.style.display === "block") ? "none" : "block";
}

function closeForm() {
    const form = document.getElementById("transaction-form");
    form.style.display = "none";

    // === 新增：重置按钮和表单 ===
    const submitBtn = document.getElementById("submitBtn");
    submitBtn.dataset.mode = "add";
    submitBtn.textContent = tr("common.add", "Add");

    form.reset();
}


let transactions = [];
let serialNumberCounter;

window.onload = function () {
    const storedTransactions = localStorage.getItem("bizTrackTransactions");
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    } else {
        transactions = [
            {
                trID: 1,
                trDate: "2024-01-05",
                trCategory: "Rent",
                trAmount: 100.00,
                trNotes: "January Rent"
            },
            {
                trID: 2,
                trDate: "2024-01-15",
                trCategory: "Order Fulfillment",
                trAmount: 35.00,
                trNotes: "Order #1005"
            },
            {
                trID: 3,
                trDate: "2024-01-08",
                trCategory: "Utilities",
                trAmount: 120.00,
                trNotes: "Internet"
            },
            {
                trID: 4,
                trDate: "2024-02-05",
                trCategory: "Supplies",
                trAmount: 180.00,
                trNotes: "Embroidery Machine"
            },
            {
                trID: 5,
                trDate: "2024-01-25",
                trCategory: "Miscellaneous",
                trAmount: 20.00,
                trNotes: "Pizza"
            },
        ];

        serialNumberCounter = transactions.length + 1

        localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));
    }

    renderTransactions(transactions);
}

function addOrUpdate(event) {
    event.preventDefault();

    const submitBtn = document.getElementById("submitBtn");
    const mode = submitBtn.dataset.mode || "add";

    if (mode === "add") {
        newTransaction(event);
    } else if (mode === "update") {
        const trId = document.getElementById("tr-id").value;
        updateTransaction(+trId);
    }
}


function newTransaction(event) {
    event.preventDefault();
    const trDate = document.getElementById("tr-date").value;
    const trCategory = document.getElementById("tr-category").value;
    const trAmount = parseFloat(document.getElementById("tr-amount").value);
    const trNotes = document.getElementById("tr-notes").value;

    serialNumberCounter = transactions.length + 1;
    let trID = serialNumberCounter;

    const transaction = {
      trID,
      trDate,
      trCategory,
      trAmount,
      trNotes,
    };

    transactions.push(transaction);

    renderTransactions(transactions);
    localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));

    serialNumberCounter++;
    displayExpenses();

    document.getElementById("transaction-form").reset();
    closeForm();
    showFeedback(tr("common.addedSuccessfully", "Added successfully!"), "success");
}


function renderTransactions(transactions) {
    const transactionTableBody = document.getElementById("tableBody");
    transactionTableBody.innerHTML = "";

    const transactionToRender = transactions;

    transactionToRender.forEach(transaction => {
        const transactionRow = document.createElement("tr");
        transactionRow.className = "transaction-row";

        transactionRow.dataset.trID = transaction.trID;
        transactionRow.dataset.trDate = transaction.trDate;
        transactionRow.dataset.trCategory = transaction.trCategory;
        transactionRow.dataset.trAmount = transaction.trAmount;
        transactionRow.dataset.trNotes = transaction.trNotes;

        const formattedAmount = typeof transaction.trAmount === 'number' ? `$${transaction.trAmount.toFixed(2)}` : '';

        const textFields = [
          transaction.trID,
          transaction.trDate,
          transaction.trCategory
        ];
        textFields.forEach(text => {
          const td = document.createElement("td");
          td.textContent = text;
          transactionRow.appendChild(td);
        });

        const amountTd = document.createElement("td");
        amountTd.className = "tr-amount";
        amountTd.textContent = formattedAmount;
        transactionRow.appendChild(amountTd);

        const notesTd = document.createElement("td");
        notesTd.textContent = transaction.trNotes;
        transactionRow.appendChild(notesTd);

        const actionTd = document.createElement("td");
        actionTd.className = "action";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "action-button edit-button";
        editButton.setAttribute("aria-label", `${tr("common.editExpense", "Edit expense")} ${transaction.trID}`);
        editButton.addEventListener("click", function() { editRow(transaction.trID); });

        const editIcon = document.createElement("i");
        editIcon.className = "edit-icon fa-solid fa-pen-to-square";
        editIcon.setAttribute("aria-hidden", "true");
        editButton.appendChild(editIcon);
        actionTd.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "action-button delete-button";
        deleteButton.setAttribute("aria-label", `${tr("common.deleteExpense", "Delete expense")} ${transaction.trID}`);
        deleteButton.addEventListener("click", function() { deleteTransaction(transaction.trID); });

        const deleteIcon = document.createElement("i");
        deleteIcon.className = "delete-icon fas fa-trash-alt";
        deleteIcon.setAttribute("aria-hidden", "true");
        deleteButton.appendChild(deleteIcon);
        actionTd.appendChild(deleteButton);

        transactionRow.appendChild(actionTd);
        transactionTableBody.appendChild(transactionRow);
  });
  displayExpenses();
  applyI18nNow();
}

function displayExpenses() {
    const resultElement = document.getElementById("total-expenses");

    const totalExpenses = transactions
        .reduce((total, transaction) => total + transaction.trAmount,0);

    resultElement.innerHTML = `<span data-i18n="expenses.totalExpenses">Total Expenses</span>: $${totalExpenses.toFixed(2)}`;
}

function editRow(trID) {
    const trToEdit = transactions.find(transaction => transaction.trID == trID);

    document.getElementById("tr-id").value = trToEdit.trID;
    document.getElementById("tr-date").value = trToEdit.trDate;
    document.getElementById("tr-category").value = trToEdit.trCategory;
    document.getElementById("tr-amount").value = trToEdit.trAmount;
    document.getElementById("tr-notes").value = trToEdit.trNotes;

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.dataset.mode = "update";
    submitBtn.setAttribute("data-i18n", "common.update");
    submitBtn.textContent = tr("common.update", "Update");

    document.getElementById("transaction-form").style.display = "block";
  }

function deleteTransaction(trID) {
    if (!confirm(tr("common.confirmDelete", "Are you sure you want to delete?"))) {
    return;
}
    const indexToDelete = transactions.findIndex(transaction => transaction.trID == trID);

    if (indexToDelete !== -1) {
        transactions.splice(indexToDelete, 1);

        localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));

        renderTransactions(transactions);
       showFeedback(tr("common.deletedSuccessfully", "Deleted successfully!"), "success");
    }
}

  function updateTransaction(trID) {
    const indexToUpdate = transactions.findIndex(transaction => transaction.trID === trID);

    if (indexToUpdate !== -1) {
        const updatedTransaction = {
            trID: trID,
            trDate: document.getElementById("tr-date").value,
            trCategory: document.getElementById("tr-category").value,
            trAmount: parseFloat(document.getElementById("tr-amount").value),
            trNotes: document.getElementById("tr-notes").value,
        };

        transactions[indexToUpdate] = updatedTransaction;

        localStorage.setItem("bizTrackTransactions", JSON.stringify(transactions));

        renderTransactions(transactions);

        document.getElementById("transaction-form").reset();
        
        const submitBtn = document.getElementById("submitBtn");
        submitBtn.dataset.mode = "add";
        submitBtn.setAttribute("data-i18n", "common.add");
        submitBtn.textContent = tr("common.add", "Add");

        closeForm();
        showFeedback(tr("common.updatedSuccessfully", "Updated successfully!"), "success");
    }
}

function sortTable(column, button) {
    const tbody = document.getElementById("tableBody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    const isNumeric = column === "trID" || column === "trAmount";

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
    const rows = document.querySelectorAll(".transaction-row");

    rows.forEach(row => {
        const visible = row.innerText.toLowerCase().includes(searchInput);
        row.style.display = visible ? "table-row" : "none";
    });
}


function exportToCSV() {
    const transactionsToExport = transactions.map(transaction => {
        return {
            trID: transaction.trID,
            trDate: transaction.trDate,
            trCategory: transaction.trCategory,
            trAmount: transaction.trAmount.toFixed(2),
            trNotes: transaction.trNotes,
        };
    });

    const csvContent = generateCSV(transactionsToExport);

    const blob = new Blob([csvContent], { type: 'text/csv' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'biztrack_expense_table.csv';

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
    tr,
    applyI18nNow,
    showFeedback,
    openSidebar,
    closeSidebar,
    openForm,
    closeForm,
    addOrUpdate,
    newTransaction,
    renderTransactions,
    displayExpenses,
    editRow,
    deleteTransaction,
    updateTransaction,
    sortTable,
    updateSortState,
    performSearch,
    exportToCSV,
    generateCSV,
  };
}
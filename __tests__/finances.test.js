/**
 * @jest-environment jsdom
 */

function setupFinanceDOM() {
  document.body.innerHTML = `
    <div id="sidebar"></div>

    <input id="searchInput" />

    <form id="transaction-form">
      <input id="tr-id" />
      <input id="tr-date" />
      <select id="tr-category">
        <option value="Rent">Rent</option>
        <option value="Utilities">Utilities</option>
        <option value="Supplies">Supplies</option>
      </select>
      <input id="tr-amount" />
      <input id="tr-notes" />
      <button id="submitBtn" type="submit">Add</button>
    </form>

    <div id="total-expenses"></div>

    <table>
      <thead>
        <tr>
          <th aria-sort="none">
            <button id="sort-id" type="button">S/N</button>
          </th>
          <th aria-sort="none">
            <button id="sort-category" type="button">Category</button>
          </th>
          <th aria-sort="none">
            <button id="sort-amount" type="button">Amount</button>
          </th>
        </tr>
      </thead>
      <tbody id="tableBody"></tbody>
    </table>
  `;

  if (!Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "innerText")) {
    Object.defineProperty(window.HTMLElement.prototype, "innerText", {
      get() {
        return this.textContent;
      },
      configurable: true,
    });
  }
}

function loadFinanceScript() {
  jest.resetModules();
  return require("../finances.js");
}

describe("finances page script", () => {
  beforeEach(() => {
    setupFinanceDOM();
    localStorage.clear();

    window.i18n = {
      t: jest.fn((key) => {
        const map = {
          "common.addedSuccessfully": "Added successfully!",
          "common.deletedSuccessfully": "Deleted successfully!",
          "common.updatedSuccessfully": "Updated successfully!",
          "common.update": "Update",
          "common.add": "Add",
          "common.confirmDelete": "Are you sure?",
          "common.editExpense": "Edit expense",
          "common.deleteExpense": "Delete expense",

          "expenses.totalExpenses": "Total Expenses",

          "expenseCategory.rent": "Rent",
          "expenseCategory.utilities": "Utilities",
          "expenseCategory.supplies": "Supplies",
          "expenseCategory.orderFulfillment": "Order Fulfillment",
          "expenseCategory.miscellaneous": "Miscellaneous",
        };

        return map[key] !== undefined ? map[key] : key;
      }),
      applyTranslations: jest.fn(),
    };

    jest.spyOn(window, "confirm").mockReturnValue(true);

    window.URL.createObjectURL = jest.fn(() => "blob:mock-url");
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("loads default transactions when localStorage is empty", () => {
    loadFinanceScript();

    window.onload();

    const rows = document.querySelectorAll(".transaction-row");

    expect(rows).toHaveLength(5);
    expect(localStorage.getItem("bizTrackTransactions")).toContain("January Rent");
    expect(document.getElementById("total-expenses").textContent).toContain("$455.00");
  });

  test("loads stored transactions from localStorage", () => {
    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-03-01",
          trCategory: "Utilities",
          trAmount: 50,
          trNotes: "Test bill",
        },
      ])
    );

    loadFinanceScript();

    window.onload();

    expect(document.querySelectorAll(".transaction-row")).toHaveLength(1);
    expect(document.body.textContent).toContain("Test bill");
    expect(document.getElementById("total-expenses").textContent).toContain("$50.00");
  });

  test("opens and closes the sidebar", () => {
    const finance = loadFinanceScript();

    const sidebar = document.getElementById("sidebar");

    finance.openSidebar();
    expect(sidebar.style.display).toBe("block");

    finance.openSidebar();
    expect(sidebar.style.display).toBe("none");

    finance.closeSidebar();
    expect(sidebar.style.display).toBe("none");
  });

  test("opens and closes the transaction form", () => {
    const finance = loadFinanceScript();

    const form = document.getElementById("transaction-form");

    finance.openForm();
    expect(form.style.display).toBe("block");

    finance.openForm();
    expect(form.style.display).toBe("none");

    finance.closeForm();
    expect(form.style.display).toBe("none");
  });

  test("adds a new transaction", () => {
    const finance = loadFinanceScript();

    document.getElementById("tr-date").value = "2024-04-01";
    document.getElementById("tr-category").value = "Rent";
    document.getElementById("tr-amount").value = "200";
    document.getElementById("tr-notes").value = "April Rent";

    finance.newTransaction({ preventDefault: jest.fn() });

    expect(document.querySelectorAll(".transaction-row")).toHaveLength(1);
    expect(document.body.textContent).toContain("April Rent");
    expect(localStorage.getItem("bizTrackTransactions")).toContain("April Rent");
    expect(document.querySelector(".feedback-message").textContent).toBe("Added successfully!");
  });

  test("addOrUpdate calls add mode by default", () => {
    const finance = loadFinanceScript();

    document.getElementById("tr-date").value = "2024-04-02";
    document.getElementById("tr-category").value = "Utilities";
    document.getElementById("tr-amount").value = "80";
    document.getElementById("tr-notes").value = "Internet";

    finance.addOrUpdate({ preventDefault: jest.fn() });

    expect(document.body.textContent).toContain("Internet");
  });

  test("edits an existing row and switches submit button to update mode", () => {
    const finance = loadFinanceScript();

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-05-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "Old note",
        },
      ])
    );

    window.onload();

    finance.editRow(1);

    expect(document.getElementById("tr-id").value).toBe("1");
    expect(document.getElementById("tr-notes").value).toBe("Old note");
    expect(document.getElementById("submitBtn").dataset.mode).toBe("update");
    expect(document.getElementById("transaction-form").style.display).toBe("block");
  });

  test("updates an existing transaction", () => {
    const finance = loadFinanceScript();

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-05-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "Old note",
        },
      ])
    );

    window.onload();

    document.getElementById("tr-date").value = "2024-05-02";
    document.getElementById("tr-category").value = "Utilities";
    document.getElementById("tr-amount").value = "150";
    document.getElementById("tr-notes").value = "Updated note";

    finance.updateTransaction(1);

    expect(document.body.textContent).toContain("Updated note");
    expect(localStorage.getItem("bizTrackTransactions")).toContain("Updated note");
    expect(document.getElementById("submitBtn").dataset.mode).toBe("add");
    expect(document.querySelector(".feedback-message").textContent).toBe("Updated successfully!");
  });

  test("addOrUpdate calls update mode when submit button mode is update", () => {
    const finance = loadFinanceScript();

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-05-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "Old note",
        },
      ])
    );

    window.onload();

    document.getElementById("submitBtn").dataset.mode = "update";
    document.getElementById("tr-id").value = "1";
    document.getElementById("tr-date").value = "2024-05-03";
    document.getElementById("tr-category").value = "Supplies";
    document.getElementById("tr-amount").value = "220";
    document.getElementById("tr-notes").value = "Updated through addOrUpdate";

    finance.addOrUpdate({ preventDefault: jest.fn() });

    expect(document.body.textContent).toContain("Updated through addOrUpdate");
  });

  test("deletes a transaction when user confirms", () => {
    const finance = loadFinanceScript();

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-06-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "Delete me",
        },
      ])
    );

    window.onload();

    finance.deleteTransaction(1);

    expect(document.querySelectorAll(".transaction-row")).toHaveLength(0);
    expect(localStorage.getItem("bizTrackTransactions")).toBe("[]");
    expect(document.querySelector(".feedback-message").textContent).toBe("Deleted successfully!");
  });

  test("does not delete a transaction when user cancels confirm dialog", () => {
    window.confirm.mockReturnValue(false);

    const finance = loadFinanceScript();

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-06-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "Keep me",
        },
      ])
    );

    window.onload();

    finance.deleteTransaction(1);

    expect(document.querySelectorAll(".transaction-row")).toHaveLength(1);
    expect(document.body.textContent).toContain("Keep me");
  });

  test("sorts transactions by numeric amount and updates aria-sort", () => {
    const finance = loadFinanceScript();

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-01-01",
          trCategory: "Rent",
          trAmount: 300,
          trNotes: "High",
        },
        {
          trID: 2,
          trDate: "2024-01-02",
          trCategory: "Utilities",
          trAmount: 50,
          trNotes: "Low",
        },
      ])
    );

    window.onload();

    const sortButton = document.getElementById("sort-amount");

    finance.sortTable("trAmount", sortButton);

    const firstRow = document.querySelector(".transaction-row");

    expect(firstRow.dataset.trid || firstRow.dataset.trID).toBeDefined();
    expect(firstRow.textContent).toContain("Low");
    expect(sortButton.closest("th").getAttribute("aria-sort")).toBe("ascending");
  });

  test("sorts transactions by text category", () => {
    const finance = loadFinanceScript();

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-01-01",
          trCategory: "Utilities",
          trAmount: 100,
          trNotes: "B",
        },
        {
          trID: 2,
          trDate: "2024-01-02",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "A",
        },
      ])
    );

    window.onload();

    finance.sortTable("trCategory", document.getElementById("sort-category"));

    const firstRow = document.querySelector(".transaction-row");

    expect(firstRow.textContent).toContain("Rent");
  });

  test("search hides rows that do not match the search input", () => {
    const finance = loadFinanceScript();

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-01-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "January rent",
        },
        {
          trID: 2,
          trDate: "2024-01-02",
          trCategory: "Utilities",
          trAmount: 50,
          trNotes: "Internet bill",
        },
      ])
    );

    window.onload();

    document.getElementById("searchInput").value = "internet";

    finance.performSearch();

    const rows = Array.from(document.querySelectorAll(".transaction-row"));

    expect(rows[0].style.display).toBe("none");
    expect(rows[1].style.display).toBe("table-row");
  });

  test("pressing Enter in search input triggers search", () => {
    loadFinanceScript();

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-01-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "January rent",
        },
        {
          trID: 2,
          trDate: "2024-01-02",
          trCategory: "Utilities",
          trAmount: 50,
          trNotes: "Internet bill",
        },
      ])
    );

    window.onload();

    document.getElementById("searchInput").value = "internet";

    document.getElementById("searchInput").dispatchEvent(
      new KeyboardEvent("keyup", {
        key: "Enter",
        bubbles: true,
      })
    );

    const rows = Array.from(document.querySelectorAll(".transaction-row"));

    expect(rows[0].style.display).toBe("none");
    expect(rows[1].style.display).toBe("table-row");
  });

  test("generates CSV content", () => {
    const finance = loadFinanceScript();

    const csv = finance.generateCSV([
      {
        trID: 1,
        trDate: "2024-01-01",
        trCategory: "Rent",
        trAmount: "100.00",
        trNotes: "January Rent",
      },
    ]);

    expect(csv).toBe(
      "trID,trDate,trCategory,trAmount,trNotes\n1,2024-01-01,Rent,100.00,January Rent"
    );
  });

  test("exports transactions to CSV", () => {
    const finance = loadFinanceScript();

    const clickMock = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-01-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "January Rent",
        },
      ])
    );

    window.onload();

    finance.exportToCSV();

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });

  test("shows and removes feedback message", () => {
    jest.useFakeTimers();

    const finance = loadFinanceScript();

    finance.showFeedback("Saved", "success");

    expect(document.querySelector(".feedback-message").textContent).toBe("Saved");
    expect(document.querySelector(".feedback-message").className).toContain("feedback-success");

    jest.advanceTimersByTime(3000);
    jest.advanceTimersByTime(300);

    expect(document.querySelector(".feedback-message")).toBeNull();
  });

  test("tr returns fallback when i18n is not available", () => {
    delete window.i18n;

    const finance = loadFinanceScript();

    expect(finance.tr("missing.key", "Fallback text")).toBe("Fallback text");
  });

  test("applyI18nNow calls i18n applyTranslations when available", () => {
    const finance = loadFinanceScript();

    finance.applyI18nNow();

    expect(window.i18n.applyTranslations).toHaveBeenCalled();
  });
});
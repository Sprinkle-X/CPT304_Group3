/**
 * @jest-environment jsdom
 */

function setupDOM() {
  document.body.innerHTML = `
    <div id="sidebar"></div>
    <input type="search" id="searchInput">
    <form id="order-form">
      <input type="text"   id="order-id">
      <input type="date"   id="order-date">
      <select id="item-name">
        <option value="Baseball caps">Baseball caps</option>
        <option value="Water bottles">Water bottles</option>
        <option value="Tote bags">Tote bags</option>
        <option value="Canvas prints">Canvas prints</option>
        <option value="Beanies">Beanies</option>
        <option value="T-shirts">T-shirts</option>
        <option value="Mugs">Mugs</option>
      </select>
      <input type="number" id="item-price">
      <input type="number" id="qty-bought">
      <input type="number" id="shipping">
      <input type="number" id="taxes">
      <input type="number" id="order-total">
      <select id="order-status">
        <option value="Pending">Pending</option>
        <option value="Processing">Processing</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
      </select>
      <button type="submit" id="submitBtn" data-mode="add">Add</button>
    </form>
    <table>
      <thead>
        <tr>
          <th aria-sort="none"><button class="sort-button"></button></th>
          <th aria-sort="none"><button class="sort-button"></button></th>
          <th aria-sort="none"><button class="sort-button"></button></th>
          <th aria-sort="none"><button class="sort-button"></button></th>
          <th aria-sort="none"><button class="sort-button"></button></th>
          <th aria-sort="none"><button class="sort-button"></button></th>
          <th aria-sort="none"><button class="sort-button"></button></th>
          <th aria-sort="none"><button class="sort-button"></button></th>
          <th aria-sort="none"><button class="sort-button"></button></th>
          <th></th>
        </tr>
      </thead>
      <tbody id="tableBody"></tbody>
      <tfoot><tr><td colspan="10"><div id="total-revenue"></div></td><tr></tfoot>
    </table>
  `;
}

function load() {
  jest.resetModules();
  const mod = require("../orders.js");
  window.onload();
  return mod;
}

function fillForm(fields = {}) {
  const defaults = {
    "order-id": "2001",
    "order-date": "2024-07-01",
    "item-name": "T-shirts",
    "item-price": "20",
    "qty-bought": "3",
    "shipping": "4",
    "taxes": "6",
    "order-total": "70",
    "order-status": "Pending",
  };
  Object.entries({ ...defaults, ...fields }).forEach(([id, val]) => {
    document.getElementById(id).value = val;
  });
}

beforeEach(() => {
  setupDOM();
  localStorage.clear();
  // Fix jsdom innerText
  Object.defineProperty(HTMLElement.prototype, "innerText", {
    get() { return this.textContent; },
    configurable: true,
  });
  // Mock i18n
  window.i18n = {
    t: jest.fn((key) => {
      const map = {
        "common.addedSuccessfully": "Added successfully!",
        "common.deletedSuccessfully": "Deleted successfully!",
        "common.updatedSuccessfully": "Updated successfully!",
        "common.update": "Update",
        "common.add": "Add",
        "common.confirmDelete": "Are you sure?",
        "orders.duplicateId": "Duplicate ID",
        "common.editOrder": "Edit order",
        "common.deleteOrder": "Delete order",
      };
      return map[key] !== undefined ? map[key] : key;
    }),
    applyTranslations: jest.fn(),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

// ─── Init ────────────────────────────────────────────────────────────────────

describe("init", () => {
  test("loads default orders when localStorage is empty", () => {
    load();
    expect(document.querySelectorAll(".order-row")).toHaveLength(5);
  });

  test("loads from localStorage when data is present", () => {
    localStorage.setItem(
      "bizTrackOrders",
      JSON.stringify([
        { orderID: "9001", orderDate: "2024-06-01", itemName: "Mugs",
          itemPrice: 10, qtyBought: 1, shipping: 1, taxes: 1,
          orderTotal: 12, orderStatus: "Pending" },
      ])
    );
    load();
    expect(document.querySelectorAll(".order-row")).toHaveLength(1);
    expect(document.body.textContent).toContain("Mugs");
  });

  test("saves default orders to localStorage on first load", () => {
    load();
    const stored = JSON.parse(localStorage.getItem("bizTrackOrders"));
    expect(stored).toHaveLength(5);
    expect(stored[0].orderID).toBe("1001");
  });
});

// ─── addOrUpdate ─────────────────────────────────────────────────────────────

describe("addOrUpdate", () => {
  test("delegates to newOrder when mode is add", () => {
    const mod = load();
    fillForm();
    document.getElementById("submitBtn").dataset.mode = "add";
    mod.addOrUpdate({ preventDefault: jest.fn() });
    expect(document.querySelectorAll(".order-row")).toHaveLength(6);
  });

  test("delegates to updateOrder when mode is update", () => {
    const mod = load();
    fillForm({ "order-id": "1001", "item-name": "Mugs",
               "item-price": "10", "qty-bought": "1",
               "shipping": "1", "taxes": "1" });
    const btn = document.getElementById("submitBtn");
    btn.dataset.mode = "update";
    mod.addOrUpdate({ preventDefault: jest.fn() });
    expect(document.querySelector(".feedback-message").textContent)
      .toBe("Updated successfully!");
  });
});

// ─── newOrder ─────────────────────────────────────────────────────────────────

describe("newOrder", () => {
  test("adds order to table and localStorage", () => {
    const mod = load();
    fillForm();
    mod.newOrder({ preventDefault: jest.fn() });
    expect(document.querySelectorAll(".order-row")).toHaveLength(6);
    const stored = JSON.parse(localStorage.getItem("bizTrackOrders"));
    expect(stored).toHaveLength(6);
  });

  test("blocks duplicate ID with alert", () => {
    const mod = load();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    fillForm({ "order-id": "1001" });
    mod.newOrder({ preventDefault: jest.fn() });
    expect(window.alert).toHaveBeenCalled();
    expect(document.querySelectorAll(".order-row")).toHaveLength(5);
  });

  test("shows success feedback and closes form", () => {
    const mod = load();
    document.getElementById("order-form").style.display = "block";
    fillForm();
    mod.newOrder({ preventDefault: jest.fn() });
    expect(document.querySelector(".feedback-message").textContent)
      .toBe("Added successfully!");
    expect(document.getElementById("order-form").style.display).toBe("none");
  });

  test("calculates orderTotal from price * qty + shipping + taxes", () => {
    const mod = load();
    fillForm({ "item-price": "10", "qty-bought": "2",
               "shipping": "3", "taxes": "2" });
    mod.newOrder({ preventDefault: jest.fn() });
    const stored = JSON.parse(localStorage.getItem("bizTrackOrders"));
    const added = stored.find(o => o.orderID === "2001");
    const expectedTotal = 10 * 2 + 3 + 2; // 25
    expect(added.orderTotal).toBe(expectedTotal);
  });
});

// ─── deleteOrder ──────────────────────────────────────────────────────────────

describe("deleteOrder", () => {
  test("removes order when confirmed", () => {
    const mod = load();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    mod.deleteOrder("1001");
    expect(document.querySelectorAll(".order-row")).toHaveLength(4);
  });

  test("does nothing when user cancels", () => {
    const mod = load();
    jest.spyOn(window, "confirm").mockReturnValue(false);
    mod.deleteOrder("1001");
    expect(document.querySelectorAll(".order-row")).toHaveLength(5);
  });

  test("shows deleted feedback", () => {
    const mod = load();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    mod.deleteOrder("1001");
    expect(document.querySelector(".feedback-message").textContent)
      .toBe("Deleted successfully!");
  });

  test("does nothing for non-existent order ID", () => {
    const mod = load();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    mod.deleteOrder("9999");
    expect(document.querySelectorAll(".order-row")).toHaveLength(5);
  });
});

// ─── updateOrder ──────────────────────────────────────────────────────────────

describe("updateOrder", () => {
  test("updates order and shows feedback", () => {
    const mod = load();
    fillForm({ "order-id": "1001", "item-name": "Mugs",
               "item-price": "10", "qty-bought": "1",
               "shipping": "1", "taxes": "1" });
    mod.updateOrder("1001");
    expect(document.querySelector(".feedback-message").textContent)
      .toBe("Updated successfully!");
  });

  test("resets button mode to add after update", () => {
    const mod = load();
    fillForm({ "order-id": "1001", "item-name": "Mugs",
               "item-price": "10", "qty-bought": "1",
               "shipping": "1", "taxes": "1" });
    mod.updateOrder("1001");
    expect(document.getElementById("submitBtn").dataset.mode).toBe("add");
  });

  test("blocks update to a duplicate ID", () => {
    const mod = load();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    fillForm({ "order-id": "1002" });
    mod.updateOrder("1001");
    expect(window.alert).toHaveBeenCalled();
  });

  test("does nothing when order ID not found", () => {
    const mod = load();
    fillForm({ "order-id": "9999" });
    expect(() => mod.updateOrder("9999")).not.toThrow();
    expect(document.querySelectorAll(".order-row")).toHaveLength(5);
  });

  test("closes form after update", () => {
    const mod = load();
    document.getElementById("order-form").style.display = "block";
    fillForm({ "order-id": "1001", "item-name": "Mugs",
               "item-price": "10", "qty-bought": "1",
               "shipping": "1", "taxes": "1" });
    mod.updateOrder("1001");
    expect(document.getElementById("order-form").style.display).toBe("none");
  });
});

// ─── editRow ──────────────────────────────────────────────────────────────────

describe("editRow", () => {
  test("populates form fields with order data", () => {
    const mod = load();
    mod.editRow("1001");
    expect(document.getElementById("order-id").value).toBe("1001");
    expect(document.getElementById("order-date").value).toBe("2024-01-05");
    expect(document.getElementById("item-name").value).toBe("Baseball caps");
    expect(document.getElementById("item-price").value).toBe("25");
    expect(document.getElementById("qty-bought").value).toBe("2");
    expect(document.getElementById("shipping").value).toBe("2.5");
    expect(document.getElementById("taxes").value).toBe("9");
    expect(document.getElementById("order-status").value).toBe("Pending");
  });

  test("sets submit button to update mode", () => {
    const mod = load();
    mod.editRow("1001");
    const btn = document.getElementById("submitBtn");
    expect(btn.dataset.mode).toBe("update");
    expect(btn.textContent).toBe("Update");
  });

  test("opens the order form", () => {
    const mod = load();
    document.getElementById("order-form").style.display = "none";
    mod.editRow("1003");
    expect(document.getElementById("order-form").style.display).toBe("block");
  });
});

// ─── isDuplicateID ────────────────────────────────────────────────────────────

describe("isDuplicateID", () => {
  test("returns true for an existing ID", () => {
    const mod = load();
    expect(mod.isDuplicateID("1001", null)).toBe(true);
  });

  test("returns false when ID matches the excluded (current) ID", () => {
    const mod = load();
    expect(mod.isDuplicateID("1001", "1001")).toBe(false);
  });

  test("returns false for a non-existent ID", () => {
    const mod = load();
    expect(mod.isDuplicateID("9999", null)).toBe(false);
  });
});

// ─── renderOrders ─────────────────────────────────────────────────────────────

describe("renderOrders", () => {
  test("renders correct number of rows", () => {
    const mod = load();
    mod.renderOrders([
      { orderID: "A1", orderDate: "2024-01-01", itemName: "Mugs",
        itemPrice: 10, qtyBought: 1, shipping: 1, taxes: 1,
        orderTotal: 12, orderStatus: "Pending" },
      { orderID: "A2", orderDate: "2024-01-02", itemName: "T-shirts",
        itemPrice: 20, qtyBought: 2, shipping: 2, taxes: 2,
        orderTotal: 46, orderStatus: "Shipped" },
    ]);
    expect(document.querySelectorAll(".order-row")).toHaveLength(2);
  });

  test("non-numeric price/shipping/taxes/total display as empty string", () => {
    const mod = load();
    mod.renderOrders([{ orderID: "X01", orderDate: "2024-01-01",
      itemName: "Test", itemPrice: "bad", qtyBought: 1,
      shipping: "bad", taxes: "bad", orderTotal: "bad",
      orderStatus: "Pending" }]);
    const cells = document.querySelectorAll("#tableBody td");
    expect(cells[3].textContent).toBe("");
    expect(cells[5].textContent).toBe("");
    expect(cells[6].textContent).toBe("");
  });

  test("renders status badges with correct CSS classes", () => {
    const mod = load();
    mod.renderOrders([
      { orderID: "S1", orderDate: "2024-01-01", itemName: "Item",
        itemPrice: 10, qtyBought: 1, shipping: 0, taxes: 0,
        orderTotal: 10, orderStatus: "Pending" },
    ]);
    const statusDiv = document.querySelector(".status");
    expect(statusDiv.classList.contains("pending")).toBe(true);
  });
});

// ─── displayRevenue ───────────────────────────────────────────────────────────

describe("displayRevenue", () => {
  test("shows total revenue of all current orders", () => {
    const mod = load();
    mod.displayRevenue();
    expect(document.getElementById("total-revenue").textContent)
      .toContain("$320.90");
  });

  test("updates revenue after adding an order", () => {
    const mod = load();
    fillForm({ "item-price": "10", "qty-bought": "1",
               "shipping": "0", "taxes": "0" });
    mod.newOrder({ preventDefault: jest.fn() });
    expect(document.getElementById("total-revenue").textContent)
      .toContain("$330.90");
  });
});

// ─── sortTable / updateSortState ──────────────────────────────────────────────

describe("sortTable and updateSortState", () => {
  test("sorts numeric column ascending", () => {
    const mod = load();
    const btn = document.querySelector("th button");
    mod.sortTable("orderTotal", btn);
    const rows = document.querySelectorAll(".order-row");
    const totals = Array.from(rows).map(r => parseFloat(r.dataset.orderTotal));
    expect(totals).toEqual([...totals].sort((a, b) => a - b));
  });

  test("sorts string column (orderID) ascending", () => {
    const mod = load();
    const btn = document.querySelectorAll("th button")[0];
    mod.sortTable("orderID", btn);
    const rows = document.querySelectorAll(".order-row");
    const ids = Array.from(rows).map(r => r.dataset.orderID);
    expect(ids).toEqual([...ids].sort());
  });

  test("sorts string column (itemName) ascending", () => {
    const mod = load();
    const btn = document.querySelectorAll("th button")[2];
    mod.sortTable("itemName", btn);
    const rows = document.querySelectorAll(".order-row");
    const names = Array.from(rows).map(r => r.dataset.itemName);
    expect(names).toEqual([...names].sort());
  });

  test("updateSortState sets aria-sort to ascending on the button's th", () => {
    const mod = load();
    const btn = document.querySelector("th button");
    mod.sortTable("orderTotal", btn);
    expect(btn.closest("th").getAttribute("aria-sort")).toBe("ascending");
  });

  test("updateSortState with null button does not throw", () => {
    const mod = load();
    expect(() => mod.updateSortState(null)).not.toThrow();
    document.querySelectorAll("th[aria-sort]").forEach(th =>
      expect(th.getAttribute("aria-sort")).toBe("none"));
  });
});

// ─── showFeedback (including timeout callbacks) ──────────────────────────────

describe("showFeedback", () => {
  test("removes existing feedback before showing new one", () => {
    const mod = load();
    jest.useFakeTimers();
    
    // Show first feedback
    mod.showFeedback("First message", "success");
    const firstFeedback = document.querySelector(".feedback-message");
    expect(firstFeedback).not.toBeNull();
    expect(firstFeedback.textContent).toBe("First message");
    
    // Show second feedback - should remove the first one
    mod.showFeedback("Second message", "success");
    const secondFeedback = document.querySelector(".feedback-message");
    expect(secondFeedback.textContent).toBe("Second message");
    // The first element was removed, so there should still be only one
    expect(document.querySelectorAll(".feedback-message")).toHaveLength(1);
    
    jest.useRealTimers();
  });

  test("calls setTimeout to fade out and remove feedback", () => {
    const mod = load();
    jest.useFakeTimers();
    
    mod.showFeedback("Test message", "success");
    const feedback = document.querySelector(".feedback-message");
    expect(feedback).not.toBeNull();
    
    // Advance timers to trigger fade out
    jest.advanceTimersByTime(3000);
    
    // After first timeout, animation starts; wait for fade out callback
    jest.advanceTimersByTime(300);
    
    // Feedback should be removed
    expect(document.querySelector(".feedback-message")).toBeNull();
    
    jest.useRealTimers();
  });

  test("error type shows red background", () => {
    const mod = load();
    mod.showFeedback("Error message", "error");
    const feedback = document.querySelector(".feedback-message");
    expect(feedback).not.toBeNull();
    expect(feedback.style.backgroundColor).toBe("rgb(220, 53, 69)");
  });
});

// ─── exportToCSV and generateCSV ─────────────────────────────────────────────

describe("exportToCSV", () => {
  let mockCreateObjectURL;
  let mockRevokeObjectURL;
  
  beforeEach(() => {
    mockCreateObjectURL = jest.fn(() => "blob:mock-url");
    mockRevokeObjectURL = jest.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    // Mock createElement and click
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  test("generates CSV and triggers download", () => {
    const mod = load();
    mod.exportToCSV();
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });
});

describe("generateCSV", () => {
  test("converts array of objects to CSV string", () => {
    const mod = load();
    const testData = [
      { orderID: "1001", orderDate: "2024-01-01", itemName: "Mugs" },
      { orderID: "1002", orderDate: "2024-01-02", itemName: "T-shirts" },
    ];
    
    const csv = mod.generateCSV(testData);
    
    expect(csv).toContain("orderID,orderDate,itemName");
    expect(csv).toContain("1001,2024-01-01,Mugs");
    expect(csv).toContain("1002,2024-01-02,T-shirts");
  });

  test("handles numeric values correctly", () => {
    const mod = load();
    const testData = [
      { orderID: "2001", itemPrice: 25.5, qtyBought: 3, orderTotal: 76.5 },
    ];
    
    const csv = mod.generateCSV(testData);
    
    expect(csv).toContain("orderID,itemPrice,qtyBought,orderTotal");
    expect(csv).toContain("2001,25.5,3,76.5");
  });
});

// ─── performSearch ────────────────────────────────────────────────────────────

describe("performSearch", () => {
  let mod;

  beforeEach(() => {
    mod = load();
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";
    [
      ["1001", "2024-01-05", "Baseball caps", "$25.00", "2", "$2.50", "$9.00", "$61.50", "Pending"],
      ["1002", "2024-03-05", "Water bottles", "$17.00", "3", "$3.50", "$6.00", "$60.50", "Processing"],
      ["1003", "2024-02-05", "Tote bags", "$20.00", "4", "$2.50", "$2.00", "$84.50", "Shipped"],
    ].forEach(rowData => {
      const tr = document.createElement("tr");
      tr.className = "order-row";
      rowData.forEach(text => {
        const td = document.createElement("td");
        td.textContent = text;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  });

  test("hides non-matching rows", () => {
    document.getElementById("searchInput").value = "Baseball caps";
    mod.performSearch();
    const visible = Array.from(document.querySelectorAll(".order-row"))
      .filter(r => r.style.display !== "none");
    expect(visible.length).toBe(1);
  });

  test("case-insensitive search", () => {
    document.getElementById("searchInput").value = "tote BAGS";
    mod.performSearch();
    const visible = Array.from(document.querySelectorAll(".order-row"))
      .filter(r => r.style.display !== "none");
    expect(visible.length).toBe(1);
  });

  test("shows all rows when search is empty", () => {
    document.getElementById("searchInput").value = "";
    mod.performSearch();
    const visible = Array.from(document.querySelectorAll(".order-row"))
      .filter(r => r.style.display !== "none");
    expect(visible.length).toBe(3);
  });

  test("search input keyup with Enter triggers performSearch", () => {
    document.getElementById("searchInput").value = "Water";
    const event = new KeyboardEvent("keyup", { key: "Enter" });
    document.getElementById("searchInput").dispatchEvent(event);
    const visible = Array.from(document.querySelectorAll(".order-row"))
      .filter(r => r.style.display !== "none");
    expect(visible.length).toBe(1);
  });
});

// ─── Sidebar and Form Toggles ─────────────────────────────────────────────────

describe("sidebar and form toggles", () => {
  test("openSidebar toggles sidebar visibility", () => {
    const mod = load();
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = "none";
    mod.openSidebar();
    expect(sidebar.style.display).toBe("block");
    mod.openSidebar();
    expect(sidebar.style.display).toBe("none");
  });

  test("closeSidebar hides sidebar", () => {
    const mod = load();
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = "block";
    mod.closeSidebar();
    expect(sidebar.style.display).toBe("none");
  });

  test("openForm toggles form visibility", () => {
    const mod = load();
    const form = document.getElementById("order-form");
    form.style.display = "none";
    mod.openForm();
    expect(form.style.display).toBe("block");
    mod.openForm();
    expect(form.style.display).toBe("none");
  });

  test("closeForm hides form", () => {
    const mod = load();
    const form = document.getElementById("order-form");
    form.style.display = "block";
    mod.closeForm();
    expect(form.style.display).toBe("none");
  });
});
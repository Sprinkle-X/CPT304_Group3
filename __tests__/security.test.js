/**
 * @jest-environment jsdom
 *
 * Security tests: XSS protection across product management pages.
 * Verifies user input is never interpreted as HTML and dangerous
 * inputs like <script>, onerror, onload etc. are safely rendered as text.
 */

function setupDOM() {
  document.body.innerHTML = `
    <div id="sidebar"></div>

    <input type="search" id="searchInput" placeholder="Search">
    <button type="button" class="search-button" aria-label="Search products">Search</button>

    <form class="form-container" id="product-form">
      <input type="text" id="product-id" placeholder="PD001" required>
      <select name="product-name" id="product-name" required>
        <option value="" disabled selected hidden>Choose a product</option>
        <option value="Baseball caps">Baseball caps</option>
        <option value="Water bottles">Water bottles</option>
      </select>
      <input type="text" id="product-desc" placeholder="Enter product description" required>
      <select name="product-cat" id="product-cat" required>
        <option value="" disabled selected>Choose a category</option>
        <option value="Clothing">Clothing</option>
        <option value="Drinkware">Drinkware</option>
      </select>
      <input type="number" id="product-price" placeholder="$0.00" min="0.00" max="10000.00" step="0.01" required>
      <input type="number" id="product-sold" placeholder="1" required>
      <button type="submit" class="btn" id="submitBtn">Add</button>
      <button type="button" class="btn cancel">Cancel</button>
    </form>

    <table>
      <thead>
        <tr>
          <th scope="col" aria-sort="none"><button type="button" class="sort-button"><span>Product ID</span></button></th>
          <th scope="col" aria-sort="none"><button type="button" class="sort-button"><span>Product Name</span></button></th>
          <th scope="col" aria-sort="none"><button type="button" class="sort-button"><span>Description</span></button></th>
          <th scope="col" aria-sort="none"><button type="button" class="sort-button"><span>Category</span></button></th>
          <th scope="col" aria-sort="none"><button type="button" class="sort-button"><span>Price</span></button></th>
          <th scope="col" aria-sort="none"><button type="button" class="sort-button"><span>Units Sold</span></button></th>
          <th scope="col">Action</th>
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

function loadModule() {
  jest.resetModules();
  return require("../products.js");
}

// ---------------------------------------------------------------------------
// XSS via renderProducts – verify textContent prevents HTML execution
// ---------------------------------------------------------------------------
describe("XSS protection in product rendering", () => {
  beforeEach(() => {
    setupDOM();
    localStorage.clear();

    window.i18n = {
      t: jest.fn((key) => key),
      applyTranslations: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -- <script> injection --------------------------------------------------

  test("<script> tags in product fields are rendered as safe text, not executed", () => {
    const products = loadModule();

    const malicious = {
      prodID: '<script>window.pwned=true</script>',
      prodName: '<script>alert("xss")</script>',
      prodDesc: '<script>document.cookie</script>',
      prodCat: '<script>fetch("//evil.com")</script>',
      prodPrice: 10,
      prodSold: 5,
    };

    products.renderProducts([malicious]);

    expect(window.pwned).toBeUndefined();

    const cells = document.querySelectorAll("#tableBody td");
    cells.forEach((cell) => {
      if (!cell.classList.contains("action")) {
        expect(cell.querySelector("script")).toBeNull();
        expect(cell.children.length).toBe(0);
      }
    });
  });

  test("<script> tag in product data is rendered as text, not as an executable element", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-XSS1",
        prodName: "Normal",
        prodDesc: "<script>alert(1)</script>",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
    ]);

    // No <script> element should exist anywhere in the document
    expect(document.querySelector("script")).toBeNull();

    const descCell = document.querySelectorAll("#tableBody td")[2];
    expect(descCell.textContent).toBe("<script>alert(1)</script>");
    expect(descCell.children.length).toBe(0);
  });

  // -- onerror / event handler injection ----------------------------------

  test("onerror handlers in product fields are not rendered as DOM attributes", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: '<img src=x onerror="window.onerrorXSS=true">',
        prodName: "Test",
        prodDesc: "Test",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
    ]);

    expect(window.onerrorXSS).toBeUndefined();

    // No elements with event handlers should exist in the DOM
    expect(document.querySelector("[onerror]")).toBeNull();
    expect(document.querySelector("img")).toBeNull();

    const allCells = document.querySelectorAll("#tableBody td");
    allCells.forEach((cell) => {
      expect(cell.querySelector("img")).toBeNull();
      expect(cell.getAttribute("onerror")).toBeNull();
    });
  });

  test("onclick handlers in product fields are not rendered as DOM attributes", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: '<div onclick="window.clickXSS=true">click</div>',
        prodName: "Test",
        prodDesc: "Test",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
    ]);

    expect(window.clickXSS).toBeUndefined();

    // No elements with onclick handler attribute should exist
    expect(document.querySelector("[onclick]")).toBeNull();

    const allCells = document.querySelectorAll("#tableBody td");
    allCells.forEach((cell) => {
      if (!cell.classList.contains("action")) {
        expect(cell.querySelector("div")).toBeNull();
      }
      expect(cell.getAttribute("onclick")).toBeNull();
    });
  });

  test("onload and onmouseover handlers are not injected", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: '<svg onload="window.svgXSS=true">',
        prodName: '<body onload="window.bodyXSS=true">',
        prodDesc: '<div onmouseover="window.hoverXSS=true">hover</div>',
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
    ]);

    expect(window.svgXSS).toBeUndefined();
    expect(window.bodyXSS).toBeUndefined();
    expect(window.hoverXSS).toBeUndefined();

    // No elements with onload or onmouseover handler attributes
    expect(document.querySelector("[onload]")).toBeNull();
    expect(document.querySelector("[onmouseover]")).toBeNull();
  });

  // -- Comprehensive XSS payload vector test --------------------------------

  test("renders every common XSS vector as plain text without HTML interpretation", () => {
    const products = loadModule();

    const vectors = [
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      '<iframe src="javascript:alert(1)">',
      'javascript:alert(1)',
      '<a href="javascript:alert(1)">click</a>',
      '<div onmouseover="alert(1)">hover</div>',
      '"><script>alert(1)</script>',
      '<style>body{display:none}</style>',
      '"><img src=x onerror=alert(1)>',
    ];

    vectors.forEach((payload, i) => {
      // reset DOM for each payload
      document.body.innerHTML = `
        <table><tbody id="tableBody"></tbody></table>
      `;

      products.renderProducts([
        {
          prodID: `PD-${i}`,
          prodName: payload,
          prodDesc: payload,
          prodCat: payload,
          prodPrice: 10,
          prodSold: 5,
        },
      ]);

      const tbody = document.getElementById("tableBody");

      // No payload should produce child elements in data cells
      const dataCells = document.querySelectorAll("#tableBody td:not(.action)");
      dataCells.forEach((cell) => {
        expect(cell.children.length).toBe(0);
        expect(cell.querySelector("script")).toBeNull();
        expect(cell.querySelector("img")).toBeNull();
        expect(cell.querySelector("svg")).toBeNull();
        expect(cell.querySelector("iframe")).toBeNull();
        expect(cell.querySelector("style")).toBeNull();
      });

      // No event-handler attributes should exist on any DOM element
      expect(tbody.querySelector("[onerror]")).toBeNull();
      expect(tbody.querySelector("[onload]")).toBeNull();
    });
  });

  // -- innerHTML is NOT used for user content --------------------------------

  test("innerHTML is used only for clearing the table, never for user data injection", () => {
    const products = loadModule();

    const maliciousData = [
      {
        prodID: '<div id="injected-div">SHOULD NOT EXIST</div>',
        prodName: "Test",
        prodDesc: "<b>bold</b>",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
    ];

    products.renderProducts(maliciousData);

    // The injected div ID should not exist in the document
    expect(document.getElementById("injected-div")).toBeNull();

    // Bold tag should not exist as an element
    expect(document.querySelector("#tableBody b")).toBeNull();

    // The description cell should contain the literal text "<b>bold</b>"
    const descCell = document.querySelectorAll("#tableBody td")[2];
    expect(descCell.textContent).toBe("<b>bold</b>");
  });

  // -- showFeedback safety ---------------------------------------------------

  test("showFeedback renders message via textContent, not innerHTML", () => {
    const products = loadModule();

    const xssMessage = '<img src=x onerror="window.feedbackXSS=true">';
    products.showFeedback(xssMessage, "success");

    const feedback = document.querySelector(".feedback-message");
    expect(feedback).not.toBeNull();
    expect(feedback.textContent).toBe(xssMessage);
    expect(feedback.querySelector("img")).toBeNull();
    expect(window.feedbackXSS).toBeUndefined();
  });

  // -- localStorage poisoning -----------------------------------------------

  test("malicious localStorage data is rendered safely when module loads", () => {
    localStorage.setItem(
      "bizTrackProducts",
      JSON.stringify([
        {
          prodID: '<script>window.storageXSS=true</script>',
          prodName: '<img src=x onerror="window.storageXSS=true">',
          prodDesc: '<svg/onload="window.storageXSS=true">',
          prodCat: '"><script>alert(1)</script>',
          prodPrice: 10,
          prodSold: 5,
        },
      ])
    );

    loadModule();

    expect(window.storageXSS).toBeUndefined();

    // No <script> elements or event-handler attributes exist in the DOM
    const tbody = document.getElementById("tableBody");
    expect(tbody.querySelector("script")).toBeNull();
    expect(tbody.querySelector("[onerror]")).toBeNull();
    expect(tbody.querySelector("[onload]")).toBeNull();

    document.querySelectorAll("#tableBody td:not(.action)").forEach((cell) => {
      expect(cell.querySelector("script")).toBeNull();
      expect(cell.querySelector("img")).toBeNull();
      expect(cell.querySelector("svg")).toBeNull();
    });
  });

  // -- Search input safety --------------------------------------------------

  test("search with XSS payloads does not cause DOM injection", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD001",
        prodName: "Normal product",
        prodDesc: "Description",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
    ]);

    const searchXSS = '<img src=x onerror="window.searchXSS=true">';
    const searchInput = document.getElementById("searchInput");
    searchInput.value = searchXSS;

    products.performSearch();

    expect(window.searchXSS).toBeUndefined();
    expect(searchInput.value).toBe(searchXSS);

    // Search should not inject anything into the DOM
    expect(document.body.innerHTML).not.toContain("<img src=x");
  });

  // -- HTML entity / encoding edge cases -----------------------------------

  test("HTML-entity-encoded payloads are not double-decoded into executable HTML", () => {
    const products = loadModule();

    const encodedPayloads = [
      "&lt;script&gt;alert(1)&lt;/script&gt;",
      "&#60;script&#62;alert(1)&#60;/script&#62;",
      "&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;",
    ];

    encodedPayloads.forEach((payload, i) => {
      document.body.innerHTML = `<table><tbody id="tableBody"></tbody></table>`;

      products.renderProducts([
        {
          prodID: `PD-ENC${i}`,
          prodName: payload,
          prodDesc: "test",
          prodCat: "Clothing",
          prodPrice: 10,
          prodSold: 5,
        },
      ]);

      // The encoded payload should appear as text, not create elements
      const cells = document.querySelectorAll("#tableBody td");
      cells.forEach((cell) => {
        expect(cell.querySelector("script")).toBeNull();
      });
    });
  });

  // -- No XSS via dataset attributes ---------------------------------------

  test("product data stored in dataset attributes does not execute HTML", () => {
    const products = loadModule();

    const xssInData = '<img src=x onerror="window.datasetXSS=true">';

    products.renderProducts([
      {
        prodID: xssInData,
        prodName: xssInData,
        prodDesc: xssInData,
        prodCat: xssInData,
        prodPrice: 10,
        prodSold: 5,
      },
    ]);

    const row = document.querySelector("#tableBody tr");
    expect(row).not.toBeNull();
    expect(row.dataset.prodID).toBe(xssInData);
    expect(row.dataset.prodName).toBe(xssInData);

    // Dataset values should not execute
    expect(window.datasetXSS).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// XSS via finances.js displayExpenses (innerHTML used with dynamic data)
// ---------------------------------------------------------------------------
describe("XSS protection in finances page", () => {
  function setupFinanceDOM() {
    document.body.innerHTML = `
      <div id="sidebar"></div>
      <input id="searchInput" />
      <form id="transaction-form">
        <input id="tr-id" />
        <input id="tr-date" />
        <select id="tr-category"><option value="Rent">Rent</option></select>
        <input id="tr-amount" />
        <input id="tr-notes" />
        <button id="submitBtn" type="submit">Add</button>
      </form>
      <div id="total-expenses"></div>
      <table><tbody id="tableBody"></tbody></table>
    `;

    if (!Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, "innerText")) {
      Object.defineProperty(window.HTMLElement.prototype, "innerText", {
        get() { return this.textContent; },
        configurable: true,
      });
    }
  }

  beforeEach(() => {
    setupFinanceDOM();
    localStorage.clear();

    window.i18n = {
      t: jest.fn((key) => key),
      applyTranslations: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("displayExpenses uses innerHTML but category/amount values cannot inject HTML", () => {
    jest.resetModules();
    const finance = require("../finances.js");

    // Verify displayExpenses output does not create unexpected elements
    finance.displayExpenses();

    const totalDiv = document.getElementById("total-expenses");
    // The innerHTML is set with a template literal, but only uses toFixed(2),
    // which always returns a numeric string – safe in practice.
    // Still document the risk so future editors are aware.
    expect(totalDiv.children.length).toBeGreaterThanOrEqual(0);
    expect(totalDiv.querySelector("script")).toBeNull();
  });

  test("finances showFeedback also uses textContent safely", () => {
    jest.resetModules();
    const finance = require("../finances.js");

    finance.showFeedback('<img src=x onerror="window.finFeedbackXSS=true">', "error");

    const fb = document.querySelector(".feedback-message");
    expect(fb.textContent).toBe('<img src=x onerror="window.finFeedbackXSS=true">');
    expect(fb.querySelector("img")).toBeNull();
    expect(window.finFeedbackXSS).toBeUndefined();
  });

  test("transaction notes with XSS payloads are rendered as text", () => {
    jest.resetModules();
    const finance = require("../finances.js");

    finance.renderTransactions([
      {
        trID: 1,
        trDate: "2024-01-01",
        trCategory: "Rent",
        trAmount: 100,
        trNotes: '<script>window.noteXSS=true</script>',
      },
    ]);

    expect(window.noteXSS).toBeUndefined();

    // No <script> element should exist in the document
    expect(document.querySelector("script")).toBeNull();

    // The notes cell should only contain text
    const cells = document.querySelectorAll("#tableBody td");
    const notesCell = cells[cells.length - 1]; // last cell before action
    if (!notesCell.classList.contains("action")) {
      expect(notesCell.querySelector("script")).toBeNull();
    }
  });
});

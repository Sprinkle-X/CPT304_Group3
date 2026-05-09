/**
 * @jest-environment jsdom
 *
 * Product page tests: add, display, update, delete, search, sort,
 * CSV export, and form interactions.
 */

function setupProductsDOM() {
  document.body.innerHTML = `
    <div id="sidebar"></div>

    <input type="search" id="searchInput" placeholder="Search">
    <button type="button" class="search-button" aria-label="Search products">Search</button>

    <form class="form-container" id="product-form">
      <input type="text" id="product-id" placeholder="PD001" required>
      <select name="product-name" id="product-name" required>
        <option value="" disabled selected hidden data-i18n="products.chooseProduct">
          Choose a product
        </option>

        <optgroup label="Hats" data-i18n-label="category.hats">
          <option value="Baseball caps" data-category="Hats" data-i18n="product.baseballCaps">Baseball caps</option>
          <option value="Snapbacks" data-category="Hats" data-i18n="product.snapbacks">Snapbacks</option>
          <option value="Beanies" data-category="Hats" data-i18n="product.beanies">Beanies</option>
          <option value="Bucket hats" data-category="Hats" data-i18n="product.bucketHats">Bucket hats</option>
        </optgroup>

        <optgroup label="Drinkware" data-i18n-label="category.drinkware">
          <option value="Mugs" data-category="Drinkware" data-i18n="product.mugs">Mugs</option>
          <option value="Water bottles" data-category="Drinkware" data-i18n="product.waterBottles">Water bottles</option>
          <option value="Tumblers" data-category="Drinkware" data-i18n="product.tumblers">Tumblers</option>
        </optgroup>

        <optgroup label="Clothing" data-i18n-label="category.clothing">
          <option value="T-shirts" data-category="Clothing" data-i18n="product.tshirts">T-shirts</option>
          <option value="Sweatshirts" data-category="Clothing" data-i18n="product.sweatshirts">Sweatshirts</option>
          <option value="Hoodies" data-category="Clothing" data-i18n="product.hoodies">Hoodies</option>
        </optgroup>

        <optgroup label="Accessories" data-i18n-label="category.accessories">
          <option value="Pillow cases" data-category="Accessories" data-i18n="product.pillowCases">Pillow cases</option>
          <option value="Tote bags" data-category="Accessories" data-i18n="product.toteBags">Tote bags</option>
          <option value="Stickers" data-category="Accessories" data-i18n="product.stickers">Stickers</option>
        </optgroup>

        <optgroup label="Home decor" data-i18n-label="category.homeDecor">
          <option value="Posters" data-category="Home decor" data-i18n="product.posters">Posters</option>
          <option value="Framed posters" data-category="Home decor" data-i18n="product.framedPosters">Framed posters</option>
          <option value="Canvas prints" data-category="Home decor" data-i18n="product.canvasPrints">Canvas prints</option>
        </optgroup>
      </select>
      <input type="text" id="product-desc" placeholder="Enter product description" required>
      <select name="product-cat" id="product-cat" required>
        <option value="" disabled selected data-i18n="products.chooseCategory">
          Choose a category
        </option>
        <option value="Clothing" data-i18n="category.clothing">Clothing</option>
        <option value="Drinkware" data-i18n="category.drinkware">Drinkware</option>
        <option value="Accessories" data-i18n="category.accessories">Accessories</option>
        <option value="Hats" data-i18n="category.hats">Hats</option>
        <option value="Home decor" data-i18n="category.homeDecor">Home decor</option>
      </select>
      <input type="number" id="product-price" placeholder="$0.00" min="0.00" max="10000.00" step="0.01" required>
      <input type="number" id="product-sold" placeholder="1" required>
      <button type="submit" class="btn" id="submitBtn">Add</button>
      <button type="button" class="btn cancel">Cancel</button>
    </form>

    <table id="product-table">
      <thead>
        <tr>
          <th scope="col" aria-sort="none">
            <button type="button" class="sort-button"><span>Product ID</span></button>
          </th>
          <th scope="col" aria-sort="none">
            <button type="button" class="sort-button"><span>Product Name</span></button>
          </th>
          <th scope="col" aria-sort="none">
            <button type="button" class="sort-button"><span>Description</span></button>
          </th>
          <th scope="col" aria-sort="none">
            <button type="button" class="sort-button"><span>Category</span></button>
          </th>
          <th scope="col" aria-sort="none">
            <button type="button" class="sort-button"><span>Price</span></button>
          </th>
          <th scope="col" aria-sort="none">
            <button type="button" class="sort-button"><span>Units Sold</span></button>
          </th>
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

function setupI18nMock(lang = "en") {
  const translations = {
    en: {
      "category.hats": "Hats",
      "category.drinkware": "Drinkware",
      "category.clothing": "Clothing",
      "category.accessories": "Accessories",
      "category.homeDecor": "Home decor",

      "product.baseballCaps": "Baseball caps",
      "product.waterBottles": "Water bottles",
      "product.sweatshirts": "Sweatshirts",
    },
    zh: {
      "category.hats": "帽子",
      "category.drinkware": "水杯饮具",
      "category.clothing": "服装",
      "category.accessories": "配件",
      "category.homeDecor": "家居装饰",

      "product.baseballCaps": "棒球帽",
      "product.waterBottles": "水瓶",
      "product.sweatshirts": "卫衣",
    },
  };

  window.i18n = {
    t: jest.fn((key) => translations[lang][key] || key),
    applyTranslations: jest.fn(),
  };
}

describe("products page – init and data loading", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();

    delete window.i18n;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("loads default products when localStorage is empty", () => {
    loadModule();

    const rows = document.querySelectorAll(".product-row");
    expect(rows).toHaveLength(5);

    expect(localStorage.getItem("bizTrackProducts")).toContain("Baseball caps");
    expect(document.body.textContent).toContain("Baseball caps");
    expect(document.body.textContent).toContain("Water bottles");
    expect(document.body.textContent).toContain("Sweatshirts");
  });

  test("loads stored products from localStorage when present", () => {
    localStorage.setItem(
      "bizTrackProducts",
      JSON.stringify([
        {
          prodID: "PD-CUST",
          prodName: "Custom item",
          prodDesc: "A custom product",
          prodCat: "Clothing",
          prodPrice: 99.99,
          prodSold: 3,
        },
      ])
    );

    loadModule();

    const rows = document.querySelectorAll(".product-row");
    expect(rows).toHaveLength(1);
    expect(document.body.textContent).toContain("Custom item");
    expect(document.body.textContent).toContain("$99.99");
  });
});

describe("products page – CRUD operations", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();

    delete window.i18n;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -- Add product ---------------------------------------------------------

  test("adds a new product, renders it in the table, and persists to localStorage", () => {
    const products = loadModule();

    document.getElementById("product-id").value = "PD-NEW";
    document.getElementById("product-name").value = "T-shirts";
    document.getElementById("product-desc").value = "Cotton tee";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "19.99";
    document.getElementById("product-sold").value = "15";

    products.newProduct({ preventDefault: jest.fn() });

    const rows = document.querySelectorAll(".product-row");
    expect(rows).toHaveLength(6); // 5 default + 1 new

    expect(document.body.textContent).toContain("Cotton tee");
    expect(document.body.textContent).toContain("$19.99");

    const stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
    expect(stored).toHaveLength(6);
    expect(stored[5].prodID).toBe("PD-NEW");
    expect(stored[5].prodPrice).toBe(19.99);
    expect(stored[5].prodSold).toBe(15);
  });

  test("prevents adding a product with a duplicate ID", () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});

    const products = loadModule();

    document.getElementById("product-id").value = "PD001"; // already exists
    document.getElementById("product-name").value = "T-shirts";
    document.getElementById("product-desc").value = "Dup";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "10";
    document.getElementById("product-sold").value = "1";

    products.newProduct({ preventDefault: jest.fn() });

    expect(window.alert).toHaveBeenCalledWith(
      "Product ID already exists. Please use a unique ID."
    );
    expect(document.querySelectorAll(".product-row")).toHaveLength(5);
  });

  test("shows success feedback after adding a product", () => {
    const products = loadModule();

    document.getElementById("product-id").value = "PD-FB";
    document.getElementById("product-name").value = "T-shirts";
    document.getElementById("product-desc").value = "Feedback test";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "5";
    document.getElementById("product-sold").value = "2";

    products.newProduct({ preventDefault: jest.fn() });

    const fb = document.querySelector(".feedback-message");
    expect(fb).not.toBeNull();
    expect(fb.textContent).toBe("Added successfully!");
    expect(fb.className).toContain("feedback-success");
  });

  // -- Delete product ------------------------------------------------------

  test("deletes a product and updates the table", () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    const products = loadModule();

    expect(document.querySelectorAll(".product-row")).toHaveLength(5);

    products.deleteProduct("PD001");

    expect(document.querySelectorAll(".product-row")).toHaveLength(4);
    expect(document.body.textContent).not.toContain("Peace embroidered cap");

    const stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
    expect(stored).toHaveLength(4);
    expect(stored.find((p) => p.prodID === "PD001")).toBeUndefined();
  });

  test("does not delete when user cancels confirmation", () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);

    const products = loadModule();

    products.deleteProduct("PD001");

    expect(document.querySelectorAll(".product-row")).toHaveLength(5);
    expect(document.body.textContent).toContain("Baseball caps");
  });

  test("shows feedback after successful delete", () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    const products = loadModule();

    products.deleteProduct("PD001");

    const fb = document.querySelector(".feedback-message");
    expect(fb).not.toBeNull();
    expect(fb.textContent).toBe("Deleted successfully!");
  });

  // -- Update product ------------------------------------------------------

  test("edits a product row and populates the form", () => {
    const products = loadModule();

    products.editRow("PD001");

    expect(document.getElementById("product-id").value).toBe("PD001");
    expect(document.getElementById("product-name").value).toBe("Baseball caps");
    expect(document.getElementById("product-desc").value).toBe("Peace embroidered cap");
    expect(document.getElementById("product-cat").value).toBe("Hats");
    expect(document.getElementById("product-price").value).toBe("25");
    expect(document.getElementById("product-sold").value).toBe("20");
    expect(document.getElementById("submitBtn").textContent).toBe("Update");
    expect(document.getElementById("product-form").style.display).toBe("block");
  });

  test("updates an existing product", () => {
    const products = loadModule();

    document.getElementById("product-id").value = "PD001";
    document.getElementById("product-name").value = "T-shirts";
    document.getElementById("product-desc").value = "Updated description";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "30";
    document.getElementById("product-sold").value = "25";

    products.updateProduct("PD001");

    expect(document.body.textContent).toContain("Updated description");
    expect(document.body.textContent).not.toContain("Peace embroidered cap");

    const stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
    const updated = stored.find((p) => p.prodID === "PD001");
    expect(updated.prodDesc).toBe("Updated description");
    expect(updated.prodPrice).toBe(30);
    expect(updated.prodSold).toBe(25);
  });

  test("shows feedback after successful update", () => {
    const products = loadModule();

    document.getElementById("product-id").value = "PD001";
    document.getElementById("product-name").value = "T-shirts";
    document.getElementById("product-desc").value = "Desc";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "10";
    document.getElementById("product-sold").value = "1";

    products.updateProduct("PD001");

    const fb = document.querySelector(".feedback-message");
    expect(fb).not.toBeNull();
    expect(fb.textContent).toBe("Updated successfully!");
  });

  test("prevents updating to a duplicate product ID", () => {
    jest.spyOn(window, "alert").mockImplementation(() => {});

    const products = loadModule();

    // PD001 and PD002 already exist; try to change PD001's ID to PD002
    document.getElementById("product-id").value = "PD002";
    document.getElementById("product-name").value = "T-shirts";
    document.getElementById("product-desc").value = "Conflict";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "10";
    document.getElementById("product-sold").value = "1";

    products.updateProduct("PD001");

    expect(window.alert).toHaveBeenCalledWith(
      "Product ID already exists. Please use a unique ID."
    );
    // The product should NOT have been updated
    expect(document.body.textContent).not.toContain("Conflict");
  });

  test("does not update a non-existent product", () => {
    const products = loadModule();

    const initial = document.querySelectorAll(".product-row").length;

    document.getElementById("product-id").value = "PD-GHOST";
    document.getElementById("product-name").value = "Ghost";
    document.getElementById("product-desc").value = "Nope";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "1";
    document.getElementById("product-sold").value = "1";

    products.updateProduct("PD-GHOST");

    expect(document.querySelectorAll(".product-row")).toHaveLength(initial);
  });
});

describe("products page – search and sort", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();

    delete window.i18n;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -- Search --------------------------------------------------------------

  test("filters visible rows by search term", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-A",
        prodName: "Baseball caps",
        prodDesc: "Cotton cap",
        prodCat: "Hats",
        prodPrice: 25,
        prodSold: 20,
      },
      {
        prodID: "PD-B",
        prodName: "Water bottles",
        prodDesc: "Steel bottle",
        prodCat: "Drinkware",
        prodPrice: 48.5,
        prodSold: 10,
      },
    ]);

    document.getElementById("searchInput").value = "bottle";

    products.performSearch();

    const rows = Array.from(document.querySelectorAll(".product-row"));
    expect(rows[0].style.display).toBe("none");
    expect(rows[1].style.display).toBe("table-row");
  });

  test("shows all rows when search input is empty", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD1",
        prodName: "Item A",
        prodDesc: "First",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
      {
        prodID: "PD2",
        prodName: "Item B",
        prodDesc: "Second",
        prodCat: "Drinkware",
        prodPrice: 20,
        prodSold: 5,
      },
    ]);

    document.getElementById("searchInput").value = "";

    products.performSearch();

    document.querySelectorAll(".product-row").forEach((row) => {
      expect(row.style.display).toBe("table-row");
    });
  });

  test("pressing Enter in search input triggers performSearch", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-K1",
        prodName: "Keep",
        prodDesc: "Visible",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
      {
        prodID: "PD-K2",
        prodName: "Hide",
        prodDesc: "Hidden",
        prodCat: "Drinkware",
        prodPrice: 20,
        prodSold: 5,
      },
    ]);

    document.getElementById("searchInput").value = "keep";

    document.getElementById("searchInput").dispatchEvent(
      new KeyboardEvent("keyup", { key: "Enter", bubbles: true })
    );

    const rows = Array.from(document.querySelectorAll(".product-row"));
    expect(rows[0].style.display).toBe("table-row");
    expect(rows[1].style.display).toBe("none");
  });

  test("search is case-insensitive", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-T",
        prodName: "BASEBALL CAPS",
        prodDesc: "Test",
        prodCat: "Hats",
        prodPrice: 25,
        prodSold: 20,
      },
    ]);

    document.getElementById("searchInput").value = "baseball";

    products.performSearch();

    const row = document.querySelector(".product-row");
    expect(row.style.display).toBe("table-row");
  });

  // -- Sort ----------------------------------------------------------------

  test("sorts rows by product ID ascending", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-Z",
        prodName: "Z item",
        prodDesc: "Last",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
      {
        prodID: "PD-A",
        prodName: "A item",
        prodDesc: "First",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
    ]);

    const sortBtn = document.querySelector(".sort-button");
    products.sortTable("prodID", sortBtn);

    const rows = document.querySelectorAll(".product-row");
    expect(rows[0].dataset.prodID).toBe("PD-A");
    expect(rows[1].dataset.prodID).toBe("PD-Z");
    expect(sortBtn.closest("th").getAttribute("aria-sort")).toBe("ascending");
  });

  test("sorts rows by price numerically", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-H",
        prodName: "High",
        prodDesc: "Pricey",
        prodCat: "Clothing",
        prodPrice: 100,
        prodSold: 5,
      },
      {
        prodID: "PD-L",
        prodName: "Low",
        prodDesc: "Cheap",
        prodCat: "Clothing",
        prodPrice: 1,
        prodSold: 5,
      },
    ]);

    const sortBtn = document.querySelectorAll(".sort-button")[4]; // Price column
    products.sortTable("prodPrice", sortBtn);

    const rows = document.querySelectorAll(".product-row");
    expect(rows[0].dataset.prodName).toBe("Low");
    expect(rows[1].dataset.prodName).toBe("High");
  });

  test("sorts rows by units sold numerically", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-M",
        prodName: "Many",
        prodDesc: "Popular",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 100,
      },
      {
        prodID: "PD-F",
        prodName: "Few",
        prodDesc: "Unpopular",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 1,
      },
    ]);

    const sortBtn = document.querySelectorAll(".sort-button")[5]; // Units Sold column
    products.sortTable("prodSold", sortBtn);

    const rows = document.querySelectorAll(".product-row");
    expect(rows[0].dataset.prodName).toBe("Few");
    expect(rows[1].dataset.prodName).toBe("Many");
  });
});

describe("products page – CSV export", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();

    delete window.i18n;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("generates CSV content with headers and rows", () => {
    const products = loadModule();

    const csv = products.generateCSV([
      {
        prodID: "PD001",
        prodName: "Cap",
        prodDesc: "Nice cap",
        prodCategory: "Hats",
        prodPrice: "25.00",
        QtySold: 20,
      },
    ]);

    expect(csv).toBe("prodID,prodName,prodDesc,prodCategory,prodPrice,QtySold\nPD001,Cap,Nice cap,Hats,25.00,20");
  });

  test("generateCSV returns an empty string when data is empty", () => {
    const products = loadModule();

    expect(products.generateCSV([])).toBe("");
  });

  test("generateCSV escapes commas, quotes, and new lines", () => {
    const products = loadModule();

    const csv = products.generateCSV([
      {
        prodID: "PD001",
        prodName: 'Cap, "Limited"',
        prodDesc: "Line one\nLine two",
        prodCategory: "Hats",
        prodPrice: "25.00",
        QtySold: 20,
      },
    ]);

    expect(csv).toBe(
      'prodID,prodName,prodDesc,prodCategory,prodPrice,QtySold\nPD001,"Cap, ""Limited""","Line one\nLine two",Hats,25.00,20'
    );
  });

  test("exportToCSV creates a download link and triggers click", () => {
    const products = loadModule();

    window.URL.createObjectURL = jest.fn(() => "blob:mock");
    const clickMock = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    products.exportToCSV();

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
  });
});

describe("products page – form open/close", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();

    delete window.i18n;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("openForm toggles form display", () => {
    const products = loadModule();

    const form = document.getElementById("product-form");

    products.openForm();
    expect(form.style.display).toBe("block");

    products.openForm();
    expect(form.style.display).toBe("none");
  });

  test("closeForm hides the form", () => {
    const products = loadModule();

    const form = document.getElementById("product-form");
    form.style.display = "block";

    products.closeForm();
    expect(form.style.display).toBe("none");
  });
});

describe("products page – sidebar", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();

    delete window.i18n;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("openSidebar toggles sidebar visibility", () => {
    const products = loadModule();

    const sidebar = document.getElementById("sidebar");

    products.openSidebar();
    expect(sidebar.style.display).toBe("block");

    products.openSidebar();
    expect(sidebar.style.display).toBe("none");
  });

  test("closeSidebar hides the sidebar", () => {
    const products = loadModule();

    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = "block";

    products.closeSidebar();
    expect(sidebar.style.display).toBe("none");
  });
});

describe("products page – feedback messages", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();

    delete window.i18n;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  test("showFeedback creates and auto-removes success message after timeout", () => {
    jest.useFakeTimers();

    const products = loadModule();

    products.showFeedback("Operation complete", "success");

    let fb = document.querySelector(".feedback-message");
    expect(fb).not.toBeNull();
    expect(fb.textContent).toBe("Operation complete");
    expect(fb.className).toContain("feedback-success");

    jest.advanceTimersByTime(3000);
    jest.advanceTimersByTime(300);

    fb = document.querySelector(".feedback-message");
    expect(fb).toBeNull();
  });

  test("showFeedback renders error type with different styling", () => {
    jest.useFakeTimers();

    const products = loadModule();

    products.showFeedback("Something went wrong", "error");

    const fb = document.querySelector(".feedback-message");
    expect(fb.className).toContain("feedback-error");
  });

  test("showFeedback replaces existing feedback message", () => {
    const products = loadModule();

    products.showFeedback("First message", "success");
    products.showFeedback("Second message", "error");

    const messages = document.querySelectorAll(".feedback-message");
    expect(messages).toHaveLength(1);
    expect(messages[0].textContent).toBe("Second message");
    expect(messages[0].className).toContain("feedback-error");
  });
});

describe("products page – addOrUpdate dispatch", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();

    delete window.i18n;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("addOrUpdate calls newProduct when submit button mode is add", () => {
    const products = loadModule();

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.dataset.mode = "add";

    document.getElementById("product-id").value = "PD-DISP";
    document.getElementById("product-name").value = "T-shirts";
    document.getElementById("product-desc").value = "Dispatch add";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "10";
    document.getElementById("product-sold").value = "2";

    products.addOrUpdate({ preventDefault: jest.fn() });

    expect(document.body.textContent).toContain("Dispatch add");

    const stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
    expect(stored.find((p) => p.prodID === "PD-DISP")).toBeDefined();
  });

  test("addOrUpdate calls updateProduct when submit button mode is update", () => {
    const products = loadModule();

    document.getElementById("product-id").value = "PD-UPD";
    document.getElementById("product-name").value = "T-shirts";
    document.getElementById("product-desc").value = "Before update";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "10";
    document.getElementById("product-sold").value = "1";
    products.newProduct({ preventDefault: jest.fn() });

    const submitBtn = document.getElementById("submitBtn");
    submitBtn.dataset.mode = "update";

    document.getElementById("product-id").value = "PD-UPD";
    document.getElementById("product-name").value = "T-shirts";
    document.getElementById("product-desc").value = "After update";
    document.getElementById("product-cat").value = "Clothing";
    document.getElementById("product-price").value = "10";
    document.getElementById("product-sold").value = "1";

    products.addOrUpdate({ preventDefault: jest.fn() });

    const stored = JSON.parse(localStorage.getItem("bizTrackProducts"));
    const updated = stored.find((p) => p.prodID === "PD-UPD");

    expect(updated.prodDesc).toBe("After update");
  });
});

describe("products page – table rendering details", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();

    delete window.i18n;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("each product row gets dataset attributes for sorting", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-DS",
        prodName: "Dataset test",
        prodDesc: "Checking dataset",
        prodCat: "Clothing",
        prodPrice: 15.5,
        prodSold: 42,
      },
    ]);

    const row = document.querySelector(".product-row");
    expect(row.dataset.prodID).toBe("PD-DS");
    expect(row.dataset.prodName).toBe("Dataset test");
    expect(row.dataset.prodDesc).toBe("Checking dataset");
    expect(row.dataset.prodCat).toBe("Clothing");
    expect(row.dataset.prodPrice).toBe("15.5");
    expect(row.dataset.prodSold).toBe("42");
  });

  test("price is formatted with dollar sign and two decimals", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-PR",
        prodName: "Price test",
        prodDesc: "Formatting",
        prodCat: "Clothing",
        prodPrice: 9.5,
        prodSold: 3,
      },
    ]);

    const priceCell = document.querySelectorAll("#tableBody td")[4];
    expect(priceCell.textContent).toBe("$9.50");
  });

  test("action column contains edit and delete buttons with aria-labels", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-ACT",
        prodName: "Action test",
        prodDesc: "Buttons",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
    ]);

    const editBtn = document.querySelector(".edit-button");
    expect(editBtn).not.toBeNull();
    expect(editBtn.getAttribute("aria-label")).toBe("Edit product PD-ACT");

    const deleteBtn = document.querySelector(".delete-button");
    expect(deleteBtn).not.toBeNull();
    expect(deleteBtn.getAttribute("aria-label")).toBe("Delete product PD-ACT");
  });

  test("rendering clears previous table content before adding new rows", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-F",
        prodName: "First render",
        prodDesc: "A",
        prodCat: "Clothing",
        prodPrice: 10,
        prodSold: 5,
      },
    ]);

    products.renderProducts([
      {
        prodID: "PD-S",
        prodName: "Second render",
        prodDesc: "B",
        prodCat: "Drinkware",
        prodPrice: 20,
        prodSold: 3,
      },
    ]);

    const rows = document.querySelectorAll(".product-row");
    expect(rows).toHaveLength(1);
    expect(rows[0].dataset.prodID).toBe("PD-S");
  });
});

describe("products page – category auto fill and i18n labels", () => {
  beforeEach(() => {
    setupProductsDOM();
    localStorage.clear();
    setupI18nMock("en");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("fills category automatically when a product name is selected", () => {
    const products = loadModule();

    const productNameSelect = document.getElementById("product-name");
    const productCatSelect = document.getElementById("product-cat");

    productNameSelect.value = "Water bottles";
    productNameSelect.dispatchEvent(new Event("change", { bubbles: true }));

    expect(productCatSelect.value).toBe("Drinkware");

    productNameSelect.value = "Baseball caps";
    productNameSelect.dispatchEvent(new Event("change", { bubbles: true }));

    expect(productCatSelect.value).toBe("Hats");
  });

  test("category auto fill still uses English value when page language is Chinese", () => {
    setupI18nMock("zh");

    const products = loadModule();

    const productNameSelect = document.getElementById("product-name");
    const productCatSelect = document.getElementById("product-cat");

    productNameSelect.value = "Water bottles";
    productNameSelect.dispatchEvent(new Event("change", { bubbles: true }));

    expect(productCatSelect.value).toBe("Drinkware");
  });

  test("renders product name and category labels in English", () => {
    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-LABEL",
        prodName: "Water bottles",
        prodDesc: "Bottle",
        prodCat: "Drinkware",
        prodPrice: 12,
        prodSold: 4,
      },
    ]);

    expect(document.body.textContent).toContain("Water bottles");
    expect(document.body.textContent).toContain("Drinkware");
  });

  test("renders product name and category labels in Chinese", () => {
    setupI18nMock("zh");

    const products = loadModule();

    products.renderProducts([
      {
        prodID: "PD-LABEL",
        prodName: "Water bottles",
        prodDesc: "Bottle",
        prodCat: "Drinkware",
        prodPrice: 12,
        prodSold: 4,
      },
    ]);

    expect(document.body.textContent).toContain("水瓶");
    expect(document.body.textContent).toContain("水杯饮具");
  });

  test("returns original value when product or category has no translation mapping", () => {
    const products = loadModule();

    expect(products.getProductNameLabel("Custom item")).toBe("Custom item");
    expect(products.getCategoryLabel("Custom category")).toBe("Custom category");
  });
});
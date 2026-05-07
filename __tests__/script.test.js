/**
 * @jest-environment jsdom
 */

function setupDashboardDOM() {
  document.body.innerHTML = `
    <div id="sidebar"></div>

    <div id="rev-amount"></div>
    <div id="exp-amount"></div>
    <div id="balance"></div>
    <div id="num-orders"></div>

    <div id="bar-chart"></div>
    <div id="donut-chart"></div>
  `;
}

function loadScript() {
  jest.resetModules();
  return require("../script.js");
}

describe("dashboard script", () => {
  beforeEach(() => {
    setupDashboardDOM();
    localStorage.clear();

    window.i18n = {
      t: jest.fn((key) => {
        const values = {
          "dashboard.revenue": "Revenue",
          "dashboard.expenses": "Expenses",
          "dashboard.balance": "Balance",
          "dashboard.orders": "Orders",
        };

        return values[key] || key;
      }),
      applyTranslations: jest.fn(),
    };

    global.ApexCharts = jest.fn().mockImplementation((element, options) => ({
      element,
      options,
      render: jest.fn(),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("opens and closes the sidebar", () => {
    const dashboard = loadScript();

    const sidebar = document.getElementById("sidebar");

    dashboard.openSidebar();
    expect(sidebar.style.display).toBe("block");

    dashboard.openSidebar();
    expect(sidebar.style.display).toBe("none");

    dashboard.closeSidebar();
    expect(sidebar.style.display).toBe("none");
  });

  test("calculates total expenses", () => {
    const dashboard = loadScript();

    const result = dashboard.calculateExpTotal([
      { trAmount: 100 },
      { trAmount: 35 },
      { trAmount: 20 },
    ]);

    expect(result).toBe(155);
  });

  test("calculates total revenue", () => {
    const dashboard = loadScript();

    const result = dashboard.calculateRevTotal([
      { orderTotal: 61.5 },
      { orderTotal: 60.5 },
      { orderTotal: 84.5 },
    ]);

    expect(result).toBe(206.5);
  });

  test("creates amount span with i18n title and value", () => {
    const dashboard = loadScript();

    const fragment = dashboard.createAmountSpan(
      "dashboard.revenue",
      "Revenue",
      "$100.00"
    );

    const container = document.createElement("div");
    container.appendChild(fragment);

    expect(container.querySelector(".title").textContent).toBe("Revenue");
    expect(container.querySelector(".title").getAttribute("data-i18n")).toBe(
      "dashboard.revenue"
    );
    expect(container.querySelector(".amount-value").textContent).toBe("$100.00");
  });

  test("creates amount span with fallback title when i18n is unavailable", () => {
    delete window.i18n;

    const dashboard = loadScript();

    const fragment = dashboard.createAmountSpan(
      "dashboard.revenue",
      "Revenue",
      "$100.00"
    );

    const container = document.createElement("div");
    container.appendChild(fragment);

    expect(container.querySelector(".title").textContent).toBe("Revenue");
    expect(container.querySelector(".amount-value").textContent).toBe("$100.00");
  });

  test("renders dashboard totals from default data on page load", () => {
    loadScript();

    window.onload();

    expect(document.getElementById("rev-amount").textContent).toContain("$320.90");
    expect(document.getElementById("exp-amount").textContent).toContain("$455.00");
    expect(document.getElementById("balance").textContent).toContain("$-134.10");
    expect(document.getElementById("num-orders").textContent).toContain("5");

    expect(window.i18n.applyTranslations).toHaveBeenCalled();
  });

  test("renders dashboard totals from localStorage data", () => {
    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-01-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "Test rent",
        },
        {
          trID: 2,
          trDate: "2024-01-02",
          trCategory: "Utilities",
          trAmount: 50,
          trNotes: "Test utility",
        },
      ])
    );

    localStorage.setItem(
      "bizTrackOrders",
      JSON.stringify([
        {
          orderID: "1001",
          orderTotal: 300,
        },
        {
          orderID: "1002",
          orderTotal: 200,
        },
      ])
    );

    loadScript();

    window.onload();

    expect(document.getElementById("rev-amount").textContent).toContain("$500.00");
    expect(document.getElementById("exp-amount").textContent).toContain("$150.00");
    expect(document.getElementById("balance").textContent).toContain("$350.00");
    expect(document.getElementById("num-orders").textContent).toContain("2");
  });

  test("calculates category sales", () => {
    const dashboard = loadScript();

    const result = dashboard.calculateCategorySales([
      {
        prodCat: "Hats",
        prodPrice: 25,
        prodSold: 2,
      },
      {
        prodCat: "Hats",
        prodPrice: 10,
        prodSold: 3,
      },
      {
        prodCat: "Drinkware",
        prodPrice: 20,
        prodSold: 1,
      },
    ]);

    expect(result).toEqual({
      Hats: 80,
      Drinkware: 20,
    });
  });

  test("initializes bar and donut charts with localStorage data", () => {
    const dashboard = loadScript();

    localStorage.setItem(
      "bizTrackProducts",
      JSON.stringify([
        {
          prodID: "PD001",
          prodName: "Product A",
          prodCat: "Hats",
          prodPrice: 10,
          prodSold: 5,
        },
        {
          prodID: "PD002",
          prodName: "Product B",
          prodCat: "Drinkware",
          prodPrice: 20,
          prodSold: 5,
        },
      ])
    );

    localStorage.setItem(
      "bizTrackTransactions",
      JSON.stringify([
        {
          trID: 1,
          trDate: "2024-01-01",
          trCategory: "Rent",
          trAmount: 100,
          trNotes: "Rent",
        },
        {
          trID: 2,
          trDate: "2024-01-02",
          trCategory: "Utilities",
          trAmount: 50,
          trNotes: "Utilities",
        },
      ])
    );

    dashboard.initializeChart();

    expect(global.ApexCharts).toHaveBeenCalledTimes(2);

    const barChartOptions = global.ApexCharts.mock.calls[0][1];
    expect(barChartOptions.chart.type).toBe("bar");
    expect(barChartOptions.series[0].name).toBe("Total Sales");
    expect(barChartOptions.xaxis.categories).toEqual(["Drinkware", "Hats"]);
    expect(barChartOptions.series[0].data).toEqual([100, 50]);

    const donutChartOptions = global.ApexCharts.mock.calls[1][1];
    expect(donutChartOptions.chart.type).toBe("donut");
    expect(donutChartOptions.labels).toEqual(["Rent", "Utilities"]);
    expect(donutChartOptions.series).toEqual([100, 50]);
  });

  test("chart tooltip formatters return currency strings", () => {
    const dashboard = loadScript();

    dashboard.initializeChart();

    const barChartOptions = global.ApexCharts.mock.calls[0][1];
    const donutChartOptions = global.ApexCharts.mock.calls[1][1];

    expect(barChartOptions.tooltip.y.formatter(12.345)).toBe("$12.35");
    expect(donutChartOptions.tooltip.y.formatter(67.891)).toBe("$67.89");
  });
});
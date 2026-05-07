/**
 * @jest-environment jsdom
 */

function loadI18n() {
  jest.resetModules();
  delete window.i18n;
  require("../i18n.js");
  return window.i18n;
}

describe("i18n translation system", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.lang = "";
    localStorage.clear();
  });

  test("uses English as the default language", () => {
    const i18n = loadI18n();

    expect(i18n.getCurrentLanguage()).toBe("en");
    expect(i18n.t("nav.dashboard")).toBe("Dashboard");
    expect(i18n.t("dashboard.revenue")).toBe("Revenue");
  });

  test("uses saved language from localStorage", () => {
    localStorage.setItem("language", "zh");

    const i18n = loadI18n();

    expect(i18n.getCurrentLanguage()).toBe("zh");
    expect(i18n.t("nav.dashboard")).toBe("仪表盘");
    expect(i18n.t("dashboard.revenue")).toBe("收入");
  });

  test("falls back to English when saved language does not exist", () => {
    localStorage.setItem("language", "fr");

    const i18n = loadI18n();

    expect(i18n.t("nav.dashboard")).toBe("Dashboard");
  });

  test("returns the key itself when translation key is missing", () => {
    const i18n = loadI18n();

    expect(i18n.t("missing.translation.key")).toBe("missing.translation.key");
  });

  test("applies text translations to elements with data-i18n", () => {
    document.body.innerHTML = `
      <h1 data-i18n="nav.dashboard">Dashboard</h1>
      <span data-i18n="dashboard.summary">Summary</span>
    `;

    localStorage.setItem("language", "zh");

    const i18n = loadI18n();
    i18n.applyTranslations();

    expect(document.documentElement.lang).toBe("zh");
    expect(document.querySelector("h1").textContent).toBe("仪表盘");
    expect(document.querySelector("span").textContent).toBe("概览");
  });

  test("applies placeholder translations", () => {
    document.body.innerHTML = `
      <input
        id="product-desc"
        data-i18n-placeholder="products.productDescPlaceholder"
        placeholder="Enter product description"
      />
    `;

    localStorage.setItem("language", "zh");

    const i18n = loadI18n();
    i18n.applyTranslations();

    expect(document.getElementById("product-desc").getAttribute("placeholder"))
      .toBe("请输入产品描述");
  });

  test("applies aria-label translations", () => {
    document.body.innerHTML = `
      <button
        id="sidebar-button"
        data-i18n-aria-label="common.openSidebar"
        aria-label="Open sidebar"
      ></button>
    `;

    localStorage.setItem("language", "zh");

    const i18n = loadI18n();
    i18n.applyTranslations();

    expect(document.getElementById("sidebar-button").getAttribute("aria-label"))
      .toBe("打开侧边栏");
  });

  test("applies title translations", () => {
    document.body.innerHTML = `
      <i
        id="download-icon"
        data-i18n-title="common.downloadCSV"
        title="Download CSV"
      ></i>
    `;

    localStorage.setItem("language", "zh");

    const i18n = loadI18n();
    i18n.applyTranslations();

    expect(document.getElementById("download-icon").getAttribute("title"))
      .toBe("下载 CSV");
  });

  test("changeLanguage saves language and updates page text", () => {
    document.body.innerHTML = `
      <h2 data-i18n="nav.orders">Orders</h2>
    `;

    const i18n = loadI18n();

    i18n.changeLanguage("zh");

    expect(localStorage.getItem("language")).toBe("zh");
    expect(document.documentElement.lang).toBe("zh");
    expect(document.querySelector("h2").textContent).toBe("订单");
  });

  test("DOMContentLoaded applies translations and connects language buttons", () => {
    document.body.innerHTML = `
      <button type="button" data-lang="en">EN</button>
      <button type="button" data-lang="zh">中文</button>
      <h1 data-i18n="nav.dashboard">Dashboard</h1>
    `;

    loadI18n();

    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.querySelector("h1").textContent).toBe("Dashboard");

    document.querySelector('[data-lang="zh"]').click();

    expect(localStorage.getItem("language")).toBe("zh");
    expect(document.querySelector("h1").textContent).toBe("仪表盘");

    document.querySelector('[data-lang="en"]').click();

    expect(localStorage.getItem("language")).toBe("en");
    expect(document.querySelector("h1").textContent).toBe("Dashboard");
  });

  test("exposes i18n functions on window", () => {
    const i18n = loadI18n();

    expect(typeof i18n.t).toBe("function");
    expect(typeof i18n.changeLanguage).toBe("function");
    expect(typeof i18n.applyTranslations).toBe("function");
    expect(typeof i18n.getCurrentLanguage).toBe("function");
  });
});
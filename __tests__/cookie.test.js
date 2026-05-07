/**
 * @jest-environment jsdom
 */

function setupCookieBannerDOM() {
  document.body.innerHTML = `
    <div id="cookie-banner" hidden>
      <button id="necessary-cookies" type="button">Necessary Only</button>
      <button id="reject-cookies" type="button">Reject</button>
      <button id="accept-cookies" type="button">Accept All</button>
    </div>
  `;
}

function clearCookie(name) {
  document.cookie = `${name}=; max-age=0; path=/`;
}

function loadCookieConsentScript() {
  jest.resetModules();
  return require("../cookie-consent.js");
}

describe("cookie consent", () => {
  beforeEach(() => {
    setupCookieBannerDOM();
    localStorage.clear();
    clearCookie("cookieConsent");

    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("sets and gets a cookie", () => {
    const cookieConsent = loadCookieConsentScript();

    cookieConsent.setCookie("cookieConsent", "accept", 180);

    expect(cookieConsent.getCookie("cookieConsent")).toBe("accept");
  });

  test("returns null when cookie does not exist", () => {
    const cookieConsent = loadCookieConsentScript();

    expect(cookieConsent.getCookie("missingCookie")).toBeNull();
  });

  test("saves cookie choice to localStorage and cookie", () => {
    const cookieConsent = loadCookieConsentScript();

    cookieConsent.saveCookieChoice("necessary");

    expect(localStorage.getItem("cookieConsent")).toBe("necessary");
    expect(cookieConsent.getCookie("cookieConsent")).toBe("necessary");
  });

  test("gets cookie choice from cookie first", () => {
    const cookieConsent = loadCookieConsentScript();

    localStorage.setItem("cookieConsent", "reject");
    cookieConsent.setCookie("cookieConsent", "accept", 180);

    expect(cookieConsent.getCookieChoice()).toBe("accept");
  });

  test("gets cookie choice from localStorage when cookie is missing", () => {
    const cookieConsent = loadCookieConsentScript();

    localStorage.setItem("cookieConsent", "reject");

    expect(cookieConsent.getCookieChoice()).toBe("reject");
  });

  test("shows cookie banner", () => {
    const cookieConsent = loadCookieConsentScript();

    const banner = document.getElementById("cookie-banner");

    expect(banner.hidden).toBe(true);

    cookieConsent.showCookieBanner();

    expect(banner.hidden).toBe(false);
  });

  test("hides cookie banner", () => {
    const cookieConsent = loadCookieConsentScript();

    const banner = document.getElementById("cookie-banner");
    banner.hidden = false;

    cookieConsent.hideCookieBanner();

    expect(banner.hidden).toBe(true);
  });

  test("show and hide banner do not throw when banner is missing", () => {
    const cookieConsent = loadCookieConsentScript();

    document.body.innerHTML = "";

    expect(() => cookieConsent.showCookieBanner()).not.toThrow();
    expect(() => cookieConsent.hideCookieBanner()).not.toThrow();
  });

  test("enables non-essential cookies when choice is accept", () => {
    const cookieConsent = loadCookieConsentScript();

    cookieConsent.applyCookieChoice("accept");

    expect(console.log).toHaveBeenCalledWith("Non-essential cookies enabled.");
  });

  test("does not enable non-essential cookies when choice is reject", () => {
    const cookieConsent = loadCookieConsentScript();

    cookieConsent.applyCookieChoice("reject");

    expect(console.log).not.toHaveBeenCalledWith("Non-essential cookies enabled.");
  });

  test("DOMContentLoaded shows banner when no choice is saved", () => {
    loadCookieConsentScript();

    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.getElementById("cookie-banner").hidden).toBe(false);
  });

  test("DOMContentLoaded applies saved accept choice", () => {
    localStorage.setItem("cookieConsent", "accept");

    loadCookieConsentScript();

    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(document.getElementById("cookie-banner").hidden).toBe(true);
    expect(console.log).toHaveBeenCalledWith("Non-essential cookies enabled.");
  });

  test("necessary button saves necessary choice and hides banner", () => {
    loadCookieConsentScript();

    document.dispatchEvent(new Event("DOMContentLoaded"));

    document.getElementById("necessary-cookies").click();

    expect(localStorage.getItem("cookieConsent")).toBe("necessary");
    expect(document.getElementById("cookie-banner").hidden).toBe(true);
  });

  test("reject button saves reject choice and hides banner", () => {
    loadCookieConsentScript();

    document.dispatchEvent(new Event("DOMContentLoaded"));

    document.getElementById("reject-cookies").click();

    expect(localStorage.getItem("cookieConsent")).toBe("reject");
    expect(document.getElementById("cookie-banner").hidden).toBe(true);
  });

  test("accept button saves accept choice, applies choice, and hides banner", () => {
    loadCookieConsentScript();

    document.dispatchEvent(new Event("DOMContentLoaded"));

    document.getElementById("accept-cookies").click();

    expect(localStorage.getItem("cookieConsent")).toBe("accept");
    expect(document.getElementById("cookie-banner").hidden).toBe(true);
    expect(console.log).toHaveBeenCalledWith("Non-essential cookies enabled.");
  });

  test("does not fail when buttons are missing", () => {
    document.body.innerHTML = `<div id="cookie-banner" hidden></div>`;

    expect(() => {
      loadCookieConsentScript();
      document.dispatchEvent(new Event("DOMContentLoaded"));
    }).not.toThrow();
  });
});
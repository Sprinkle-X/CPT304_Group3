const COOKIE_CONSENT_KEY = "cookieConsent";

function setCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");

    if (key === name) {
      return value;
    }
  }

  return null;
}

function saveCookieChoice(choice) {
  localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  setCookie(COOKIE_CONSENT_KEY, choice, 180);
}

function getCookieChoice() {
  return getCookie(COOKIE_CONSENT_KEY) || localStorage.getItem(COOKIE_CONSENT_KEY);
}

function showCookieBanner() {
  const banner = document.getElementById("cookie-banner");

  if (banner) {
    banner.hidden = false;
  }
}

function hideCookieBanner() {
  const banner = document.getElementById("cookie-banner");

  if (banner) {
    banner.hidden = true;
  }
}

function enableNonEssentialCookies() {
  /*
    If the project later uses Google Analytics, tracking scripts,
    advertising scripts, or other third-party scripts, load them here
    only after the user clicks "Accept All".
  */

  console.log("Non-essential cookies enabled.");
}

function applyCookieChoice(choice) {
  if (choice === "accept") {
    enableNonEssentialCookies();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const savedChoice = getCookieChoice();

  if (!savedChoice) {
    showCookieBanner();
  } else {
    applyCookieChoice(savedChoice);
  }

  const necessaryButton = document.getElementById("necessary-cookies");
  const rejectButton = document.getElementById("reject-cookies");
  const acceptButton = document.getElementById("accept-cookies");

  if (necessaryButton) {
    necessaryButton.addEventListener("click", () => {
      saveCookieChoice("necessary");
      hideCookieBanner();
    });
  }

  if (rejectButton) {
    rejectButton.addEventListener("click", () => {
      saveCookieChoice("reject");
      hideCookieBanner();
    });
  }

  if (acceptButton) {
    acceptButton.addEventListener("click", () => {
      saveCookieChoice("accept");
      applyCookieChoice("accept");
      hideCookieBanner();
    });
  }
});

if (typeof module !== "undefined") {
  module.exports = {
    COOKIE_CONSENT_KEY,
    setCookie,
    getCookie,
    saveCookieChoice,
    getCookieChoice,
    showCookieBanner,
    hideCookieBanner,
    enableNonEssentialCookies,
    applyCookieChoice,
  };
}
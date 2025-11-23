// openFoliosView.js

function notify() {
  chrome.runtime.sendMessage({ type: "FOLIO_VIEW_BUTTON_CLICKED" });
}

// If we're already on GuestFolio.do → immediately notify and exit
if (window.location.href.includes("GuestFolio.do")) {
  console.log("Already on GuestFolio.do → sending message");
  notify();
} else {
  // Otherwise wait for the link and click it
  function waitForElement(selector, callback) {
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        callback(el);
      }
    }, 200);
  }

  waitForElement('#guestFolioEnabled', (folioLink) => {
    notify();
    folioLink.click();
  });
}

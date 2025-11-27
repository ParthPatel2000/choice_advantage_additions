// // openFoliosView.js

// openFoliosView.js

function notify() {
  chrome.runtime.sendMessage({ type: "FOLIO_VIEW_BUTTON_CLICKED" });
}

// Checks if we are on Guest Folio page by looking for any h3 containing "Guest Folio"
function isOnGuestFolioPage() {
  const h3Elements = document.querySelectorAll('h3.CHI_Title');
  return Array.from(h3Elements).some(h3 => h3.textContent.includes("Guest Folio"));
}

if (isOnGuestFolioPage()) {
  console.log("Detected Guest Folio page → sending message");
  notify();
} else {
  // Wait for the folio link and click it
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
    folioLink.click();

    // After clicking, continuously check for the Guest Folio h3
    const checkInterval = setInterval(() => {
      if (isOnGuestFolioPage()) {
        clearInterval(checkInterval);
        console.log("Reached Guest Folio page → sending message");
        notify();
      }
    }, 200);
  });
}

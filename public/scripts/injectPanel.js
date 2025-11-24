
// contentScript.ts
function injectFloatingDiv() {
  let div = document.getElementById("dnr-floating-div");

  if (!div) {
    div = document.createElement("div");
    div.id = "dnr-floating-div";

    // Style for smaller red alert box
    div.style.position = "fixed";
    div.style.bottom = "20px";
    div.style.right = "20px";
    div.style.width = "200px";    // smaller width
    div.style.height = "100px";   // smaller height
    div.style.zIndex = "999999";
    div.style.borderRadius = "8px";
    div.style.background = "red"; // red color
    div.style.color = "white";
    div.style.boxShadow = "0 4px 15px rgba(0,0,0,0.3)";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.fontFamily = "Arial, sans-serif";
    div.style.fontSize = "16px";
    div.style.textAlign = "center";
    div.style.transition = "all 0.3s";

    div.innerText = "Waiting for alerts...";

    document.body.appendChild(div);
  }
}

// Inject initially
injectFloatingDiv();

// Listen for messages from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "NEW_DNR_ALERT") {
    const div = document.getElementById("dnr-floating-div");
    if (div) {
      div.innerText = msg.payload || "NEW DNR ALERT!";
      // Pop animation
      div.style.transform = "scale(1.1)";
      setTimeout(() => {
        div.style.transform = "scale(1)";
      }, 300);
    }
  }
});

// Observe SPA URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    injectFloatingDiv();
  }
}).observe(document, { subtree: true, childList: true });

// Observe DOM changes (if SPA removes our div)
new MutationObserver(() => {
  if (!document.getElementById("dnr-floating-div")) {
    injectFloatingDiv();
  }
}).observe(document.body, { childList: true, subtree: true });

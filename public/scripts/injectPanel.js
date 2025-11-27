// injectPanel.js
function injectFloatingDiv() {
  let div = document.getElementById("dnr-floating-div");

  if (!div) {
    div = document.createElement("div");
    div.id = "dnr-floating-div";

    // Make the div draggable
    makeDraggable(div);

    // Base glassmorphic styles
    Object.assign(div.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "220px",
      height: "110px",
      zIndex: "999999",
      borderRadius: "12px",
      background: "rgba(255, 255, 255, 0.18)",
      backdropFilter: "blur(12px) saturate(180%)",
      WebkitBackdropFilter: "blur(12px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
      color: "black",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      fontSize: "16px",
      textAlign: "center",
      transition: "all 0.3s",
      padding: "10px",
      userSelect: "none",
      cursor: "move"
    });

    div.innerText = "Waiting for alerts...";
    document.body.appendChild(div);
  }
}

// Draggable helper
function makeDraggable(el) {
  let isDragging = false, offsetX = 0, offsetY = 0;

  el.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
    el.style.transition = "none";
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
    el.style.right = "auto";
    el.style.bottom = "auto";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    el.style.transition = "all 0.3s";
  });
}

// Inject initially
injectFloatingDiv();

// Listen for messages
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "NEW_DNR_ALERT") {
    const div = document.getElementById("dnr-floating-div");
    if (div) {
      div.innerText = msg.payload.text || "Alert";
      applyGlassStyle(div, msg.payload.level);

      // Pop effect
      div.style.transform = "scale(1.1)";
      setTimeout(() => div.style.transform = "scale(1)", 300);
    }
  }
});

// SPA URL observer
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    injectFloatingDiv();
  }
}).observe(document, { subtree: true, childList: true });

// DOM observer (if SPA removes our div)
new MutationObserver(() => {
  if (!document.getElementById("dnr-floating-div")) injectFloatingDiv();
}).observe(document.body, { childList: true, subtree: true });

// Glass style application
function applyGlassStyle(div, type) {
  const styles = {
    success: { bg: "rgba(0,255,0,0.2)", border: "1px solid rgba(0,255,0,0.35)", color: "black" },
    warning: { bg: "rgba(255,165,0,0.2)", border: "1px solid rgba(255,165,0,0.35)", color: "black" },
    danger: { bg: "rgba(255,0,0,0.2)", border: "1px solid rgba(255,0,0,0.35)", color: "black" },
    info: { bg: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", color: "black" }
  };

  const s = styles[type] || styles.info;
  div.style.background = s.bg;
  div.style.border = s.border;
  div.style.color = s.color;
}


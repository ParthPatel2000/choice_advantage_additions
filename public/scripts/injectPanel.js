// injectPanel.js

//StayoversPanel

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.stayoversCache) {
    injectStayoverDiv(); // re-render panel automatically
  }
});

// Inject Stayovers Panel
function injectStayoverDiv() {
  let div = document.getElementById("stayovers-floating-div");

  if (!div) {
    div = document.createElement("div");
    div.id = "stayovers-floating-div";

    // Make it draggable like the main panel
    makeDraggable(div);

    // Base glassmorphic styles
    Object.assign(div.style, {
      position: "fixed",
      bottom: "20px", 
      right: "210px",
      width: "220px",
      minHeight: "auto",
      maxHeight: "70vh",
      overflowY: "auto",
      zIndex: "999999",
      borderRadius: "12px",
      background: "rgba(255, 255, 255, 0.18)",
      backdropFilter: "blur(12px) saturate(180%)",
      WebkitBackdropFilter: "blur(12px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
      color: "black",
      display: "none",
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

    div.innerText = "Checking stayovers...";
    document.body.appendChild(div);
  }

  // Fetch stayovers from local storage
  chrome.storage.local.get(["stayoversCache"], ({ stayoversCache }) => {
    div.innerHTML = "";

    if (!stayoversCache || stayoversCache.length === 0) {
      div.style.display = "none";
      return;
    }

    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "stretch";
    div.style.padding = "10px";
    applyGlassStyle(div, "info");

    stayoversCache.forEach(s => {
      const child = document.createElement("div");
      child.innerText = `${s.last_name} ${s.first_name} (${s.room}) - Follow Up Reservation`;
      Object.assign(child.style, {
        width: "100%",
        marginBottom: "4px",
        padding: "6px 10px",
        borderRadius: "8px",
        textAlign: "center",
        fontSize: "14px",
        background: "rgba(255,255,255,0.18)",
        whiteSpace: "normal",
        overflowWrap: "break-word",
        boxSizing: "border-box",
      });

      div.appendChild(child);
    });

    div.style.transform = "scale(1.1)";
    setTimeout(() => div.style.transform = "scale(1)", 300);
  });

}

//injecting via direct checks.
if (isStayoverPage()) injectStayoverDiv();


function isStayoverPage() {
  // 1. Welcome page
  if (document.getElementById("smartwelcome_greeting")) return true;

  // 2. Pages with CHI_Title H3
  const titles = document.querySelectorAll("h3.CHI_Title");

  // Check if any title starts with "Arrivals:" or "Departures:"
  for (const title of titles) {
    const text = title.textContent.trim().toLowerCase();
    if (text.startsWith("arrivals:") || text.startsWith("departures:")) {
      return true;
    }
  }

  // 3. Not a stayover page
  return false;
}


function ensureStayoversPanel() {
  const div = document.getElementById("stayovers-floating-div");

  if (isStayoverPage()) {
    injectStayoverDiv();
  } else if (div) {
    div.remove();
  }
}

//End of Stayovers Panel

// DNR/watchlist Panel.
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
      minHeight: "auto",
      maxHeight: "70vh",
      overflowY: "auto",
      zIndex: "999999",
      borderRadius: "12px",
      background: "rgba(255, 255, 255, 0.18)",
      backdropFilter: "blur(12px) saturate(180%)",
      WebkitBackdropFilter: "blur(12px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.25)",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
      color: "black",
      display: "none",  //hidden Initially.
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

// Listen for Alert (Watchlist Hit) messages
chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === "NEW_DNR_ALERT") {
    const div = document.getElementById("dnr-floating-div");
    if (!div) return;

    // Clear previous content
    div.innerHTML = "";

    // Check if payload is an object with multiple alerts
    if (msg.payload && typeof msg.payload === "object" && Array.isArray(msg.payload.alerts)) {
      // Parent div: neutral "info" styling

      applyGlassStyle(div, "info");

      Object.assign(div.style, {
        width: "220px",
        maxWidth: "90vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        padding: "10px",
      });

      // Create child divs for each alert
      msg.payload.alerts.forEach(alert => {
        const child = document.createElement("div");
        child.innerText = alert.text || "Alert";

        Object.assign(child.style, {
          width: "100%",
          marginBottom: "4px",
          padding: "6px 10px",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "14px",
          background: "rgba(255,255,255,0.18)",
          transition: "all 0.3s",
          whiteSpace: "normal",     // allow text to wrap
          overflowWrap: "break-word", // break long words if needed
          boxSizing: "border-box",  // include padding in width
        });

        // Apply individual color based on level
        applyGlassStyle(child, alert.level || "info");

        div.appendChild(child);
      });

    } else {
      // Single alert (old behavior)
      div.innerText = msg.payload.text || "Alert";
      applyGlassStyle(div, msg.payload.level || "info");
      div.style.display = "flex";
      div.style.flexDirection = "row";
      div.style.alignItems = "center";
      div.style.justifyContent = "center";
    }

    // Pop effect
    div.style.transform = "scale(1.1)";
    setTimeout(() => div.style.transform = "scale(1)", 300);
  }
});

// SPA URL observer
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    injectFloatingDiv();
    ensureStayoversPanel();
  }
}).observe(document, { subtree: true, childList: true });

// DOM observer (if SPA removes our div)
new MutationObserver(() => {
  if (!document.getElementById("dnr-floating-div")) injectFloatingDiv();
  if (!document.getElementById("stayovers-floating-div")) ensureStayoversPanel();
}).observe(document.body, { childList: true, subtree: true });

// Glass style application
function applyGlassStyle(div, type) {
  const styles = {
    success: { bg: "rgba(0,255,0,0.2)", border: "1px solid rgba(0,255,0,0.35)", color: "black" },
    medium: { bg: "rgba(255,165,0,0.45)", border: "1px solid rgba(255,165,0,0.75)", color: "black" },
    max: { bg: "rgba(255,0,0,0.45)", border: "1px solid rgba(255,0,0,0.75)", color: "black" },
    info: { bg: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", color: "black" }
  };

  const s = styles[type] || styles.info;
  div.style.background = s.bg;
  div.style.border = s.border;
  div.style.color = s.color;
}


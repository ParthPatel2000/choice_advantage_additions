// src/options/Settings.tsx
import { useState, useEffect } from "react";
import Rateplans from "./Rateplans";

export default function Settings() {
  const [experimental, setExperimental] = useState(false);

  // Load current value on mount
  useEffect(() => {
    chrome.storage.local.get(["experimentalFeatures"], (result) => {
      if (result.experimentalFeatures === undefined) {
        // Initialize to false if not set
        chrome.storage.local.set({ experimentalFeatures: false });
        setExperimental(false);
      } else {
        setExperimental(result.experimentalFeatures === true);
      }
    });
  }, []);

  // Handle toggle
  const toggleExperimental = () => {
    const newValue = !experimental;
    setExperimental(newValue);
    chrome.storage.local.set({ experimentalFeatures: newValue });
  };

  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Extension Settings</h1>
        <p className="text-gray-700 mb-4">Enable or disable experimental features:</p>

        <div className="flex items-center gap-3">
          <span className="text-gray-800 font-medium">Experimental Features</span>

          {/* Toggle switch */}
          <button
            onClick={toggleExperimental}
            className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 focus:outline-none ${experimental ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"
              }`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow-md transform duration-300"></span>
          </button>
        </div>

        <p className="text-gray-500 mt-2 text-sm">
          Turning this on will show experimental features in the extension UI.<br />
          Although heavily tested, not for everyone; they are hidden by default.
        </p>


      </div>
      <Rateplans />
    </>
  );
}

// export default Dnrcontrols;
import React, { useState, useEffect } from "react";
//@ts-ignore
import {initializeWatchlistIndex} from "../../public/scripts/utils/initializeWatchlistIndex.js"

type DnrRow = string[];

// Dnrcontrols.tsx
type DnrControlsProps = {
  goHome: () => void; // define the prop
};

const Dnrcontrols: React.FC<DnrControlsProps> = ({ goHome }) => {
  const [dnrList, setDnrList] = useState<DnrRow[]>([]);


  // Manual add form state
  const [errors, setErrors] = useState({
    first: false,
    last: false,
    list: false,
  });

  const [manualFirstName, setManualFirstName] = useState("");
  const [manualLastName, setManualLastName] = useState("");
  const [manualSeverity, setManualSeverity] = useState<"max" | "medium" | "info">("info");
  const [manualList, setManualList] = useState("");
  const [manualReason, setManualReason] = useState("");

  const addManualEntry = () => {
    const firstMissing = !manualFirstName.trim();
    const lastMissing = !manualLastName.trim();
    const listMissing = !manualList.trim();

    if (firstMissing || lastMissing || listMissing) {
      setErrors({
        first: firstMissing,
        last: lastMissing,
        list: listMissing,
      });
      return;
    }

    // Clear errors when valid
    setErrors({ first: false, last: false, list: false });

    const newRow: DnrRow = [
      manualFirstName.trim(),
      manualLastName.trim(),
      manualList.trim(),
      manualSeverity,
      manualReason.trim()
    ];

    setDnrList(prev => {
      const combined = [...prev, newRow];
      const unique: DnrRow[] = Array.from(new Map(combined.map(r => [r.join(","), r])).values());
      chrome.storage.local.set({ dnrList: unique }).then(() => {
            initializeWatchlistIndex();
          })
      return unique;
    });

    // Clear form
    setManualFirstName("");
    setManualLastName("");
    setManualList("");
    setManualReason("");
    setManualSeverity("info");
  };


  const injectScript = (fileName: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id!;
      chrome.scripting.executeScript({ target: { tabId }, files: [fileName] });
    });
  };


  // -------------------------
  // PREFILL CURRENT GUEST
  // -------------------------
  const prefillCurrentGuest = () => {
    injectScript("scripts/scrapeDetails.js");

    const handleGuestInfo = (msg: any) => {
      if (msg.type === "GUEST_INFO_DATA" && msg.payload) {
        const guest = msg.payload;

        setManualFirstName(guest.firstName.replace(/,/g, ";").trim() || "");
        setManualLastName(guest.lastName.replace(/,/g, ";").trim() || "");
        setManualList("");
        setManualReason("");
        setManualSeverity("info");

        chrome.runtime.onMessage.removeListener(handleGuestInfo);
      }
    };

    chrome.runtime.onMessage.addListener(handleGuestInfo);
  };

  // Load stored list
  useEffect(() => {
    chrome.storage.local.get(["dnrList"], (result) => {
      if (result?.dnrList && Array.isArray(result.dnrList)) {
        setDnrList(result.dnrList);
      }
    });
  }, []);

  return (
    <div>
      <>
        <div className="flex items-center justify-between mb-2 relative">
          {/* Left: Back/Home button */}
          <button
            className="bg-gray-700 text-white rounded hover:bg-gray-800 transition px-2"
            onClick={goHome}
            title="Home"
          >
            <span className="text-2xl leading-none">←</span>
          </button>


          {/* Centered title */}
          <h2
            className="text-[16px] font-semibold absolute left-1/2 transform -translate-x-1/2">
            Watchlist Form
          </h2>

          {/* Right: optional space to balance layout */}
          <div className="w-20"></div>
        </div>

        {/* Manual Add Form */}
        <div className="mt-4 border p-3 rounded">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Add to Watchlist</h3>

            <button
              onClick={prefillCurrentGuest}
              className="bg-purple-500 text-white py-1 px-3 rounded hover:bg-purple-600 transition"
              title="Press on Reservation information page or guest info page to get the first and lastname."
            >
              Current Guest
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder={errors.first ? "Required" : "First Name*"}
              value={manualFirstName}
              onChange={e => {
                setManualFirstName(e.target.value.replace(/,/g, ";"));
                if (errors.first) setErrors(prev => ({ ...prev, first: false }));
              }}
              onFocus={() => {
                if (errors.first) setErrors(prev => ({ ...prev, first: false }));
              }}
              className={`border p-2 rounded ${errors.first ? "border-red-500 placeholder-red-500" : ""}`}
            />

            <input
              type="text"
              placeholder={errors.last ? "Required" : "Last Name*"}
              value={manualLastName}
              onChange={e => {
                setManualLastName(e.target.value.replace(/,/g, ";"));
                if (errors.last) setErrors(prev => ({ ...prev, last: false }));
              }}
              onFocus={() => {
                if (errors.last) setErrors(prev => ({ ...prev, last: false }));
              }}
              className={`border p-2 rounded ${errors.last ? "border-red-500 placeholder-red-500" : ""}`}
            />

            <input
              type="text"
              placeholder={errors.list ? "Required" : "DNR/local/trouble/*"}
              value={manualList}
              onChange={e => {
                setManualList(e.target.value.replace(/,/g, ";"));
                if (errors.list) setErrors(prev => ({ ...prev, list: false }));
              }}
              onFocus={() => {
                if (errors.list) setErrors(prev => ({ ...prev, list: false }));
              }}
              className={`border p-2 rounded ${errors.list ? "border-red-500 placeholder-red-500" : ""}`}
            />


            <input
              type="text"
              placeholder="Reason/Notes"
              value={manualReason}
              onChange={e => setManualReason(e.target.value.replace(/,/g, ";"))}
              className="border p-2 rounded"
            />

            <select
              value={manualSeverity}
              onChange={e => setManualSeverity(e.target.value as "max" | "medium" | "info")}
              className={`border p-2 rounded text-black transition
    ${manualSeverity === "max" ? "bg-red-200 hover:bg-red-300" :
                  manualSeverity === "medium" ? "bg-yellow-200 hover:bg-yellow-300" :
                    "bg-gray-100 hover:bg-gray-200"}`}
            >
              <option value="max" className="bg-red-200 hover:bg-red-300">Max</option>
              <option value="medium" className="bg-yellow-200 hover:bg-yellow-300">Medium</option>
              <option value="info" className="bg-gray-100 hover:bg-gray-200">Info</option>
            </select>


            <button
              onClick={addManualEntry}
              className={`py-1 px-3 rounded text-white transition
                  ${manualSeverity === "max" ? "bg-red-500 hover:bg-red-600" :
                  manualSeverity === "medium" ? "bg-yellow-500 hover:bg-yellow-600" :
                    "bg-gray-500 hover:bg-gray-600"}`}
            >
              Add
            </button>
          </div>
        </div>


        <div className="flex items-center justify-between mb-2 mt-3 text-sm text-gray-700">
          Loaded: {dnrList.length} rows
          <button
            onClick={() => window.open(chrome.runtime.getURL("options.html#/watchlist"))}
            className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
            title="Click to open the Watch list."
          >
            View/Edit List
          </button>
        </div>
      </>
    </div>
  );
};

export default Dnrcontrols;

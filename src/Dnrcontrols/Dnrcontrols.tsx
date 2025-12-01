// export default Dnrcontrols;
import React, { useState, useEffect } from "react";
import DnrListView from "./DnrListView/DnrListView";
import { importCsv } from "../utils/importCSV";
import { exportCsv } from "../utils/exportCSV";

type DnrRow = string[];

// Dnrcontrols.tsx
type DnrControlsProps = {
  goHome: () => void; // define the prop
};

const Dnrcontrols: React.FC<DnrControlsProps> = ({ goHome }) => {
  const [dnrList, setDnrList] = useState<DnrRow[]>([]);
  const [viewMode, setViewMode] = useState<"controls" | "list">("controls");


  // Manual add form state
  const [manualFirstName, setManualFirstName] = useState("");
  const [manualLastName, setManualLastName] = useState("");
  const [manualSeverity, setManualSeverity] = useState<"max" | "medium" | "info">("info");
  const [manualReason, setManualReason] = useState("");

  const addManualEntry = () => {
    if (!manualFirstName.trim() || !manualLastName.trim() || !manualReason.trim()) return;

    const newRow: DnrRow = [
      manualFirstName.trim(),
      manualLastName.trim(),
      manualReason.trim(),
      manualSeverity
    ];

    setDnrList(prev => {
      const combined = [...prev, newRow];
      const unique: DnrRow[] = Array.from(new Map(combined.map(r => [r.join(","), r])).values());
      chrome.storage.local.set({ dnrList: unique });
      return unique;
    });

    // Clear form
    setManualFirstName("");
    setManualLastName("");
    setManualReason("");
    setManualSeverity("info");
  };


  const injectScript = (fileName: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id!;
      chrome.scripting.executeScript({ target: { tabId }, files: [fileName] });
    });
  };

  // CSV Upload
  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsed = await importCsv(file);

    setDnrList(prev => {
      const combined = [...prev, ...parsed];
      const unique: DnrRow[] = Array.from(new Map(combined.map(r => [r.join(","), r])).values());
      chrome.storage.local.set({ dnrList: unique });
      return unique;
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

        setManualFirstName(guest.firstName || "");
        setManualLastName(guest.lastName || "");
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
      {viewMode === "controls" ? (
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
            <h2 className="text-lg font-semibold absolute left-1/2 transform -translate-x-1/2">
              Watch Controls
            </h2>

            {/* Right: optional space to balance layout */}
            <div className="w-20"></div>
          </div>



          {/* CSV Upload */}
          <div className="flex gap-3">
            <input
              id="csvInput"
              type="file"
              accept=".csv"
              onChange={handleCSV}
              className="hidden"
            />

            <button
              onClick={() => document.getElementById("csvInput")?.click()}
              className="flex-1 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 transition"
              title="Import as many csv as you want, format: firstname,lastname,reason,severity"
            >
              Import CSV
            </button>

            <button
              onClick={() => exportCsv(dnrList, "dnr_list_backup.csv")}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
              title="Click to download the existing watch list for safekeeping."
            >
              Export CSV
            </button>
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
                placeholder="First Name"
                value={manualFirstName}
                onChange={e => setManualFirstName(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={manualLastName}
                onChange={e => setManualLastName(e.target.value)}
                className="border p-2 rounded"
              />

              <input
                type="text"
                placeholder="Reason"
                value={manualReason}
                onChange={e => setManualReason(e.target.value)}
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
              onClick={() => setViewMode("list")}
              className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
            >
              View/Edit List
            </button>
          </div>


          


        </>
      ) : (
        <DnrListView
          dnrList={dnrList}
          setDnrList={setDnrList}
          goBack={() => setViewMode("controls")}
        />
      )}
    </div>
  );
};

export default Dnrcontrols;

import React, { useState, useEffect } from "react";
import DnrListView from "./DnrListView/DnrListView";
import { importCsv } from "../utils/importCSV";
import { exportCsv } from "../utils/exportCSV";

type DnrRow = string[];

const Dnrcontrols: React.FC = () => {
  const [dnrList, setDnrList] = useState<DnrRow[]>([]);
  const [viewMode, setViewMode] = useState<"controls" | "list">("controls");

  const injectScript = (fileName: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id!;
      chrome.scripting.executeScript({ target: { tabId }, files: [fileName] }, () => {
        console.log(`✅ ${fileName} injected`);
      });
    });
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const parsed = await importCsv(file);

    setDnrList(prev => {
      const combined = [...prev, ...parsed];

      // Deduplicate based on full row content
      const unique: DnrRow[] = Array.from(
        new Map(combined.map(r => [r.join(","), r])).values()
      );

      chrome.storage.local.set({ dnrList: unique }, () => {
        console.log("DNR List saved to chrome.storage.local");
      });

      return unique;
    });
  };

  const clearList = () => {
    setDnrList([]);
    chrome.storage.local.remove("dnrList", () => {
      console.log("DNR List cleared");
    });
  };

  const addCurrentGuestToDNR = () => {
    // Inject the content script to scrape guest info
    injectScript("scripts/scrapeDetails.js");

    // Set up a one-time listener for the scraped data
    const handleGuestInfo = (msg: any) => {
      if (msg.type === "GUEST_INFO_DATA" && msg.payload) {
        const guest = msg.payload; // firstName, lastName, etc.

        const newRow: DnrRow = [guest.firstName, guest.lastName, "DNR", "max"];

        setDnrList(prev => {
          const combined = [...prev, newRow];

          // Deduplicate based on full row content
          const unique: DnrRow[] = Array.from(
            new Map(combined.map(r => [r.join(","), r])).values()
          );

          chrome.storage.local.set({ dnrList: unique }, () => {
            console.log("DNR List saved to chrome.storage.local");
          });

          return unique;
        });

        // Remove the listener after handling to avoid duplicates
        chrome.runtime.onMessage.removeListener(handleGuestInfo);
      }
    };

    chrome.runtime.onMessage.addListener(handleGuestInfo);
  };

  const removeCurrentGuestFromDNR = () => {
    // Inject the content script to scrape guest info
    injectScript("scripts/scrapeDetails.js");

    // Set up a one-time listener for the scraped data
    const handleGuestInfo = (msg: any) => {
      if (msg.type === "GUEST_INFO_DATA" && msg.payload) {
        const guest = msg.payload; // firstName, lastName, etc.
        const guestKey = `${guest.firstName.toLowerCase()}|${guest.lastName.toLowerCase()}`;

        setDnrList(prev => {
          const filtered = prev.filter(row => {
            const rowKey = `${row[0].toLowerCase()}|${row[1].toLowerCase()}`;
            return rowKey !== guestKey; // remove the matching guest
          });

          chrome.storage.local.set({ dnrList: filtered }, () => {
            console.log("DNR List updated, guest removed");
          });

          return filtered;
        });

        // Remove the listener after handling
        chrome.runtime.onMessage.removeListener(handleGuestInfo);
      }
    };

    chrome.runtime.onMessage.addListener(handleGuestInfo);
  };


  useEffect(() => {
    chrome.storage.local.get(["dnrList"], (result) => {
      if (result?.dnrList && Array.isArray(result.dnrList)) {
        setDnrList(result.dnrList);
      }
    });
  }, []);



  return (
    <div >
      {viewMode === "controls" ? (
        <>
          <h2 className="text-lg font-semibold mb-2">DNR Controls</h2>

          <input
            type="file"
            accept=".csv"
            onChange={handleCSV}
            className="border p-2 w-full rounded mb-2"
          />
          <div className="mt-3 text-sm text-gray-700">
            Loaded: {dnrList.length} rows
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={clearList}
              className="bg-red-500 text-white py-1 px-3 rounded mb-2 hover:bg-red-600 transition"
            >
              Clear List
            </button>

            <button
              onClick={() => exportCsv(dnrList, "dnr_list_backup.csv")}
              className="bg-green-500 text-white py-1 px-3 rounded mb-2 hover:bg-green-600 transition"
            >
              Export CSV
            </button>
          </div>
          <div style={{ display: "flex" }}>
            <button
              onClick={() => { addCurrentGuestToDNR() }}
              className="bg-green-500 text-white py-1 px-3 rounded mb-2 hover:bg-green-600 transition">
              Add Current Guest To DNR
            </button>

            <button
              onClick={() => { removeCurrentGuestFromDNR() }}
              className="bg-red-500 text-white py-1 px-3 rounded mb-2 hover:bg-red-600 transition">
              Remove Current Guest From DNR
            </button>
          </div>

          <button
            onClick={() => setViewMode("list")}
            className="bg-blue-500 text-white py-1 px-3 rounded mb-2 hover:bg-blue-600 transition"
          >
            View List
          </button>
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

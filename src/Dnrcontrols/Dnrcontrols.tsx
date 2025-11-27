import React, { useState } from "react";
import { importCsv } from "../utils/importCSV";
import { exportCsv } from "../utils/exportCSV";

type DnrRow = string[];

const Dnrcontrols: React.FC = () => {
  const [dnrList, setDnrList] = useState<DnrRow[]>([]);

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

  return (
    <div className="p-2">
      <h2 className="text-lg font-semibold mb-2">DNR Controls</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleCSV}
        className="border p-2 w-full rounded mb-2"
      />

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

      <div className="mt-3 text-sm text-gray-700">
        Loaded: {dnrList.length} rows
      </div>
    </div>
  );
};

export default Dnrcontrols;

import { useState, useEffect } from "react";
import { importCsv } from "../utils/importCSV";
import { exportCsv } from "../utils/exportCSV";


type DnrRow = string[];

const Watchlist = () => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [dnrList, setDnrList] = useState<DnrRow[]>([]);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<DnrRow | null>(null);
  const [rowToRemove, setRowToRemove] = useState<number | null>(null);


  // Load stored list on mount
  useEffect(() => {
    chrome.storage.local.get(["dnrList"], (result) => {
      if (Array.isArray(result.dnrList)) {
        setDnrList(result.dnrList);
      }
    });
  }, []);

  // Persist changes whenever dnrList changes
  useEffect(() => {
    chrome.storage.local.set({ dnrList });
  }, [dnrList]);

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

  const startEditingRow = (index: number) => {
    setEditingRowIndex(index);
    setEditedRow([...dnrList[index]]);
  };

  const cancelEditing = () => {
    setEditingRowIndex(null);
    setEditedRow(null);
  };

  const saveEditing = (index: number) => {
    if (!editedRow) return;
    setDnrList(prev => {
      const updated = [...prev];
      updated[index] = editedRow;
      chrome.storage.local.set({ dnrList: updated });
      return updated;
    });
    setEditingRowIndex(null);
    setEditedRow(null);
  };

  const removePerson = (index: number) => {
    setDnrList(prev => {
      const updated = prev.filter((_, i) => i !== index);
      chrome.storage.local.set({ dnrList: updated });
      return updated;
    });
  };

  const getRowColor = (severity: string) => {
    if (severity === "max") return "bg-red-100 hover:bg-red-200";
    if (severity === "medium") return "bg-yellow-100 hover:bg-yellow-200";
    return "hover:bg-gray-100";
  };

  const getSelectColor = (severity: string) => {
    if (severity === "max") return "bg-red-200 border-red-400";
    if (severity === "medium") return "bg-yellow-200 border-yellow-400";
    if (severity === "info") return "bg-gray-100 border-gray-300";
    return "";
  };

  return (

    <div className="p-4 min-h-screen bg-gray-50">
      {/* CSV Upload
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
          title="Import as many csv as you want, format: firstname,lastname,List,severity,reason"
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
      </div> */}

      <div className="flex items-center justify-between mb-4">
        {/* Title */}
        <h1 className="text-2xl font-bold">DNR Watchlist</h1>

        {/* Buttons group */}
        <div className="flex gap-2">
          {/* CSV Import */}
          <input
            id="csvInput"
            type="file"
            accept=".csv"
            onChange={handleCSV}
            className="hidden"
          />
          <button
            onClick={() => document.getElementById("csvInput")?.click()}
            className="bg-gray-700 text-white py-1 px-3 rounded hover:bg-gray-800 transition text-sm"
            title="Import as many CSVs as you want, format: firstname,lastname,List,severity,reason"
          >
            Import CSV
          </button>

          {/* CSV Export */}
          <button
            onClick={() => exportCsv(dnrList, "dnr_list_backup.csv")}
            className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition text-sm"
            title="Download the existing watch list for safekeeping"
          >
            Export CSV
          </button>

          {/* Clear List */}
          <button
            onClick={() => setShowConfirmClear(true)}
            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition text-sm"
            title="Clear the cached list, will stop all the watchlist alerts!!"
          >
            Clear List
          </button>
        </div>
      </div>


      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <p className="mb-4 font-semibold">Are you sure you want to clear the Watch list?</p>
            <div className="flex justify-between gap-4">
              <button
                onClick={() => {
                  setDnrList([]);
                  chrome.storage.local.remove("dnrList");
                  setShowConfirmClear(false);
                }}
                className="flex-1 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="flex-1 bg-gray-300 py-1 px-3 rounded hover:bg-gray-400 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/**Per Row modal */}
      {rowToRemove !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 text-center">
            <p className="mb-4 font-semibold">
              Are you sure you want to remove <span className="font-bold">
                {dnrList[rowToRemove][0]} {dnrList[rowToRemove][1]}
              </span> from the list?
            </p>
            <div className="flex justify-between gap-4">
              <button
                onClick={() => {
                  removePerson(rowToRemove);
                  setRowToRemove(null);
                }}
                className="flex-1 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
              >
                Yes
              </button>
              <button
                onClick={() => setRowToRemove(null)}
                className="flex-1 bg-gray-300 py-1 px-3 rounded hover:bg-gray-400 transition"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}


      {dnrList.length <= 1 ? (
        <div className="text-sm text-gray-600">No entries.</div>
      ) : (
        <div className="max-h-[75vh] overflow-y-auto overflow-x-hidden border border-gray-300 rounded hide-scrollbar">
          <table className="table-auto border-collapse w-full min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="border border-gray-300 px-2 py-2 text-left font-medium text-gray-700">
                  Name<div className="text-xs text-gray-500">first / last</div>
                </th>
                <th className="border border-gray-300 px-2 py-2 text-left font-medium text-gray-700">Notes</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-medium text-gray-700">List</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-medium text-gray-700">Severity</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dnrList.slice(1).map((row, i) => {
                const index = i + 1;
                const isEditing = editingRowIndex === index;
                return (
                  <tr key={index} className={`${getRowColor(row[3])} transition`}>
                    {/* First Name / Last Name */}
                    <td className="border border-gray-300 px-2 py-2 w-40">
                      <div className="flex flex-col leading-tight">
                        {isEditing ? (
                          <>
                            <input
                              value={editedRow![0]}
                              onChange={e => setEditedRow(prev => prev ? [...prev.slice(0, 0), e.target.value.replace(/,/g, ";").trim(), ...prev.slice(1)] : null)}
                              className="w-full border px-1 py-1 rounded mb-1"
                            />
                            <input
                              value={editedRow![1]}
                              onChange={e => setEditedRow(prev => prev ? [...prev.slice(0, 1), e.target.value.replace(/,/g, ";").trim(), ...prev.slice(2)] : null)}
                              className="w-full border px-1 py-1 rounded text-xs text-gray-600"
                            />
                          </>
                        ) : (
                          <>
                            <span>{row[0]}</span>
                            <span className="text-xs text-gray-600">{row[1]}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="border border-gray-300 px-2 py-2 w-64 truncate">
                      {isEditing ? (
                        <input
                          value={editedRow![4] || ""}
                          onChange={
                            e => setEditedRow(prev =>
                              prev ? [
                                ...prev.slice(0, 4),
                                e.target.value.replace(/,/g, ";").trim(),
                                ...prev.slice(5)
                              ] : null
                            )
                          }
                          className="w-full border px-1 py-1 rounded"
                        />
                      ) : (
                        row[4] || "Click Edit to add notes"
                      )}
                    </td>

                    {/* List */}
                    <td className="border border-gray-300 px-2 py-2 w-32">
                      {isEditing ? (
                        <input
                          value={editedRow![2]}
                          onChange={e => setEditedRow(prev => prev ? [...prev.slice(0, 2), e.target.value.replace(/,/g, ";").trim(), ...prev.slice(3)] : null)}
                          className="w-full border px-1 py-1 rounded"
                        />
                      ) : (
                        row[2]
                      )}
                    </td>

                    {/* Severity */}
                    <td className="border border-gray-300 px-2 py-2 w-32">
                      {isEditing ? (
                        <select
                          value={editedRow![3]}
                          onChange={e => setEditedRow(prev => prev ? [...prev.slice(0, 3), e.target.value, ...prev.slice(4)] : null)}
                          className={`border rounded px-2 py-1 w-24 ${getSelectColor(editedRow![3])}`}
                        >
                          <option value="max" className="bg-red-200">max</option>
                          <option value="medium" className="bg-yellow-200">medium</option>
                          <option value="info" className="bg-gray-100">info</option>
                        </select>
                      ) : (
                        row[3]
                      )}
                    </td>

                    {/* Actions */}
                    <td className="border border-gray-300 px-2 py-2 w-32">
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEditing(index)}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition text-xs"
                            >
                              Done
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400 transition text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditingRow(index)}
                              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setRowToRemove(index)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-xs"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
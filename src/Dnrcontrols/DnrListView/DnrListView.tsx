import React from "react";

type DnrRow = string[];

interface Props {
    dnrList: DnrRow[];
    setDnrList: React.Dispatch<React.SetStateAction<DnrRow[]>>;
    goBack: () => void;
}

const DnrListView: React.FC<Props> = ({ dnrList, setDnrList, goBack }) => {
    const updateSeverity = (index: number, severity: string) => {
        setDnrList(prev => {
            const updated = [...prev];
            updated[index][3] = severity;
            chrome.storage.local.set({ dnrList: updated });
            return updated;
        });
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
        return "hover:bg-gray-100"; // info or blank
    };

    const getSelectColor = (severity: string) => {
        if (severity === "max") return "bg-red-200 border-red-400";
        if (severity === "medium") return "bg-yellow-200 border-yellow-400";
        if (severity === "info") return "bg-gray-100 border-gray-300";
        return "";
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">DNR List</h2>

            <button
                onClick={goBack}
                className="bg-gray-500 text-white py-1 px-3 rounded mb-4 hover:bg-gray-600 transition"
            >
                Back
            </button>

            {dnrList.length <= 1 ? (
                <div className="text-sm text-gray-600">No entries.</div>
            ) : (
                // Scrollable container
                <div className="max-h-96 overflow-y-auto overflow-x-auto border border-gray-300 rounded">
                    <table className="table-auto border-collapse text-sm w-full">
                        <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th className="border px-2 py-2 text-left font-medium text-gray-700 w-32">
                                    Name
                                    <div className="text-xs text-gray-500">first / last</div>
                                </th>

                                <th className="border px-2 py-2 text-left font-medium text-gray-700 w-20">
                                    Tag
                                </th>

                                <th className="border px-2 py-2 text-left font-medium text-gray-700 w-20">
                                    Severity
                                </th>

                                <th className="border px-2 py-2 text-left font-medium text-gray-700 w-20">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {dnrList.slice(1).map((row, i) => {
                                const index = i + 1;

                                return (
                                    <tr key={index} className={`${getRowColor(row[3])} transition`}>
                                        <td className="border px-2 py-2">
                                            <div className="flex flex-col leading-tight">
                                                <span>{row[0]}</span>
                                                <span className="text-gray-600 text-xs">{row[1]}</span>
                                            </div>
                                        </td>

                                        <td className="border px-2 py-2">{row[2]}</td>

                                        <td className="border px-2 py-2">
                                            <select
                                                value={row[3]}
                                                onChange={(e) => updateSeverity(index, e.target.value)}
                                                className={`border rounded px-2 py-1 w-20 ${getSelectColor(row[3])}`}
                                            >
                                                <option value="max" className="bg-red-200">max</option>
                                                <option value="medium" className="bg-yellow-200">medium</option>
                                                <option value="info" className="bg-gray-100">info</option>
                                            </select>
                                        </td>

                                        <td className="border px-2 py-2">
                                            <button
                                                onClick={() => removePerson(index)}
                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-xs"
                                            >
                                                Remove
                                            </button>
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

export default DnrListView;

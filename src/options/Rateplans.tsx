import { useState, useEffect } from "react";

export default function Rateplans() {
    const [ratePlansList, setRatePlansList] = useState<string[]>([]);
    const [ratePlansCheckFlag, setRatePlansCheckFlag] = useState(false);
    const [newRatePlan, setNewRatePlan] = useState("");

    useEffect(() => {
        chrome.storage.local.get({
            ratePlans: [],
            ratePlansCheckFlag: false,
        }).then((res) => {
            setRatePlansCheckFlag(res.ratePlansCheckFlag as boolean);
            setRatePlansList(res.ratePlans as string[]);
        });

    }, [])

    const toggleRatePlanCheck = () => {
        const newValue = !ratePlansCheckFlag;
        setRatePlansCheckFlag(newValue);
        chrome.storage.local.set({ ratePlansCheckFlag: newValue });
    }

    const handleAdd = (newRatePlan: string) => {
        setRatePlansList((prev) => {
            const updated = [...prev, newRatePlan];
            chrome.storage.local.set({ ratePlans: updated }); // save the new array
            return updated;
        });
    }

    const handleRemove = (index: Number) => {
        setRatePlansList((prev) => {
            const updatedList = prev.filter((_, i) => i !== index)
            chrome.storage.local.set({ ratePlans: updatedList });
            return updatedList;
        });
    }



    return <>
        <div id="RateplansDiv" className="main-content">
            <p className="text-gray-700 mb-4 font-bold ">Rate Plan monitoring options</p>
            <div className="flex items-center gap-3 p-1 mb-2">

                <span className="text-gray-800 font-medium">Rate Plans whitelist</span>
                <button
                    onClick={() => { toggleRatePlanCheck() }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 focus:outline-none 
                        ${ratePlansCheckFlag ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"}`}
                >
                    <span className="w-4 h-4 bg-white rounded-full shadow-md transform duration-300"></span>
                </button>
            </div>
            <p className="text-gray-500 mt-1 mb-1 px-1 py-0 text-sm">
                Turning this on will start checking all of the arrivals with the below rate plans, if any reservation has a rate plan not listed below, it will alert you.<br />

            </p>
            <div className="border py-2 px-3 w-[280px] r border-gray-300 rounded-md mb-2">
                {
                    ratePlansList.length > 0 ? (ratePlansList.map((Rateplan, index) => {
                        <span className="py-2">Allowed Rate Plans:</span>
                        return (
                            <div
                                key={index}
                                className="flex items-center justify-between w-full px-3 py-1.5 border border-gray-300 rounded-md mb-2"
                            >
                                <span className="truncate">{Rateplan}</span>
                                <button
                                    className="bg-red-500 text-white py-0.5 px-2 rounded hover:bg-red-600 transition text-sm"
                                    onClick={() => handleRemove(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        );
                    })
                    ) :
                        (<span className="px-3 py-1">No Allowed Rate Plans.</span>)
                }




                <div className="flex items-center gap-1">
                    <input
                        type="text"
                        value={newRatePlan}
                        onChange={(e) => setNewRatePlan(e.target.value.toUpperCase().trim())}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleAdd(newRatePlan);
                                setNewRatePlan("");
                            }
                        }}
                        className="border p-1 rounded flex-grow"
                        placeholder="Add a new Rate Plan..."

                    />
                    <button
                        onClick={() => { handleAdd(newRatePlan) }}
                        className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
                    >Add </button>
                </div>
            </div>


        </div >
    </>
}
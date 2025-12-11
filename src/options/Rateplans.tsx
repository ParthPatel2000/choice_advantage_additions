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

    const hanleRemove = (index: Number) => {
        setRatePlansList((prev) => {
            const updatedList = prev.filter((val, i) => i !== index)
            chrome.storage.local.set({ ratePlans: updatedList });
            return updatedList;
        });
    }



    return <>
        <div id="RateplansDiv" className="main-content">
            <p className="text-gray-700 mb-4">Rate Plan monitoring options:</p>
            <div className="flex items-center gap-3">

                <span className="text-gray-800 font-medium">Rate Plans whitelist</span>
                <button
                    onClick={() => { toggleRatePlanCheck() }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 focus:outline-none 
                        ${ratePlansCheckFlag ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"}`}
                >
                    <span className="w-4 h-4 bg-white rounded-full shadow-md transform duration-300"></span>
                </button>
            </div>

            <div>
                <span>Rate Plans:</span>
                {
                    ratePlansList.map((Rateplan, index) => {
                        return <div key={index}>{index + 1} : {Rateplan}
                            <button onClick={(index) => { hanleRemove(index) }}></button>
                        </div>
                    })
                }

                <input
                    type="text"
                    value={newRatePlan}
                    onChange={(e) => setNewRatePlan(e.target.value.toUpperCase().trim())}
                    className="border p-1 rounded"
                    placeholder="Add a new Rate Plan..."

                />
                <button
                    onClick={() => { handleAdd(newRatePlan) }}
                    className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
                >Add </button>
            </div>
        </div >
    </>
}
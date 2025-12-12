import { useState, useEffect } from "react";


export default function Injection() {

    const [leisureGuestScriptFlag, setLeisureGuestScriptFlag] = useState<boolean>(false);

    useEffect(() => {
        chrome.storage.local.get(["leisureGuestScriptFlag"]).then((res) => {
            if (res.leisureGuestScriptFlag !== undefined) {
                setLeisureGuestScriptFlag(res.leisureGuestScriptFlag as boolean ?? false);
            }
            else {
                chrome.storage.local.set({ leisureGuestScriptFlag: false });
            }
        }
        )
    }, [])

    const toggleLeisureGuestScriptInjection = () => {
        setLeisureGuestScriptFlag(
            (prev) => {
                const update = !prev;
                chrome.storage.local.set({ leisureGuestScriptFlag: update })
                return update
            }
        );
    }

    return <>
        <div className="main-content">
            <div className="flex items-center gap-3 p-1">

                <span className="text-gray-800 font-medium"> Auto Select Leisure and Leisure Guest</span>
                <button
                    onClick={() => { toggleLeisureGuestScriptInjection() }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 focus:outline-none 
                        ${leisureGuestScriptFlag ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"}`}
                >
                    <span className="w-4 h-4 bg-white rounded-full shadow-md transform duration-300"></span>
                </button>
            </div>
            <p className="text-gray-500 mt-1 px-1 py-0 text-sm">
                Turning this on will Automatically select Leisure and Leisure Guest at checkin page.<br />
            </p>
        </div >
    </>
}
import { useEffect, useState } from "react"

export default function ButtonsVisibility() {

    const [visibilityArray, setVisibilityArray] = useState<boolean[]>([]);

    useEffect(() => {
        chrome.storage.local.get(["visibilityArray"]).then(
            (res) => {
                const stored = res.visibilityArray ?? [false, false, false, false];
                setVisibilityArray(stored as boolean[]);
                if (res.visibilityArray === undefined) {
                    chrome.storage.local.set({ visibilityArray: stored });
                }
            })
    }, [])

    const toggleVisibility = (btnIdx: number) => {
        setVisibilityArray((prev) => {
            const update = prev.map((val, index) => {
                return index === btnIdx ? !val : val;
            })
            chrome.storage.local.set({ visibilityArray: update });
            return update;

        })
    }

    return <>
        <div className="main-content">
            <p className="text-gray-700 mb-4 font-bold ">Button Visiblity options</p>

            <div className="mt-2">
                <div className="flex items-center gap-3 p-1">

                    <span className="text-gray-800 font-medium">Show copy and paste details bot buttons</span>
                    <button
                        onClick={() => { toggleVisibility(0) }}
                        className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 focus:outline-none 
                        ${visibilityArray[0] ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"}`}
                    >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md transform duration-300"></span>
                    </button>
                </div>
                <p className="text-gray-500 mt-1 px-1 py-0 text-sm">
                    Turning this on will show the buttons to run the copy and refund bot which copies guest info and refunds a cash deposit if it exists<br />
                    and The fill bot, it fills in the guest info and posts a cash deposit if it exisited in a new CASH DEP folio.<br />
                    run on guest info page.<br />
                </p>
            </div>

            <div className="mt-2">
                <div className="flex items-center gap-3 p-1 ">

                    <span className="text-gray-800 font-medium">Show custom Deposit buttons </span>
                    <button
                        onClick={() => { toggleVisibility(1) }}
                        className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 focus:outline-none 
                        ${visibilityArray[1] ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"}`}
                    >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md transform duration-300"></span>
                    </button>
                </div>
                <p className="text-gray-500 mt-1 px-1 py-0 text-sm">
                    Turning this on will show the two buttons to post a cash deposits in a new CASH DEP folio.<br />
                    these are editable buttons so press the pencil icon and setup the two most common deposit amounts.<br />
                    works on guest info and guest folio page.<br />
                </p>
            </div>

            <div className="mt-2">
                <div className="flex items-center gap-3 p-1">

                    <span className="text-gray-800 font-medium">Show cash dep and guest refund buttons </span>
                    <button
                        onClick={() => { toggleVisibility(2) }}
                        className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 focus:outline-none 
                        ${visibilityArray[2] ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"}`}
                    >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md transform duration-300"></span>
                    </button>
                </div>
                <p className="text-gray-500 mt-1 px-1 py-0 text-sm">
                    Turning this on will show the two buttons one to create new CASH DEP folio and take you to the post deposit step.<br />
                    other is the guest refund button that posts a guest refund on cash deposits if it exisits for the current guest, <br />
                    works on guest info and guest folio page.<br />
                </p>
            </div>

            <div className="mt-2">
                <div className="flex items-center gap-3 p-1">

                    <span className="text-gray-800 font-medium">Show manual copy and paste guest info button </span>
                    <button
                        onClick={() => { toggleVisibility(3) }}
                        className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 focus:outline-none 
                        ${visibilityArray[3] ? "bg-green-500 justify-end" : "bg-gray-300 justify-start"}`}
                    >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md transform duration-300"></span>
                    </button>
                </div>
                <p className="text-gray-500 mt-1 px-1 py-0 text-sm">
                    Turning this on will show copy gueset info button that copies current guest info, first name, lastname, phonenumber, zipcode, county, country.<br />
                    and the fill guest info button that pastes all of it in the current guest info, but only works if the current guest has the same name,<br />
                    use for follow up reservatiosn for 3rd parties that dont give much guest details.<br />
                    works on guest info page.
                </p>
            </div>


        </div>
    </>
}
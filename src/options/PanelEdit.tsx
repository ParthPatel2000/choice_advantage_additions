import { useEffect, useState, useRef } from "react";

type panelPos = {
    bottom: number;
    right: number;
};

export default function PanelEdit() {
    const [alertsPanelPosition, setAlertsPanelPos] = useState<panelPos | null>(null);
    const [stayoversPanelPosition, setStayoversPanelPos] = useState<panelPos | null>(null);
    const [fontSize, setFontSize] = useState<number>(14);
    const [panelWidth, setPanelWidth] = useState<number>(220);


    const [activePanel, setActivePanel] =
        useState<"alerts" | "stayovers" | null>(null);

    const previewRef = useRef<HTMLDivElement | null>(null);
    const [editPanelPos, setEditPanelPos] = useState<panelPos | null>(null);

    // load stored values
    useEffect(() => {
        chrome.storage.local
            .get([
                "alertsPanelPosition",
                "stayoversPanelPosition",
                "panelFontSize",
                "panelWidth",
            ])
            .then((res) => {
                const storedAlertsPos = res.alertsPanelPosition ?? {
                    bottom: 20,
                    right: 20,
                };
                const storedStayoversPos = res.stayoversPanelPosition ?? {
                    bottom: 20,
                    right: 210,
                };

                const storedFontSize = res.panelFontSize ?? 14;
                const storedPanelWidth = res.panelWidth ?? 220;

                setAlertsPanelPos(storedAlertsPos as panelPos);
                setStayoversPanelPos(storedStayoversPos as panelPos);
                setFontSize(storedFontSize as number);
                setPanelWidth(storedPanelWidth as number);

                // initialize storage if missing
                if (!res.alertsPanelPosition)
                    chrome.storage.local.set({
                        alertsPanelPosition: storedAlertsPos,
                    });
                if (!res.stayoversPanelPosition)
                    chrome.storage.local.set({
                        stayoversPanelPosition: storedStayoversPos,
                    });
                if (!res.panelFontSize)
                    chrome.storage.local.set({
                        panelFontSize: storedFontSize,
                    });
                if (!res.panelWidth)
                    chrome.storage.local.set({
                        panelWidth: storedPanelWidth,
                    });
            });
    }, []);

    // compute left/top from bottom/right
    const computeStyle = (pos: panelPos) => ({
        left: window.innerWidth - pos.right - panelWidth,
        top: window.innerHeight - pos.bottom - 50,
    });

    // select which panel to edit
    const showPanel = (panel: "alerts" | "stayovers") => {
        setActivePanel(panel);
        if (panel === "alerts" && alertsPanelPosition)
            setEditPanelPos(alertsPanelPosition);
        if (panel === "stayovers" && stayoversPanelPosition)
            setEditPanelPos(stayoversPanelPosition);
    };

    // save settings
    const savePanelSettings = () => {
        if (!activePanel || !editPanelPos) return;

        const panelKey =
            activePanel === "alerts"
                ? "alertsPanelPosition"
                : "stayoversPanelPosition";

        chrome.storage.local.set({
            [panelKey]: editPanelPos,
            panelFontSize: fontSize,
            panelWidth: panelWidth,
        });

        // sync local state
        if (activePanel === "alerts")
            setAlertsPanelPos(editPanelPos);
        if (activePanel === "stayovers")
            setStayoversPanelPos(editPanelPos);

        setPanelWidth(panelWidth);
        alert("Positions saved Successfully, any new alerts will use the new positions.")
    };

    return (

        <div className="main-content">
            <p className="section-title">Panel Edit Options</p>

            {/* Panel selector */}
            <div className="sub-settings-container ">
                <div className="settings-row flex">
                    <button
                        className={`flex-1 panel-toggle-btn ${activePanel === "alerts" ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        onClick={() => showPanel("alerts")}
                    >
                        Alerts
                    </button>

                    <button
                        className={`flex-1 panel-toggle-btn ${activePanel === "stayovers" ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        onClick={() => showPanel("stayovers")}
                    >
                        Stayovers
                    </button>
                </div>

                {activePanel && (
                    <>
                        {/* Position controls */}
                        <div className="settings-row">
                            <label className="mr-2">
                                Bottom:
                                <input
                                    type="number"
                                    value={editPanelPos?.bottom ?? 0}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setEditPanelPos((prev) =>
                                            prev ? { ...prev, bottom: value } : { bottom: value, right: 0 }
                                        );
                                    }}
                                    className="border px-1 rounded w-15 ml-1"
                                />
                                px
                            </label>
                        </div>

                        <div className="settings-row">
                            <label className="mr-2">
                                Right:
                                <input
                                    type="number"
                                    value={editPanelPos?.right ?? 0}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setEditPanelPos((prev) =>
                                            prev ? { ...prev, right: value } : { bottom: 0, right: value }
                                        );
                                    }}
                                    className="border px-1 rounded w-15 ml-1"
                                />
                                px
                            </label>
                        </div>

                        {/* Width slider */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Width</span>
                                <span className="text-sm text-gray-500">{panelWidth}px</span>
                            </div>

                            <input
                                type="range"
                                min={220}
                                max={500}
                                value={panelWidth}
                                onChange={(e) => setPanelWidth(parseInt(e.target.value))}
                                className="
                                    w-full h-2 rounded-lg appearance-none cursor-pointer
                                    bg-gray-200
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:w-4
                                    [&::-webkit-slider-thumb]:h-4
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-blue-500
                                    [&::-webkit-slider-thumb]:shadow
                                    [&::-moz-range-thumb]:w-4
                                    [&::-moz-range-thumb]:h-4
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:bg-blue-500
                                    [&::-moz-range-thumb]:border-0
                                "
                            />
                        </div>


                        {/* Font size slider */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Font Size</span>
                                <span className="text-sm text-gray-500">{fontSize}px</span>
                            </div>

                            <input
                                type="range"
                                min={10}
                                max={30}
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="
                                    w-full h-2 rounded-lg appearance-none cursor-pointer
                                    bg-gray-200
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:w-4
                                    [&::-webkit-slider-thumb]:h-4
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-blue-500
                                    [&::-webkit-slider-thumb]:shadow
                                    [&::-moz-range-thumb]:w-4
                                    [&::-moz-range-thumb]:h-4
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:bg-blue-500
                                    [&::-moz-range-thumb]:border-0
                                "
                            />
                        </div>


                        {/* Save */}
                        <div className="settings-row">
                            <button
                                className="bg-purple-600 text-white px-4 py-2 rounded"
                                onClick={savePanelSettings}
                            >
                                Save
                            </button>
                        </div>

                        {/* Preview */}
                        <div
                            ref={previewRef}
                            style={{
                                position: "fixed",
                                ...(editPanelPos
                                    ? computeStyle(editPanelPos)
                                    : { left: 0, top: 0 }),
                                width: `${panelWidth}px`,
                                minHeight: "50px",
                                background: "rgba(255,255,255,0.18)",
                                border: "1px solid rgba(255,255,255,0.35)",
                                borderRadius: "12px",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                                zIndex: 9999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: `${fontSize}px`,
                                color: "black",
                                cursor: "move",
                                padding: "10px",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                            }}
                        >
                            {activePanel === "alerts"
                                ? "Alerts Panel Preview"
                                : "Stayovers Panel Preview"}
                        </div>
                    </>
                )}
            </div>
        </div>

    );
}

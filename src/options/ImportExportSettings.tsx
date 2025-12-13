import { useRef } from "react";
export default function ImportExportSettings() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleExport = () => {
        chrome.storage.local.get([
            "depositButtons", "leisureGuestScriptFlag", "ratePlans",
            "ratePlansCheckFlag", "visibilityArray", "dnrList"]).then((res) => {
                interface Settings {
                    depositButtons?: number[];
                    leisureGuestScriptFlag?: boolean;
                    ratePlans?: string[];
                    ratePlansCheckFlag?: boolean;
                    visibilityArray?: boolean[];
                    dnrList?: string[][];
                }
                let settings: Settings = {};

                settings.depositButtons = res.depositButtons as number[] ?? [60, 100];
                settings.leisureGuestScriptFlag = res.leisureGuestScriptFlag as boolean ?? false;
                settings.ratePlans = res.ratePlans as string[] ?? [];
                settings.ratePlansCheckFlag = res.ratePlansCheckFlag as boolean ?? false;
                settings.visibilityArray = res.visibilityArray as boolean[] ?? [false, false, false, false];
                settings.dnrList = res.dnrList as string[][] ?? [];

                const settingsJSON = JSON.stringify(settings, null, 2);
                const blob = new Blob([settingsJSON], { type: "application/json" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "settings.json";
                a.click();

                URL.revokeObjectURL(url);

            });
    }

    const handleImportClick = () => {
        fileInputRef.current?.click();   // open file chooser
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {

        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();

        let imported: any;
        try {
            imported = JSON.parse(text);
        }
        catch {
            console.log("invalid JSON File.");
            return;
        }

        const settings = {
            depositButtons: imported.depositButtons ?? [60, 100],
            leisureGuestScriptFlag: imported.leisureGuestScriptFlag ?? false,
            ratePlans: imported.ratePlans ?? [],
            ratePlansCheckFlag: imported.ratePlansCheckFlag ?? false,
            visibilityArray: imported.visibilityArray ?? [false, false, false, false],
            dnrList: imported.dnrList ?? []
        };

        chrome.storage.local.set(settings);
        console.log("Settings Imported form JSON.")
        window.location.reload();
        return;
    }

    return <>
        <div className="main-content">


            <div className="flex gap-2 w-[280px]">
                <button
                    className="flex-1 bg-blue-500 py-1 px-3 hover:bg-blue-600 text rounded text-white"
                    onClick={() => { handleExport() }}
                >
                    Export settings
                </button>

                <button
                    className="flex-1 bg-green-500 py-1 px-3 hover:bg-green-600 text rounded text-white"
                    onClick={() => { handleImportClick() }}
                >
                    Import settings
                </button>
            </div >

            <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImport}
                hidden
            />
        </div>
    </>
}
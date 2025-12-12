export default function ImportExportSettings() {

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

    return <>
        <div className="main-content">
            <div className="flex">
                <button
                    className="bg-blue-700"
                    onClick={() => { handleExport() }}
                >
                    export
                </button>
            </div >
        </div>
    </>
}
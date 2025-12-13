// src/options/Settings.tsx
import Rateplans from "./Rateplans";
import Injection from "./Injection";
import ButtonsVisibility from "./ButtonsVisibility";
import ImportExportSettings from "./ImportExportSettings";
import PanelEdit from "./PanelEdit";

export default function Settings() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Extension Settings</h1>

      <Rateplans />
      <Injection />
      <ButtonsVisibility />
      <PanelEdit />
      <ImportExportSettings />
    </>
  );
}

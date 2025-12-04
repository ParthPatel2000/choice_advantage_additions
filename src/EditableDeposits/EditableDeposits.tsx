import React, { useState, useEffect } from 'react';
import "./EditableDeposits.css"

type EditableDepositsProps = {
  defaultDeposits?: string[];
  sendMessage: (action: string) => void;
};

const EditableDeposits: React.FC<EditableDepositsProps> = ({
  defaultDeposits = ['60', '100'],
  sendMessage
}) => {
  const [depositButtons, setDepositButtons] = useState<string[]>(defaultDeposits);
  const [editMode, setEditMode] = useState(false);

  // Load saved deposits from Chrome storage
  useEffect(() => {
    chrome.storage.local.get(['depositButtons'], (result) => {
      let buttons: string[] = [];

      if (
        Array.isArray(result.depositButtons) &&
        result.depositButtons.every((i) => typeof i === 'string')
      ) {
        buttons = result.depositButtons as string[]; // type assertion
      } else {
        // No valid storage, use defaults
        buttons = defaultDeposits;
        chrome.storage.local.set({ depositButtons: buttons });
      }

      setDepositButtons(buttons);
    });
  }, [defaultDeposits]);




  const updateDeposit = (index: number, value: string) => {
    setDepositButtons((prev) => {
      const updated = [...prev];
      updated[index] = value;
      chrome.storage.local.set({ depositButtons: updated });
      return updated;
    });
  };


  return (
    <div className="deposit-group flex gap-2">
      {depositButtons.map((val, i) =>
        editMode ? (
          <input
            key={i}
            type="text"
            value={val}
            onChange={(e) => updateDeposit(i, e.target.value)}
            className="deposit-input flex-1"
          />
        ) : (
          <div key={i} className="relative flex-1">
            <button
              className="deposit-button btn btn-purple w-full"
              onClick={() => sendMessage(`POST_DEPOSIT_SLT_${i}`)}
            >
              {val} CASH DEPOSIT
            </button>

            {/* Pencil overlay only on the 2nd button */}
            {!editMode && i === 1 && (
              <button
                className="absolute top-0 right-0 translate-x-[50%] -translate-y-[50%] w-6 h-6 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs shadow-md"
                onClick={() => setEditMode(true)}
                title="Edit deposit Values"
              >
                ✏️
              </button>
            )}
          </div>
        )
      )}

      {/* Done button, only in edit mode */}
      {editMode && (
        <button
          className="deposit-button btn btn-green flex-1"
          onClick={() => setEditMode(false)}
        >
          Done
        </button>
      )}
    </div>


  );
};

export default EditableDeposits;

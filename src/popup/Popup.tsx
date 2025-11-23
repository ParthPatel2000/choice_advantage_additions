import React, { useState } from 'react';

const Popup: React.FC = () => {
  const [logs, setLogs] = useState<string>('');

  const log = (msg: string) => setLogs(prev => prev + msg + '\n');

  const injectScript = (fileName: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id!;
      chrome.scripting.executeScript({ target: { tabId }, files: [fileName] }, () => {
        log(`✅ ${fileName} injected`);
      });
    });
  };

  const sendMessage = (action: string) => chrome.runtime.sendMessage({ action });

  const viewCache = () => log('=== View Cache Function ===');

  return (
  <div className="w-80 p-4 bg-gray-50 font-sans rounded-xl shadow-lg">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      Choice Arrivals Details Transfer
    </h3>

    <div className="flex gap-2 mb-3">
      <button
        className="flex-1 py-2 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition transform hover:-translate-y-0.5"
        onClick={() => sendMessage('start_scrape_bot')}
      >
        Scrape Bot
      </button>
      <button
        className="flex-1 py-2 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition transform hover:-translate-y-0.5"
        onClick={() => sendMessage('start_fill_bot')}
      >
        Fill Bot
      </button>
    </div>

    <div className="flex gap-2 mb-3">
      <button
        className="flex-1 py-2 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md transition transform hover:-translate-y-0.5"
        onClick={() => sendMessage('POST_DEPOSIT_USING_CUSTOM_FOLIO_BUTTON')}
      >
        60 CASH DEPOSIT
      </button>
      <button
        className="flex-1 py-2 rounded-xl font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md transition transform hover:-translate-y-0.5"
        onClick={() => sendMessage('ADD_CASH_DEP_FOLIO')}
      >
        CASH DEP FOLIO
      </button>
      <button
        className="flex-1 py-2 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md transition transform hover:-translate-y-0.5"
        onClick={() => sendMessage('POST_GUEST_REFUND_BUTTON')}
      >
        GUEST REFUND
      </button>
    </div>

    <div className="flex gap-2 mb-3">
      <button
        className="flex-1 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition transform hover:-translate-y-0.5"
        onClick={() => injectScript('scripts/scrapeDetails.js')}
      >
        Scrape Guest Info
      </button>
      <button
        className="flex-1 py-2 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition transform hover:-translate-y-0.5"
        onClick={() => injectScript('scripts/fillDetails.js')}
      >
        Fill Guest Info
      </button>
    </div>

    <button
      className="w-full py-2 rounded-xl font-semibold text-white bg-gray-700 hover:bg-gray-800 shadow-md transition transform hover:-translate-y-0.5 mb-3"
      onClick={() => injectScript('scripts/getFollowups.js')}
    >
      Get Stayovers
    </button>
    <button
      className="w-full py-2 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-950 shadow-md transition transform hover:-translate-y-0.5 mb-3"
      onClick={viewCache}
    >
      View Cached Data
    </button>

    <textarea
      value={logs}
      readOnly
      placeholder="Output logs here..."
      className="w-full h-36 p-2 rounded-xl border border-gray-300 font-mono text-sm bg-white text-gray-900 resize-none shadow-inner"
    />
  </div>
);

};

export default Popup;

import React, { useState } from 'react';
import './Popup.css'
import Dnrcontrols from '../Dnrcontrols/Dnrcontrols';

const Popup: React.FC = () => {
  const [logs, setLogs] = useState<string>('');
  const [showMain, setShowMain] = useState(true);

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
    <div className="panel">
      <h3 className="title">Choice Arrivals Details Transfer</h3>

      <button className='btn-dark'
        onClick={() => setShowMain(prev => !prev)}
      >
        {showMain ? 'show DNR controls' : "show main panel"}
      </button>
      {!showMain && <Dnrcontrols />}
      {showMain && (
        <>
          <div className="btn-group">
            <button className="btn btn-blue" onClick={() => sendMessage('start_scrape_bot')}>
              Scrape Bot
            </button>
            <button className="btn btn-green" onClick={() => sendMessage('start_fill_bot')}>
              Fill Bot
            </button>
          </div>

          <div className="btn-group">
            <button className="btn btn-purple" onClick={() => sendMessage('POST_DEPOSIT_60')}>
              60 CASH DEPOSIT
            </button>
            <button className="btn btn-orange" onClick={() => sendMessage('ADD_CASH_DEP_FOLIO')}>
              Add CASH DEP FOLIO
            </button>
            <button className="btn btn-red" onClick={() => sendMessage('POST_GUEST_REFUND_BUTTON')}>
              GUEST REFUND
            </button>
          </div>

          <div className="btn-group">
            <button className="btn btn-indigo" onClick={() => injectScript('scripts/scrapeDetails.js')}>
              Scrape Guest Info
            </button>
            <button className="btn btn-teal" onClick={() => injectScript('scripts/fillDetails.js')}>
              Fill Guest Info
            </button>
          </div>

          <button className="btn-gray" onClick={() => injectScript('scripts/getFollowups.js')}>
            Get Stayovers
          </button>

          <button className="btn-dark" onClick={viewCache}>
            View Cached Data
          </button>

          <textarea
            value={logs}
            readOnly
            placeholder="Output logs here..."
            className="log-box"
          />

          <button
            className="btn-dark"
            onClick={() => chrome.runtime.sendMessage({ type: 'WATCH_LIST_MEMBER_FOUND' })}
          >
            Test DNR dialog
          </button>
        </>
      )}
    </div>
  );


};

export default Popup;

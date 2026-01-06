import React, { useState, useEffect } from 'react';
import './Popup.css'
import Dnrcontrols from '../Dnrcontrols/Dnrcontrols';
import EditableDeposits from '../EditableDeposits/EditableDeposits';


const Popup: React.FC = () => {
  const [showMain, setShowMain] = useState(true);
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


  const injectScript = (fileName: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id!;
      chrome.scripting.executeScript({ target: { tabId }, files: [fileName] }, () => {
      });
    });
  };



  const sendMessage = (action: string) => chrome.runtime.sendMessage({ action });
  return (
    <div className="panel">

      {showMain ? (
        <>
          <div className='btn-group flex items-center gap-2'>
            <h3 className="title flex-grow flex-shrink truncate">
              Advantage Additions
            </h3>
            <button
              className='mb-4 btn-blue rounded-full  text-lg flex items-center justify-center'
              onClick={() => window.open(chrome.runtime.getURL("options.html#/settings"))}
              title='Settings'
            >
              ⚙
            </button>
          </div>

          {visibilityArray[0] && (
            <div className="btn-group">
              <button className="btn btn-blue" onClick={() => sendMessage('start_scrape_bot')}
                title="Run Copy guest info and refund depost Automation.">
                Copy and refund Bot
              </button>
              <button className="btn btn-green" onClick={() => sendMessage('start_fill_bot')}
                title="Run Fill Bot Automation">
                Fill Bot
              </button>
            </div>
          )}

          {visibilityArray[1] && (
            <EditableDeposits sendMessage={(action) => chrome.runtime.sendMessage({ action })} />
          )}

          {visibilityArray[2] && (
            <div className="btn-group">
              <button className="btn btn-orange" onClick={() => sendMessage('ADD_CASH_DEP_FOLIO')}
                title="Add a blank cash dep folio">
                Add CASH DEP FOLIO
              </button>
              <button className="btn btn-red" onClick={() => sendMessage('POST_GUEST_REFUND_BUTTON')}
                title="Run cash dep refund automation.">
                GUEST REFUND
              </button>
            </div>
          )}

          {visibilityArray[3] && (
            <div className="btn-group">
              <button className="btn btn-indigo" onClick={() => injectScript('scripts/scrapeDetails.js')}
                title="scrape guest details and save in local storage"
              >
                Copy Guest Info
              </button>
              <button
                className="btn btn-teal"
                onClick={() => injectScript('scripts/fillDetails.js')}
                title="fill in guest details from the local storage">
                Fill Guest Info
              </button>
            </div>
          )}



          <button className='btn-dark' onClick={() => setShowMain(false)}
            title="Click to open and configure dnr watchlist">
            DNR/WatchList controls
          </button>


          {/* <button className="btn-gray" onClick={() => injectScript('scripts/getFollowups.js')}>
            Get Stayovers
          </button> */}

          {/* <button className="btn-dark" onClick={viewCache}>
            View Cached Data
          </button> */}

          {/* <textarea
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
          </button> */}
        </>
      ) : (
        <Dnrcontrols goHome={() => setShowMain(true)} />
      )
      }

      <span className="absolute bottom-1 right-2 text-xs text-gray-400 select-none pointer-events-none">
        by Parth
      </span>
    </div >
  );


};

export default Popup;

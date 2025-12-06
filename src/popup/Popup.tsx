import React, { useState } from 'react';
import './Popup.css'
import Dnrcontrols from '../Dnrcontrols/Dnrcontrols';
import EditableDeposits from '../EditableDeposits/EditableDeposits';


const Popup: React.FC = () => {
  const [showMain, setShowMain] = useState(true);

  const injectScript = (fileName: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id!;
      chrome.scripting.executeScript({ target: { tabId }, files: [fileName] }, () => {
      });
    });
  };

  const sendMessage = (action: string) => chrome.runtime.sendMessage({ action });


  // const [logs, setLogs] = useState<string>('');
  // const log = (msg: string) => setLogs(prev => prev + msg + '\n');

  // async function viewCache() {
  //   const get = (action: string) =>
  //     new Promise((resolve) => {
  //       chrome.runtime.sendMessage({ action }, (res) => {
  //         resolve(res || null);
  //       });
  //     });

  //   const [
  //     guestInfo,
  //     arrivals,
  //     departures,
  //     stayovers,
  //     matches
  //   ] = await Promise.all([
  //     get("get_guest_info"),
  //     get("get_arrivals_cache"),
  //     get("get_departures_cache"),
  //     get("get_stayovers_cache"),
  //     get("get_matches_cache")
  //   ]);

  //   log("All caches fetched.");

  //   const data = {
  //     guestInfo,
  //     arrivals,
  //     departures,
  //     stayovers,
  //     matches
  //   };

  //   log("GuestInfo: " + JSON.stringify(data.guestInfo, null, 2));   // final combined output
  //   log("Arrivals: " + JSON.stringify(data.arrivals, null, 2));   // final combined output
  //   log("Departures: " + JSON.stringify(data.departures, null, 2));   // final combined output
  //   log("Stayovers: " + JSON.stringify(data.stayovers, null, 2));   // final combined output
  //   log("Watch List Matches: " + JSON.stringify(data.matches, null, 2));   // final combined output

  //   return data;
  // }


  return (
    <div className="panel">

      {showMain ? (
        <>
          <div className='btn-group flex items-center gap-2'>
            <h3 className="title flex-grow flex-shrink truncate">
              Choice Advantage Additions
            </h3>
            <button
              className='mb-4 btn-blue rounded-full  text-lg flex items-center justify-center'
              onClick={() => chrome.runtime.openOptionsPage()}
              title='Settings'
            >
              ⚙
            </button>
          </div>



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

          <EditableDeposits sendMessage={(action) => chrome.runtime.sendMessage({ action })} />
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
      )}
    </div>
  );


};

export default Popup;

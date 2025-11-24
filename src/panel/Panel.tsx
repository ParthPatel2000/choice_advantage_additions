import  { useEffect, useState } from "react";

export type Match = {
  first_name: string;
  last_name: string;
  reason?: string;
};

const Panel = () => {
  const [notifications, setNotifications] = useState<Match[]>([]);

  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.type === "NEW_DNR_ALERT") {
        setNotifications((prev) => [msg.payload, ...prev]);
      }
    };
    chrome.runtime.onMessage.addListener(listener);

    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return (
    <div className="w-full h-full p-4 bg-gray-100 overflow-y-auto">
      {notifications.map((match, i) => (
        <div
          key={i}
          className="bg-red-500 text-white p-3 rounded shadow mb-2 animate-slideIn"
        >
          🚨 DNR Alert: {match.first_name} {match.last_name} ({match.reason || "NA"})
        </div>
      ))}
    </div>
  );
};

export default Panel;

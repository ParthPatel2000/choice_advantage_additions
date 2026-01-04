// (()=>{
//     console.log(document.querySelectorAll("#mainContent_EliteStatus"))
//     const firstName = document.querySelector("#guestFirstName")
//     console.log(firstName.value)
//     const lastName = document.querySelector("#guestLastName")
//     console.log(lastName.value)
// })()

// identifier for Guest Info page => #mainContent_EliteStatus

// Normalize names (trim + uppercase)
function normalize(str) {
  return (str || "").trim().toUpperCase();
}

function generateKey(last_name, first_name) {
  const key = `${normalize(last_name)}|${normalize(first_name)}`;
  return key
}

(function () {
    if (document.querySelector("#Guest_Info_Body")) {
        console.log("Guest Info Page")
        console.log(document.querySelectorAll("#Guest_Info_Body"))
        const firstName = document.querySelector("#guestFirstName")
        console.log(firstName.value)
        const lastName = document.querySelector("#guestLastName")
        console.log(lastName.value)

        chrome.storage.local.get("watchlistIndex").then(
            (res) =>{
                if(!res?.watchlistIndex) return;
                
            }
        )
    }
})()

// // 1️⃣ Get the account number from the URL
// const urlParams = new URLSearchParams(window.location.search);
// const accountNumber = urlParams.get("accountNumber");

// // 2️⃣ Extract guest name from <h3 class="CHI_Title">Reservation Information:</h3>
// let guestName = null;
// const h3s = document.querySelectorAll('h3.CHI_Title');
// h3s.forEach(h3 => {
//   if (h3.textContent.includes("Reservation Information:")) {
//     // Extract the name after the colon
//     const nameText = h3.textContent.split("Reservation Information:")[1].trim();
//     if (nameText) guestName = nameText;
//   }
// });
 
// // 3️⃣ Ask background for matches cache
// chrome.runtime.sendMessage({ action: "get_matches_cache" }, (matches) => {
//   if (!matches || !matches.length) return;

//   // 4️⃣ Check account number
//   if (accountNumber) {
//     const matchByAccount = matches.find(m => m.reservationNumber === accountNumber);
//     if (matchByAccount) {
//       console.log(`⚠ WATCH LIST MEMBER FOUND (by account): ${matchByAccount.first_name} ${matchByAccount.last_name} → ${matchByAccount.reason}`);
//       chrome.runtime.sendMessage({ type: "WATCH_LIST_MEMBER_FOUND", list: matchByAccount.list, level: matchByAccount.level, reason:matchByAccount.reason });
//     }
//   }

//   // 5️⃣ Check guest name
//   if (guestName) {
//     const [firstName, lastName] = guestName.split(" ");
//     const matchByName = matches.find(m =>
//       m.first_name.toLowerCase() === (firstName || "").toLowerCase() &&
//       m.last_name.toLowerCase() === (lastName || "").toLowerCase()
//     );
//     console.log(`⚠ WATCH LIST MEMBER FOUND (by name): ${matchByName.first_name} ${matchByName.last_name} → ${matchByName.reason}`);
//     chrome.runtime.sendMessage({ type: "WATCH_LIST_MEMBER_FOUND", list: matchByName.list, level: matchByName.level, reason: matchByName.reason });
//   }
// });

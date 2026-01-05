(function () {
    // chrome.storage.local.set({ "cashDepBotWorkflow": false }) important to have a flag to run the bot
    console.log("workflow running...")

    chrome.storage.local.get("refundBotWorkflow").then((res) => {
        if (!res?.refundBotWorkflow) {
            stopBot()
            return;
        }

        function stopBot() {
            chrome.storage.local.set({ "refundBotWorkflow": false })
        }

        function waitForElement(selector, callback, timeout = 10000) {
            const start = Date.now();
            const interval = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(interval);
                    callback(el);
                } else if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    console.warn("Timed out waiting for", selector);
                }
            }, 200);
        }

        function fillInput(inputEl, value) {
            if (!inputEl) return false;
            inputEl.value = value;
            inputEl.dispatchEvent(new Event("input", { bubbles: true }));
            inputEl.dispatchEvent(new Event("change", { bubbles: true }));
            inputEl.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: value[0] || "0" })); // keyup
            return true;
        }

        function uncheckAutoView(box) {
            // const box = document.querySelector('input[name="autoViewSelect"]');
            if (!box) return false;

            if (box.checked) {
                box.checked = false;
                box.dispatchEvent(new Event("click", { bubbles: true }));
                console.log("autoViewSelect unchecked");
            }
            return true;
        }




        if (document.title === "Reservation Information") {

            waitForElement('#guestFolioEnabled', (folioLink) => {
                folioLink.click();
            });
        }

        if (document.title === "Guest Folio") {
            function hasParenthesesBalance(folio) {
                // If "(xx.xx)" exists → NO deposit
                return /\([\d,\.]+\)/.test(folio.textContent);
            }

            function clickPostCharge() {
                waitForElement('a', () => {
                    const btn = Array.from(document.querySelectorAll('a'))
                        .find(a => a.textContent.trim() === "Post Charge");
                    btn.click()
                })
            }

            function getFolioBalance(folio) {
                if (!folio) return null;
                const match = folio.textContent.match(/\(([\d,.]+)\)/);
                if (match) return parseFloat(match[1].replace(/,/g, ""));
                return 0;
            }

            function sendBalanceToBackground(balance) {
                chrome.runtime.sendMessage({
                    type: "CASH_DEP_FOLIO_BALANCE",
                    payload: {
                        balance: balance
                    }
                }, () => {
                    console.log("💌 Sent folio balance to background:", balance);
                });
            }

            function handleFolio() {
                waitForElement('a.CHI_Link.CHI_OnlyLink', () => {
                    const cashDepFolio = Array.from(document.querySelectorAll('a.CHI_Link.CHI_OnlyLink'))
                        .find(a => /cash\s*dep/i.test(a.textContent.trim())) || null;

                    if (!cashDepFolio) {
                        stopBot()
                    }
                    if (cashDepFolio) {

                        if (hasParenthesesBalance(cashDepFolio)) {
                            cashDepFolio.click();
                            sendBalanceToBackground(getFolioBalance(cashDepFolio));
                            clickPostCharge();
                        }
                        else {
                            stopBot()
                            console.log("No balance left, exiting...")
                        }
                    }

                })
            }
            handleFolio()
        }

        if (document.title === "Transaction Detail") {
            waitForElement('select[name="transactionCode"]', async (select) => {
                select.value = "GR";
                select.dispatchEvent(new Event("change", { bubbles: true }));


                waitForElement('input[name="amount"]', (inputEl) => {
                    const amount = inputEl.getAttribute("value").replace("-", "");
                    fillInput(inputEl, amount);
                    waitForElement('input[name="autoViewSelect"]', (autoViewSelectBox) => {
                        uncheckAutoView(autoViewSelectBox);
                        waitForElement('#saveButton', (saveBtn) => {
                            stopBot()
                            saveBtn.click()
                        })
                    })
                })

            })
        }
    })
})()
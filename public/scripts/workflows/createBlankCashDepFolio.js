(function () {
    // chrome.storage.local.set({ "cashDepBotWorkflow": false }) important to have a flag to run the bot

    chrome.storage.local.get("createFolioWorkflow").then((res) => {
        if (!res?.createFolioWorkflow) {
            stopBot()
            return;
        }

        function stopBot() {
            chrome.storage.local.set({ "createFolioWorkflow": false })
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

        function checkCheckbox(checkboxEl) {
            if (!checkboxEl) return false;
            if (!checkboxEl.checked) {
                checkboxEl.checked = true;
                checkboxEl.dispatchEvent(new Event("change", { bubbles: true }));
            }
            return true;
        }


        console.log("Blank Cash Dep folio workflow running...")

        if (document.title === "Reservation Information") {

            waitForElement('#guestFolioEnabled', (folioLink) => {
                folioLink.click();
            });
        }

        if (document.title === "Guest Folio") {
            function AddFolio() {
                waitForElement('a.CHI_Link.CHI_OnlyLink', () => {
                    const folioViewBtn = Array.from(document.querySelectorAll('a.CHI_Link.CHI_OnlyLink')).
                        find(a => a.textContent.trim() === "Add Folio View")
                    if (folioViewBtn) folioViewBtn.click();
                })
            }
            function hasParenthesesBalance(folio) {
                // If "(xx.xx)" exists → NO deposit
                return /\([\d,\.]+\)/.test(folio.textContent);
            }
            function clickPostPayment() {
                waitForElement('a[onclick*="GFpostPayment"]', (btn) => { btn.click() })
            }

            function handleFolio() {
                waitForElement('a.CHI_Link.CHI_OnlyLink', () => {
                    const cashDepFolio = Array.from(document.querySelectorAll('a.CHI_Link.CHI_OnlyLink'))
                        .find(a => /cash\s*dep/i.test(a.textContent.trim())) || null;
                    if (!cashDepFolio) {
                        AddFolio()
                    }
                    if (cashDepFolio) {

                        if (!hasParenthesesBalance(cashDepFolio)) {
                            cashDepFolio.click();
                            clickPostPayment();
                        }
                        else {
                            console.log("balance exists in cash dep folio, exiting...")
                            stopBot()
                        }
                    }

                })
            }
            handleFolio()
        }

        if (document.title === "Folio View Configuration") {
            waitForElement('input[name="folioViewConfiguration.viewName"]', (nameInput) => {
                fillInput(nameInput, "CASH DEP");
                waitForElement('input[name="folioViewConfiguration.transactionCodes"][value="MS"]', (msCheckbox) => {
                    checkCheckbox(msCheckbox);
                    waitForElement('a.CHI_Button#save', (saveBtn) => {
                        saveBtn.click();
                    })
                })
            })
        }

        if (document.title === "Transaction Detail") {
            waitForElement('select[name="transactionCode"]', async (select) => {
                select.value = "SD";
                select.dispatchEvent(new Event("change", { bubbles: true }));
                stopBot();
            })
        }
    })
})()
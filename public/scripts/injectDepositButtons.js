(function () {
    let showDepositBtns = true;
    // ----- inject CSS once -----
    if (!document.getElementById('deposit-style')) {
        const style = document.createElement('style');
        style.id = 'deposit-style';
        style.textContent = `
            .deposit-group {
                display: flex;
                gap: 3px;
                margin-bottom: 12px;
                flex-wrap: wrap;
                align-items: center;
            }

            .deposit-button {
                flex: 1;
                padding: 8px 0;
                border-radius: 2px;
                line-height: 12px;
                font-size: 12px;
                color: #ffffff;
                background-color: #0073e6;
                text-align: center;
                box-sizing: border-box;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
            }

            .deposit-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
            }

            .deposit-button--refund {
                background-color: #dc2626; /* red */
            }

            .deposit-button--refund:hover {
                background-color: #b91c1c;
            }
            `;
        document.head.appendChild(style);
    }

    function waitForElement(selector, callback, timeout = 200) {
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

    function hasParenthesesBalance(folio) {
        // If "(xx.xx)" exists → NO deposit
        return /\([\d,\.]+\)/.test(folio.textContent);
    }

    function showDepositButtons() {
        // waitForElement('a.CHI_Link.CHI_OnlyLink', () => {
        const cashDepFolio = Array.from(document.querySelectorAll('a.CHI_Link.CHI_OnlyLink'))
            .find(a => /cash\s*dep/i.test(a.textContent.trim())) || null;

        if (cashDepFolio && hasParenthesesBalance(cashDepFolio)) {
            showDepositBtns = false;
        }

        // })
    }
    showDepositButtons()

    chrome.storage.local.get("depositButtons").then((res) => {
        if (!res?.depositButtons) return;

        const [depValue1, depValue2] = res.depositButtons;
        const targetPanel = [...document.querySelectorAll('.CHI_Panel')]
            .find(panel =>
                panel.querySelector('.CHI_Title')?.textContent.trim() === 'Overview'
            );

        if (!targetPanel) return;

        console.log('injecting the deposit buttons to page');

        // ----- shallow clone panel shell -----
        const clone = targetPanel.cloneNode(false);

        // ----- build content -----
        const group = document.createElement('div');
        group.className = 'deposit-group';

        if (showDepositBtns) {
            const btn1 = document.createElement('button');
            btn1.className = 'deposit-button';
            btn1.textContent = `${depValue1} cash`;
            btn1.type = 'button';
            btn1.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Deposit A clicked');
                chrome.runtime.sendMessage({ action: "POST_DEPOSIT_SLT_0" })
            }
            );

            const btn2 = document.createElement('button');
            btn2.className = 'deposit-button';
            btn2.textContent = `${depValue2} cash`;
            btn2.type = 'button';
            btn2.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Deposit B clicked');
                chrome.runtime.sendMessage({ action: "POST_DEPOSIT_SLT_1" })
            });

            const btn3 = document.createElement('button');
            btn3.className = 'deposit-button';
            btn3.textContent = `other`;
            btn3.type = 'button';
            btn3.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Deposit C clicked');
                chrome.runtime.sendMessage({ action: "ADD_CASH_DEP_FOLIO" })
            });
            group.append(btn1, btn2, btn3);
        }
        else {
            const btn = document.createElement('button');
            btn.className = 'deposit-button deposit-button--refund';
            btn.textContent = `Guest Refund`;
            btn.type = 'button';
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Refund clicked');
                chrome.runtime.sendMessage({ action: "POST_GUEST_REFUND_BUTTON" })
            });
            group.append(btn);
        }


        clone.appendChild(group);

        // ----- insert after Overview panel -----
        targetPanel.after(clone);
    })
})();

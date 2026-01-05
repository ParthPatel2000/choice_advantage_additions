(function () {
    chrome.storage.local.get("depositButtons").then((res) => {
        if (!res?.depositButtons) return;

        const [depValue1, depValue2] = res.depositButtons;
        const targetPanel = [...document.querySelectorAll('.CHI_Panel')]
            .find(panel =>
                panel.querySelector('.CHI_Title')?.textContent.trim() === 'Overview'
            );

        if (!targetPanel) return;

        console.log('injecting the deposit buttons to page');

        // ----- inject CSS once -----
        if (!document.getElementById('deposit-style')) {
            const style = document.createElement('style');
            style.id = 'deposit-style';
            style.textContent = `
            .deposit-group {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
                flex-wrap: wrap;
                align-items: center;
            }

            .deposit-button {
                flex: 1;
                padding: 8px 0;
                border-radius: 12px;
                font-weight: 600;
                color: #ffffff;
                background-color: #2563eb;
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
            `;
            document.head.appendChild(style);
        }

        // ----- shallow clone panel shell -----
        const clone = targetPanel.cloneNode(false);

        // ----- build content -----
        const group = document.createElement('div');
        group.className = 'deposit-group';

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

        group.append(btn1, btn2);
        clone.appendChild(group);

        // ----- insert after Overview panel -----
        targetPanel.after(clone);
    })
})();

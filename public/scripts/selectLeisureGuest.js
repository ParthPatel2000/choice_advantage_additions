(function selectLeisureOnce() {
    const waitForSelects = setInterval(() => {
        // Primary selectors
        let marketSegment = document.querySelector('select[name="marketSegment"]');
        let trackingCode = document.querySelector('select[name="trackingCode"]');

        // Alternate selectors if primary not found
        if (!marketSegment) marketSegment = document.querySelector('select[name="reservation.marketSegment"]');
        if (!trackingCode) trackingCode = document.querySelector('select[name="reservation.trackingCodeId"]');

        if (marketSegment && trackingCode) {
            clearInterval(waitForSelects); // stop checking

            function simulateChange(select, value) {
                select.focus();
                select.value = value;
                select.dispatchEvent(new Event('input', { bubbles: true }));
                select.dispatchEvent(new Event('change', { bubbles: true }));
                select.blur();
            }

            // Leisure values
            simulateChange(marketSegment, 'LEIS');     // Leisure Guest
            simulateChange(trackingCode, '76847');     // Leisure

            console.log('Leisure options selected once.');
        }
    }, 200); // check every 200ms until found
})();

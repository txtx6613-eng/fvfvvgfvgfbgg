/**
 * VCC Generator — Frontend Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let selectedNetwork = 'visa';
    let generatedCards = [];

    // --- DOM Elements ---
    const els = {
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),
        networkBtns: document.querySelectorAll('.network-btn'),
        inputQuantity: document.getElementById('input-quantity'),
        qtyMinus: document.getElementById('qty-minus'),
        qtyPlus: document.getElementById('qty-plus'),
        inputBin: document.getElementById('input-bin'),
        togglePin: document.getElementById('toggle-pin'),
        pinOptions: document.getElementById('pin-options'),
        ebtOptions: document.getElementById('ebt-options'),
        btnGenerate: document.getElementById('btn-generate'),
        previewNumber: document.getElementById('preview-number'),
        previewExpiry: document.getElementById('preview-expiry'),
        previewNetwork: document.getElementById('preview-network'),
        resultsContainer: document.getElementById('results-container'),
        resultsList: document.getElementById('results-list'),
        resultCount: document.getElementById('result-count'),
        btnCopyAll: document.getElementById('btn-copy-all'),
        btnExportCsv: document.getElementById('btn-export-csv'),
        btnExportJson: document.getElementById('btn-export-json'),
        inputValidate: document.getElementById('input-validate'),
        btnValidate: document.getElementById('btn-validate'),
        validationResult: document.getElementById('validation-result'),
        validationIcon: document.getElementById('validation-icon'),
        validationDetails: document.getElementById('validation-details'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toast-message'),
    };

    // --- Network display names for the card preview ---
    const networkLabels = {
        visa: 'VISA',
        mastercard: 'MC',
        amex: 'AMEX',
        discover: 'DISCOVER',
        jcb: 'JCB',
        diners: 'DINERS',
        unionpay: 'UNIONPAY',
        mir: 'MIR',
        maestro: 'MAESTRO',
        ebt: 'EBT',
        custom_491212: 'CUSTOM',
    };

    // --- Card gradient themes ---
    const cardGradients = {
        visa: 'linear-gradient(135deg, #1a1a3e, #2d1b69, #1e3a5f)',
        mastercard: 'linear-gradient(135deg, #2d1b1b, #692d1b, #3f1e1e)',
        amex: 'linear-gradient(135deg, #0a2a4a, #1b4d69, #0a3a5a)',
        discover: 'linear-gradient(135deg, #3a2a0a, #694d1b, #4a3a1e)',
        jcb: 'linear-gradient(135deg, #0a1a3a, #1b2d69, #0a2a4a)',
        diners: 'linear-gradient(135deg, #1a0a3a, #2d1b69, #1e0a4a)',
        unionpay: 'linear-gradient(135deg, #3a0a1a, #691b2d, #4a0a1e)',
        mir: 'linear-gradient(135deg, #0a3a1a, #1b692d, #1e4a0a)',
        maestro: 'linear-gradient(135deg, #0a2a3a, #1b4d69, #3a1e0a)',
        ebt: 'linear-gradient(135deg, #1b2631, #2980b9, #154360)',
        custom_491212: 'linear-gradient(135deg, #4a235a, #8e44ad, #5b2c6f)',
    };

    // =========================================
    //  Tab Navigation
    // =========================================
    els.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            els.tabs.forEach(t => t.classList.remove('active'));
            els.tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`panel-${target}`).classList.add('active');
        });
    });

    // =========================================
    //  Network Selection
    // =========================================
    els.networkBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            els.networkBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedNetwork = btn.dataset.network;
            
            if (els.ebtOptions) {
                els.ebtOptions.style.display = selectedNetwork === 'ebt' ? 'block' : 'none';
            }
            
            updateCardPreview();
        });
    });

    function updateCardPreview(card = null) {
        const cardFront = document.querySelector('.card-front');
        cardFront.style.background = cardGradients[selectedNetwork] || cardGradients.visa;
        els.previewNetwork.textContent = networkLabels[selectedNetwork] || selectedNetwork.toUpperCase();

        if (card) {
            els.previewNumber.textContent = card.formatted_number;
            els.previewExpiry.textContent = card.expiry.formatted;
            document.getElementById('preview-holder').textContent = card.holder_name.toUpperCase();
        } else {
            els.previewNumber.textContent = '•••• •••• •••• ••••';
            els.previewExpiry.textContent = 'MM/YY';
            document.getElementById('preview-holder').textContent = 'YOUR NAME';
        }
    }

    // =========================================
    //  Quantity Controls
    // =========================================
    els.qtyMinus.addEventListener('click', () => {
        const val = parseInt(els.inputQuantity.value) || 1;
        els.inputQuantity.value = Math.max(1, val - 1);
    });

    els.qtyPlus.addEventListener('click', () => {
        const val = parseInt(els.inputQuantity.value) || 1;
        els.inputQuantity.value = val + 1;
    });

    els.inputQuantity.addEventListener('change', () => {
        let val = parseInt(els.inputQuantity.value) || 1;
        val = Math.max(1, val);
        els.inputQuantity.value = val;
    });

    // =========================================
    //  PIN Toggle
    // =========================================
    els.togglePin.addEventListener('change', () => {
        els.pinOptions.style.display = els.togglePin.checked ? 'block' : 'none';
    });

    // =========================================
    //  BIN Input — digits only
    // =========================================
    els.inputBin.addEventListener('input', () => {
        els.inputBin.value = els.inputBin.value.replace(/\D/g, '').slice(0, 10);
    });

    // =========================================
    //  Generate Cards
    // =========================================
    els.btnGenerate.addEventListener('click', generateCards);

    async function generateCards() {
        const btn = els.btnGenerate;
        btn.classList.add('loading');
        btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Generating...`;

        const pinLengthEl = document.querySelector('input[name="pin_length"]:checked');
        const ebtLengthEl = document.querySelector('input[name="ebt_length"]:checked');

        const payload = {
            network: selectedNetwork,
            count: parseInt(els.inputQuantity.value) || 1,
            custom_bin: els.inputBin.value.trim(),
            include_pin: els.togglePin.checked,
            pin_length: pinLengthEl ? parseInt(pinLengthEl.value) : 4,
            ebt_length: ebtLengthEl ? parseInt(ebtLengthEl.value) : 19,
        };

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || 'Generation failed', true);
                return;
            }

            generatedCards = data.cards;
            renderResults(data.cards);

            // Update card preview with the first card
            if (data.cards.length > 0) {
                updateCardPreview(data.cards[0]);
            }
        } catch (err) {
            showToast('Network error. Is the server running?', true);
        } finally {
            btn.classList.remove('loading');
            btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Generate Cards`;
        }
    }

    // =========================================
    //  Render Results
    // =========================================
    function renderResults(cards) {
        els.resultsContainer.style.display = 'block';
        els.resultCount.textContent = `${cards.length} card${cards.length > 1 ? 's' : ''}`;
        
        // Optimize rendering by using a DocumentFragment and limiting DOM nodes
        const fragment = document.createDocumentFragment();
        const displayLimit = 500;
        const cardsToRender = cards.slice(0, displayLimit);

        cardsToRender.forEach((card, index) => {
            const item = document.createElement('div');
            item.className = 'card-result';
            
            // Disable animation for bulk generations to improve performance
            if (cards.length < 50) {
                item.style.animationDelay = `${index * 0.03}s`;
            } else {
                item.style.animation = 'none';
                item.style.opacity = '1';
                item.style.transform = 'none';
            }

            const networkKey = card.network_key || selectedNetwork;
            const badgeClass = `badge-${networkKey}`;

            let metaHtml = `
                <span class="meta-item">
                    <span class="meta-label">NAME</span>
                    <span class="meta-value">${card.holder_name}</span>
                </span>
                <span class="meta-item">
                    <span class="meta-label">BAL</span>
                    <span class="meta-value" style="color: var(--success);">${card.formatted_balance}</span>
                </span>
                <span class="meta-item">
                    <span class="meta-label">EXP</span>
                    <span class="meta-value">${card.expiry.formatted}</span>
                </span>
                <span class="meta-item">
                    <span class="meta-label">CVV</span>
                    <span class="meta-value">${card.cvv}</span>
                </span>
                <span class="meta-item" style="width: 100%; margin-top: 0.2rem;">
                    <span class="meta-label">TRACK 2</span>
                    <span class="meta-value" style="font-size: 0.75rem; color: var(--accent-2);">${card.track2}</span>
                </span>
            `;

            if (card.pin) {
                metaHtml += `
                    <span class="meta-item">
                        <span class="meta-label">PIN</span>
                        <span class="meta-value">${card.pin}</span>
                    </span>
                `;
            }

            item.innerHTML = `
                <div class="card-result-info">
                    <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                        <span class="card-result-number">${card.formatted_number}</span>
                        <span class="card-result-badge ${badgeClass}">${card.network}</span>
                    </div>
                    <div class="card-result-meta">${metaHtml}</div>
                </div>
                <div class="card-result-actions">
                    <button class="btn-copy" data-card-index="${index}" title="Copy card details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                </div>
            `;

            // Copy single card
            const copyBtn = item.querySelector('.btn-copy');
            copyBtn.addEventListener('click', () => {
                const text = formatCardForCopy(card);
                copyToClipboard(text);
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
                }, 2000);
            });

            fragment.appendChild(item);
        });

        els.resultsList.innerHTML = '';
        els.resultsList.appendChild(fragment);
        
        if (cards.length > displayLimit) {
            const notice = document.createElement('div');
            notice.style.padding = '1rem';
            notice.style.textAlign = 'center';
            notice.style.color = 'var(--text-muted)';
            notice.style.fontSize = '0.85rem';
            notice.textContent = `Showing first ${displayLimit} results to prevent lag. Use Export (CSV/JSON/Copy All) to get all ${cards.length} cards.`;
            els.resultsList.appendChild(notice);
        }

        // Scroll results into view
        els.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function formatCardForCopy(card) {
        let text = `${card.number} | ${card.expiry.formatted} | ${card.cvv} | ${card.holder_name} | ${card.formatted_balance} | ${card.track2}`;
        if (card.pin) text += ` | PIN: ${card.pin}`;
        return text;
    }

    // =========================================
    //  Copy All
    // =========================================
    els.btnCopyAll.addEventListener('click', () => {
        if (generatedCards.length === 0) return;
        const lines = generatedCards.map(formatCardForCopy);
        copyToClipboard(lines.join('\n'));
    });

    // =========================================
    //  Export CSV
    // =========================================
    els.btnExportCsv.addEventListener('click', () => {
        if (generatedCards.length === 0) return;
        const hasPin = generatedCards.some(c => c.pin);
        let header = 'Network,Name,Number,Expiry,CVV,Balance,Track2';
        if (hasPin) header += ',PIN';
        header += '\n';

        const rows = generatedCards.map(c => {
            let row = `${c.network},"${c.holder_name}",${c.number},${c.expiry.formatted},${c.cvv},"${c.formatted_balance}","${c.track2}"`;
            if (hasPin) row += `,${c.pin || ''}`;
            return row;
        });

        downloadFile('cards.csv', header + rows.join('\n'), 'text/csv');
        showToast('CSV file downloaded');
    });

    // =========================================
    //  Export JSON
    // =========================================
    els.btnExportJson.addEventListener('click', () => {
        if (generatedCards.length === 0) return;
        const json = JSON.stringify(generatedCards, null, 2);
        downloadFile('cards.json', json, 'application/json');
        showToast('JSON file downloaded');
    });

    // =========================================
    //  Validate Card
    // =========================================
    els.btnValidate.addEventListener('click', validateCard);
    els.inputValidate.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') validateCard();
    });

    async function validateCard() {
        const number = els.inputValidate.value.trim();
        if (!number) {
            showToast('Please enter a card number', true);
            return;
        }

        try {
            const res = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || 'Validation failed', true);
                return;
            }

            showValidationResult(data);
        } catch (err) {
            showToast('Network error. Is the server running?', true);
        }
    }

    function showValidationResult(data) {
        const result = els.validationResult;
        result.style.display = 'flex';
        result.className = `validation-result ${data.valid ? 'valid' : 'invalid'}`;

        els.validationIcon.textContent = data.valid ? '✅' : '❌';

        if (data.valid) {
            let networkInfo = data.network
                ? `<p>Detected network: <span class="detected-network">${data.network}</span></p>`
                : '<p>Network could not be determined.</p>';
            els.validationDetails.innerHTML = `
                <h3>Valid Card Number</h3>
                <p>This number passes the Luhn algorithm check.</p>
                ${networkInfo}
                <p style="margin-top:0.3rem; font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary);">${data.formatted}</p>
            `;
        } else {
            els.validationDetails.innerHTML = `
                <h3>Invalid Card Number</h3>
                <p>This number does not pass the Luhn algorithm validation.</p>
            `;
        }
    }

    // =========================================
    //  Utilities
    // =========================================
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Copied to clipboard');
        });
    }

    function downloadFile(filename, content, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    let toastTimeout;
    function showToast(message, isError = false) {
        clearTimeout(toastTimeout);
        els.toastMessage.textContent = message;
        els.toast.querySelector('.toast-icon').textContent = isError ? '✕' : '✓';
        els.toast.querySelector('.toast-icon').style.color = isError ? 'var(--error)' : 'var(--success)';
        els.toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            els.toast.classList.remove('show');
        }, 2500);
    }

    // --- Add spin animation for loading ---
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
    `;
    document.head.appendChild(style);

    // --- Initialize ---
    updateCardPreview();
});

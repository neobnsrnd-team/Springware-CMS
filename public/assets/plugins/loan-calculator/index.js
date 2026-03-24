
/*
Usage:
<div data-cb-type="loan-calculator">
    <div class="lc-tabs">
        <button class="lc-tab active" data-type="loan">대출</button>
        <button class="lc-tab" data-type="deposit">예금</button>
        <button class="lc-tab" data-type="savings">적금</button>
    </div>
    <div class="lc-body">
        <div class="lc-panel" data-type="loan">
            <div class="lc-field">
                <label class="lc-label">대출금액</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="principal" value="10000" min="100" max="500000" step="100"/>
                    <span class="lc-unit">만원</span>
                </div>
                <input type="range" class="lc-range" data-key="principal" min="100" max="500000" step="100" value="10000"/>
                <div class="lc-range-labels"><span>100만원</span><span>50억원</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">금리 (연)</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="decimal" class="lc-input" data-key="rate" value="5.0" min="0.1" max="30" step="0.1"/>
                    <span class="lc-unit">%</span>
                </div>
                <input type="range" class="lc-range" data-key="rate" min="0.1" max="30" step="0.1" value="5.0"/>
                <div class="lc-range-labels"><span>0.1%</span><span>30%</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">대출기간</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="period" value="12" min="1" max="360" step="1"/>
                    <span class="lc-unit">개월</span>
                </div>
                <input type="range" class="lc-range" data-key="period" min="1" max="360" step="1" value="12"/>
                <div class="lc-range-labels"><span>1개월</span><span>30년</span></div>
            </div>
        </div>
        <div class="lc-panel" data-type="deposit" style="display:none">
            <div class="lc-field">
                <label class="lc-label">예치금액</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="principal" value="1000" min="10" max="1000000" step="10"/>
                    <span class="lc-unit">만원</span>
                </div>
                <input type="range" class="lc-range" data-key="principal" min="10" max="1000000" step="10" value="1000"/>
                <div class="lc-range-labels"><span>10만원</span><span>100억원</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">금리 (연)</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="decimal" class="lc-input" data-key="rate" value="3.5" min="0.1" max="20" step="0.1"/>
                    <span class="lc-unit">%</span>
                </div>
                <input type="range" class="lc-range" data-key="rate" min="0.1" max="20" step="0.1" value="3.5"/>
                <div class="lc-range-labels"><span>0.1%</span><span>20%</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">예치기간</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="period" value="12" min="1" max="60" step="1"/>
                    <span class="lc-unit">개월</span>
                </div>
                <input type="range" class="lc-range" data-key="period" min="1" max="60" step="1" value="12"/>
                <div class="lc-range-labels"><span>1개월</span><span>60개월</span></div>
            </div>
        </div>
        <div class="lc-panel" data-type="savings" style="display:none">
            <div class="lc-field">
                <label class="lc-label">월 납입금액</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="monthly" value="100" min="1" max="10000" step="1"/>
                    <span class="lc-unit">만원</span>
                </div>
                <input type="range" class="lc-range" data-key="monthly" min="1" max="10000" step="1" value="100"/>
                <div class="lc-range-labels"><span>1만원</span><span>1억원</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">금리 (연)</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="decimal" class="lc-input" data-key="rate" value="4.0" min="0.1" max="20" step="0.1"/>
                    <span class="lc-unit">%</span>
                </div>
                <input type="range" class="lc-range" data-key="rate" min="0.1" max="20" step="0.1" value="4.0"/>
                <div class="lc-range-labels"><span>0.1%</span><span>20%</span></div>
            </div>
            <div class="lc-field">
                <label class="lc-label">적금기간</label>
                <div class="lc-input-wrap">
                    <input type="number" inputmode="numeric" class="lc-input" data-key="period" value="24" min="1" max="60" step="1"/>
                    <span class="lc-unit">개월</span>
                </div>
                <input type="range" class="lc-range" data-key="period" min="1" max="60" step="1" value="24"/>
                <div class="lc-range-labels"><span>1개월</span><span>60개월</span></div>
            </div>
        </div>
        <div class="lc-result">
            <div class="lc-result-item">
                <span class="lc-result-label lc-label-monthly">월 납입금</span>
                <span class="lc-result-value lc-val-monthly">0원</span>
            </div>
            <div class="lc-result-item">
                <span class="lc-result-label lc-label-interest">총 이자</span>
                <span class="lc-result-value lc-val-interest">0원</span>
            </div>
            <div class="lc-result-item lc-result-total">
                <span class="lc-result-label lc-label-total">총 상환금액</span>
                <span class="lc-result-value lc-val-total">0원</span>
            </div>
        </div>
        <a href="#" class="lc-apply-btn">상담 신청하기</a>
    </div>
</div>
*/

export default {
    name: 'loan-calculator',
    displayName: '금융 계산기',
    version: '1.0.0',

    settings: {
        defaultType: {
            type: 'select',
            label: '기본 탭',
            options: [
                { value: 'loan', label: '대출' },
                { value: 'deposit', label: '예금' },
                { value: 'savings', label: '적금' }
            ],
            default: 'loan'
        },
        showApplyBtn: {
            type: 'boolean',
            label: '상담 신청 버튼 표시',
            default: true
        },
        applyUrl: {
            type: 'text',
            label: '상담 신청 URL',
            default: '#'
        },
        applyBtnLabel: {
            type: 'text',
            label: '상담 신청 버튼 텍스트',
            default: '상담 신청하기'
        },
        accentColor: {
            type: 'color',
            label: '강조 색상',
            default: '#0046A4'
        }
    },

    editor: {
        openContentEditor: function(element, builder, onChange) {
            const container = document.createElement('div');
            container.style.marginBottom = '23px';

            const note = document.createElement('div');
            note.style.cssText = 'background:#FFF3EC;border-radius:8px;padding:12px;font-size:13px;color:#FF6600;line-height:1.5;';
            note.innerHTML = '<strong>계산기 안내</strong><br>슬라이더와 숫자 입력으로 실시간 계산됩니다.<br>상담 신청 버튼 URL은 설정 패널에서 변경하세요.';
            container.appendChild(note);

            return container;
        }
    },

    mount: function(element, options) {
        const accent = element.getAttribute('data-cb-accent-color') || element.dataset.lcAccent || element.style.getPropertyValue('--lc-accent').trim() || '#0046A4';
        element.style.setProperty('--lc-accent', accent);

        // Tab switching
        const tabs = element.querySelectorAll('.lc-tab');
        const panels = element.querySelectorAll('.lc-panel');
        let currentType = options.defaultType || 'loan';

        const switchTab = (type) => {
            currentType = type;
            tabs.forEach(t => t.classList.toggle('active', t.dataset.type === type));
            panels.forEach(p => p.style.display = p.dataset.type === type ? 'block' : 'none');
            calculate();
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.type));
        });

        // Apply button
        const applyBtn = element.querySelector('.lc-apply-btn');
        if (applyBtn) {
            applyBtn.style.display = options.showApplyBtn !== false ? 'flex' : 'none';
            if (options.applyUrl) applyBtn.setAttribute('href', options.applyUrl);
            if (options.applyBtnLabel) applyBtn.textContent = options.applyBtnLabel;
            applyBtn.addEventListener('click', (e) => {
                const href = applyBtn.getAttribute('href');
                if (!href || href === '#') e.preventDefault();
            });
        }

        const formatWon = (n) => {
            if (!isFinite(n) || isNaN(n)) return '계산 불가';
            if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억원`;
            if (n >= 10000) return `${Math.round(n / 10000).toLocaleString()}만원`;
            return `${Math.round(n).toLocaleString()}원`;
        };

        // debounce 유틸
        const debounce = (fn, ms) => {
            let timer;
            return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
        };

        // Calculate
        const calculate = () => {
            const panel = element.querySelector(`.lc-panel[data-type="${currentType}"]`);
            if (!panel) return;

            const getVal = (key) => parseFloat(panel.querySelector(`[data-key="${key}"]`)?.value) || 0;

            const monthly = element.querySelector('.lc-val-monthly');
            const interest = element.querySelector('.lc-val-interest');
            const total = element.querySelector('.lc-val-total');
            const lblMonthly = element.querySelector('.lc-label-monthly');
            const lblTotal = element.querySelector('.lc-label-total');

            if (currentType === 'loan') {
                if (lblMonthly) lblMonthly.textContent = '월 납입금';
                if (lblTotal) lblTotal.textContent = '총 상환금액';
                const P = getVal('principal') * 10000;
                const r = getVal('rate') / 100 / 12;
                const n = getVal('period');
                if (P <= 0 || n <= 0) return;
                let monthlyAmt = 0;
                if (r === 0) { monthlyAmt = P / n; }
                else { monthlyAmt = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1); }
                const totalAmt = monthlyAmt * n;
                const interestAmt = totalAmt - P;
                if (monthly) monthly.textContent = formatWon(monthlyAmt);
                if (interest) interest.textContent = formatWon(interestAmt);
                if (total) total.textContent = formatWon(totalAmt);
            } else if (currentType === 'deposit') {
                if (lblMonthly) lblMonthly.textContent = '세전 이자';
                if (lblTotal) lblTotal.textContent = '만기 수령액';
                const P = getVal('principal') * 10000;
                const r = getVal('rate') / 100;
                const n = getVal('period') / 12;
                if (P <= 0 || n <= 0) return;
                const interestAmt = P * r * n;
                const totalAmt = P + interestAmt;
                if (monthly) monthly.textContent = formatWon(interestAmt);
                if (interest) interest.textContent = formatWon(interestAmt * 0.846); // after 15.4% tax
                if (total) total.textContent = formatWon(totalAmt - interestAmt * 0.154);
            } else if (currentType === 'savings') {
                if (lblMonthly) lblMonthly.textContent = '총 납입원금';
                if (lblTotal) lblTotal.textContent = '만기 수령액';
                const m = getVal('monthly') * 10000;
                const r = getVal('rate') / 100 / 12;
                const n = getVal('period');
                if (m <= 0 || n <= 0) return;
                const principal = m * n;
                let totalAmt = 0;
                if (r === 0) { totalAmt = principal; }
                else { totalAmt = m * (Math.pow(1 + r, n) - 1) / r * (1 + r); }
                const interestAmt = totalAmt - principal;
                if (monthly) monthly.textContent = formatWon(principal);
                if (interest) interest.textContent = formatWon(interestAmt);
                if (total) total.textContent = formatWon(totalAmt - interestAmt * 0.154);
            }
        };

        // Sync range <-> number input within each panel
        const debouncedCalculate = debounce(calculate, 300);

        panels.forEach(panel => {
            const syncPair = (inputEl, rangeEl) => {
                if (!inputEl || !rangeEl) return;

                // number input: debounce로 타이핑 중 깜빡임 방지
                inputEl.addEventListener('input', () => {
                    // 빈 값이면 계산하지 않고 대기
                    if (inputEl.value === '' || inputEl.value === '-') return;
                    rangeEl.value = inputEl.value;
                    debouncedCalculate();
                });

                // blur 시 min/max 클램핑 + 빈 값 복원
                inputEl.addEventListener('blur', () => {
                    const v = parseFloat(inputEl.value);
                    const min = parseFloat(inputEl.min);
                    const max = parseFloat(inputEl.max);
                    if (isNaN(v) || inputEl.value === '') {
                        inputEl.value = inputEl.defaultValue;
                    } else {
                        inputEl.value = Math.min(Math.max(v, min), max);
                    }
                    rangeEl.value = inputEl.value;
                    calculate();
                });

                // Enter 키로 즉시 확정
                inputEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        inputEl.blur();
                    }
                });

                // range 슬라이더: 즉시 반영 (debounce 불필요)
                rangeEl.addEventListener('input', () => {
                    inputEl.value = rangeEl.value;
                    calculate();
                });
            };

            ['principal', 'rate', 'period', 'monthly'].forEach(key => {
                syncPair(
                    panel.querySelector(`.lc-input[data-key="${key}"]`),
                    panel.querySelector(`.lc-range[data-key="${key}"]`)
                );
            });
        });

        // Init
        switchTab(currentType);

        return {};
    },

    unmount: function(element, instance) {
    }
};

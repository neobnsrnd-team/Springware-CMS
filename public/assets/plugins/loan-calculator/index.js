// public/assets/plugins/loan-calculator/index.js

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
        <a href="#" class="lc-apply-btn">신청</a>
    </div>
</div>
*/

export default {
    name: 'loan-calculator',
    displayName: '금융 계산기',
    version: '1.1.0',

    settings: {
        // ── 기본 탭 ──────────────────────────────────────────────
        defaultType: {
            type: 'select',
            label: '기본 탭',
            options: [
                { value: 'loan', label: '대출' },
                { value: 'deposit', label: '예금' },
                { value: 'savings', label: '적금' },
            ],
            default: 'loan',
        },

        // ── 탭 노출 여부 ─────────────────────────────────────────
        showLoanTab: {
            type: 'boolean',
            label: '[대출] 탭 표시',
            default: true,
        },
        showDepositTab: {
            type: 'boolean',
            label: '[예금] 탭 표시',
            default: true,
        },
        showSavingsTab: {
            type: 'boolean',
            label: '[적금] 탭 표시',
            default: true,
        },

        // ── 신청 버튼 ────────────────────────────────────────────
        showApplyBtn: {
            type: 'boolean',
            label: '신청 버튼 표시',
            default: true,
        },
        applyUrl: {
            type: 'text',
            label: '신청 버튼 URL',
            default: '#',
        },
        applyBtnLabel: {
            type: 'text',
            label: '신청 버튼 텍스트',
            default: '신청',
        },

        // ── 강조 색상 ────────────────────────────────────────────
        accentColor: {
            type: 'color',
            label: '강조 색상',
            default: '#0046A4',
        },

        // ── [대출] 기본값 ────────────────────────────────────────
        loanDefaultPrincipal: {
            type: 'number',
            label: '[대출] 기본 금액 (만원)',
            default: 10000,
        },
        loanDefaultRate: {
            type: 'number',
            label: '[대출] 기본 금리 (%)',
            default: 5.0,
        },
        loanDefaultPeriod: {
            type: 'number',
            label: '[대출] 기본 기간 (개월)',
            default: 12,
        },

        // ── [대출] 슬라이더 범위 ─────────────────────────────────
        loanPrincipalMin: {
            type: 'number',
            label: '[대출] 금액 최소 (만원)',
            default: 100,
        },
        loanPrincipalMax: {
            type: 'number',
            label: '[대출] 금액 최대 (만원)',
            default: 500000,
        },
        loanRateMin: {
            type: 'number',
            label: '[대출] 금리 최소 (%)',
            default: 0.1,
        },
        loanRateMax: {
            type: 'number',
            label: '[대출] 금리 최대 (%)',
            default: 30,
        },
        loanPeriodMin: {
            type: 'number',
            label: '[대출] 기간 최소 (개월)',
            default: 1,
        },
        loanPeriodMax: {
            type: 'number',
            label: '[대출] 기간 최대 (개월)',
            default: 360,
        },

        // ── [예금] 기본값 ────────────────────────────────────────
        depositDefaultPrincipal: {
            type: 'number',
            label: '[예금] 기본 금액 (만원)',
            default: 1000,
        },
        depositDefaultRate: {
            type: 'number',
            label: '[예금] 기본 금리 (%)',
            default: 3.5,
        },
        depositDefaultPeriod: {
            type: 'number',
            label: '[예금] 기본 기간 (개월)',
            default: 12,
        },

        // ── [예금] 슬라이더 범위 ─────────────────────────────────
        depositPrincipalMin: {
            type: 'number',
            label: '[예금] 금액 최소 (만원)',
            default: 10,
        },
        depositPrincipalMax: {
            type: 'number',
            label: '[예금] 금액 최대 (만원)',
            default: 1000000,
        },
        depositRateMin: {
            type: 'number',
            label: '[예금] 금리 최소 (%)',
            default: 0.1,
        },
        depositRateMax: {
            type: 'number',
            label: '[예금] 금리 최대 (%)',
            default: 20,
        },
        depositPeriodMin: {
            type: 'number',
            label: '[예금] 기간 최소 (개월)',
            default: 1,
        },
        depositPeriodMax: {
            type: 'number',
            label: '[예금] 기간 최대 (개월)',
            default: 60,
        },

        // ── [적금] 기본값 ────────────────────────────────────────
        savingsDefaultMonthly: {
            type: 'number',
            label: '[적금] 기본 월납입금 (만원)',
            default: 100,
        },
        savingsDefaultRate: {
            type: 'number',
            label: '[적금] 기본 금리 (%)',
            default: 4.0,
        },
        savingsDefaultPeriod: {
            type: 'number',
            label: '[적금] 기본 기간 (개월)',
            default: 24,
        },

        // ── [적금] 슬라이더 범위 ─────────────────────────────────
        savingsMonthlyMin: {
            type: 'number',
            label: '[적금] 월납입금 최소 (만원)',
            default: 1,
        },
        savingsMonthlyMax: {
            type: 'number',
            label: '[적금] 월납입금 최대 (만원)',
            default: 10000,
        },
        savingsRateMin: {
            type: 'number',
            label: '[적금] 금리 최소 (%)',
            default: 0.1,
        },
        savingsRateMax: {
            type: 'number',
            label: '[적금] 금리 최대 (%)',
            default: 20,
        },
        savingsPeriodMin: {
            type: 'number',
            label: '[적금] 기간 최소 (개월)',
            default: 1,
        },
        savingsPeriodMax: {
            type: 'number',
            label: '[적금] 기간 최대 (개월)',
            default: 60,
        },
    },

    editor: {
        openContentEditor: function(element, builder, onChange) {
            const container = document.createElement('div');
            container.style.marginBottom = '23px';

            const note = document.createElement('div');
            note.style.cssText = 'background:#FFF3EC;border-radius:8px;padding:12px;font-size:13px;color:#FF6600;line-height:1.5;';
            note.innerHTML = '<strong>계산기 안내</strong><br>슬라이더와 숫자 입력으로 실시간 계산됩니다.<br>신청 버튼 URL 및 탭별 기본값·범위는 설정 패널(⚙)에서 변경하세요.';
            container.appendChild(note);

            return container;
        }
    },

    mount: function(element, options) {
        const accent = element.getAttribute('data-cb-accent-color') || element.dataset.lcAccent || element.style.getPropertyValue('--lc-accent').trim() || '#0046A4';
        element.style.setProperty('--lc-accent', accent);

        const tabs = element.querySelectorAll('.lc-tab');
        const panels = element.querySelectorAll('.lc-panel');

        // ── 1. 탭 노출 여부 계산 (최소 1개 보장) ─────────────────
        const tabVisibility = {
            loan:    options.showLoanTab !== false,
            deposit: options.showDepositTab !== false,
            savings: options.showSavingsTab !== false,
        };
        const visibleCount = Object.values(tabVisibility).filter(Boolean).length;
        if (visibleCount === 0) tabVisibility.loan = true;

        // ── 2. 탭 버튼 / 패널 숨김 처리 ─────────────────────────
        tabs.forEach(tab => {
            tab.style.display = tabVisibility[tab.dataset.type] ? '' : 'none';
        });
        panels.forEach(panel => {
            if (!tabVisibility[panel.dataset.type]) panel.style.display = 'none';
        });

        // ── 3. currentType — 숨겨진 탭이면 첫 번째 노출 탭으로 보정
        let currentType = options.defaultType || 'loan';
        if (!tabVisibility[currentType]) {
            currentType = Object.keys(tabVisibility).find(k => tabVisibility[k]) || 'loan';
        }

        // ── 4. 범위 레이블 텍스트 포맷 헬퍼 ─────────────────────
        const formatRangeLabel = (key, val) => {
            const v = Number(val);
            if (key === 'rate') return `${v}%`;
            if (key === 'period') {
                if (v % 12 === 0 && v > 0) return `${v / 12}년`;
                return `${v}개월`;
            }
            // principal, monthly (단위: 만원)
            if (v >= 10000) return `${v / 10000}억원`;
            return `${v}만원`;
        };

        // ── 5. 슬라이더 범위 → DOM 반영 (syncPair 등록 전 필수) ──
        const rangeConfig = {
            loan: {
                principal: { min: options.loanPrincipalMin, max: options.loanPrincipalMax },
                rate:      { min: options.loanRateMin,      max: options.loanRateMax },
                period:    { min: options.loanPeriodMin,    max: options.loanPeriodMax },
            },
            deposit: {
                principal: { min: options.depositPrincipalMin, max: options.depositPrincipalMax },
                rate:      { min: options.depositRateMin,      max: options.depositRateMax },
                period:    { min: options.depositPeriodMin,    max: options.depositPeriodMax },
            },
            savings: {
                monthly: { min: options.savingsMonthlyMin, max: options.savingsMonthlyMax },
                rate:    { min: options.savingsRateMin,    max: options.savingsRateMax },
                period:  { min: options.savingsPeriodMin,  max: options.savingsPeriodMax },
            },
        };

        panels.forEach(panel => {
            const tabType = panel.dataset.type;
            const config = rangeConfig[tabType] || {};
            Object.entries(config).forEach(([key, { min, max }]) => {
                if (min == null && max == null) return;
                const numInput   = panel.querySelector(`.lc-input[data-key="${key}"]`);
                const rangeInput = panel.querySelector(`.lc-range[data-key="${key}"]`);
                if (numInput) {
                    if (min != null) numInput.min = min;
                    if (max != null) numInput.max = max;
                }
                if (rangeInput) {
                    if (min != null) rangeInput.min = min;
                    if (max != null) rangeInput.max = max;
                    // 범위 레이블 갱신
                    const labelSpans = rangeInput.closest('.lc-field')?.querySelectorAll('.lc-range-labels span');
                    if (labelSpans) {
                        if (labelSpans[0] && min != null) labelSpans[0].textContent = formatRangeLabel(key, min);
                        if (labelSpans[1] && max != null) labelSpans[1].textContent = formatRangeLabel(key, max);
                    }
                }
            });
        });

        // ── 6. 탭별 기본값 → DOM 반영 (syncPair 등록 전 필수) ────
        const defaultValues = {
            loan: {
                principal: options.loanDefaultPrincipal,
                rate:      options.loanDefaultRate,
                period:    options.loanDefaultPeriod,
            },
            deposit: {
                principal: options.depositDefaultPrincipal,
                rate:      options.depositDefaultRate,
                period:    options.depositDefaultPeriod,
            },
            savings: {
                monthly: options.savingsDefaultMonthly,
                rate:    options.savingsDefaultRate,
                period:  options.savingsDefaultPeriod,
            },
        };

        panels.forEach(panel => {
            const tabType = panel.dataset.type;
            const defaults = defaultValues[tabType] || {};
            Object.entries(defaults).forEach(([key, val]) => {
                if (val == null) return;
                const numInput   = panel.querySelector(`.lc-input[data-key="${key}"]`);
                const rangeInput = panel.querySelector(`.lc-range[data-key="${key}"]`);
                if (numInput)   numInput.value   = val;
                if (rangeInput) rangeInput.value = val;
            });
        });

        // ── 7. 탭 전환 ───────────────────────────────────────────
        const switchTab = (type) => {
            currentType = type;
            tabs.forEach(t => t.classList.toggle('active', t.dataset.type === type));
            panels.forEach(p => {
                // 숨긴 탭 패널은 건드리지 않음
                if (!tabVisibility[p.dataset.type]) return;
                p.style.display = p.dataset.type === type ? 'block' : 'none';
            });
            calculate();
        };

        tabs.forEach(tab => {
            if (!tabVisibility[tab.dataset.type]) return;
            tab.addEventListener('click', () => switchTab(tab.dataset.type));
        });

        // ── 8. 신청 버튼 ─────────────────────────────────────────
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

        // ── 9. 금액 포맷 헬퍼 ────────────────────────────────────
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

        // ── 10. 계산 함수 — getVal은 min/max 클램핑으로 극단값 방지
        const calculate = () => {
            const panel = element.querySelector(`.lc-panel[data-type="${currentType}"]`);
            if (!panel) return;

            const getVal = (key) => {
                const el = panel.querySelector(`.lc-input[data-key="${key}"]`);
                if (!el) return 0;
                const v = parseFloat(el.value);
                if (isNaN(v)) return 0;
                const min = parseFloat(el.min);
                const max = parseFloat(el.max);
                return Math.min(Math.max(v, min), max);
            };

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

        // ── 11. range ↔ number input 동기화 ─────────────────────
        const debouncedCalculate = debounce(calculate, 300);

        // 범위 초과 시 테두리 색상 변경용 스타일 (한 번만 주입, DOM 추가 없음)
        if (!document.getElementById('lc-overrange-style')) {
            const style = document.createElement('style');
            style.id = 'lc-overrange-style';
            style.textContent = '.lc-input-wrap.lc-out-of-range{border-color:#e0a030!important;background:#fffbf5!important}';
            document.head.appendChild(style);
        }

        panels.forEach(panel => {
            const syncPair = (inputEl, rangeEl) => {
                if (!inputEl || !rangeEl) return;

                const min = parseFloat(inputEl.min);
                const max = parseFloat(inputEl.max);
                // 마지막 유효 값 저장 (브라우저가 .value를 빈 문자열로 반환할 때 복원용)
                let lastValidValue = inputEl.value;

                // number input: debounce로 타이핑 중 깜빡임 방지
                inputEl.addEventListener('input', () => {
                    const raw = inputEl.value;
                    // 빈 값이면 계산하지 않고 대기
                    if (raw === '' || raw === '-') return;
                    const v = parseFloat(raw);
                    if (isNaN(v)) return;
                    lastValidValue = raw;
                    inputEl.closest('.lc-input-wrap')?.classList.toggle('lc-out-of-range', v < min || v > max);
                    rangeEl.value = Math.min(Math.max(v, min), max);
                    debouncedCalculate();
                });

                // blur 시 min/max 클램핑
                inputEl.addEventListener('blur', () => {
                    // 브라우저가 무효 입력 시 .value를 빈 문자열로 반환 → lastValidValue로 복원
                    if (inputEl.value === '') {
                        inputEl.value = lastValidValue;
                    }
                    const v = parseFloat(inputEl.value);
                    const clamped = isNaN(v) ? parseFloat(inputEl.defaultValue) : Math.min(Math.max(v, min), max);
                    inputEl.value = clamped;
                    lastValidValue = String(clamped);
                    rangeEl.value = inputEl.value;
                    inputEl.closest('.lc-input-wrap')?.classList.remove('lc-out-of-range');
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
                    lastValidValue = rangeEl.value;
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

        // ── 12. 초기 탭 활성화 ───────────────────────────────────
        switchTab(currentType);

        return {};
    },

    unmount: function(element, instance) {
    }
};

class LogicGates {
    constructor() {
        this.inputs = { A: false, B: false };
    }

    render() {
        return DOM.create(`
            <div class="module-section gap-lg" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div class="panel" style="background: #0b0b0c; border: 1px solid rgba(183, 171, 152, 0.15);">
                    <div class="panel-header" style="border-bottom: 1px solid rgba(183, 171, 152, 0.1); padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <h2 class="panel-title" style="font-size: 1.4rem; letter-spacing: 0.05em; color: var(--text-primary); text-transform: uppercase;">
                            Logic Gate Circuit Simulator
                        </h2>
                    </div>
                    
                    <p class="text-secondary" style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Satoshi', sans-serif;">
                        Click on the input nodes <strong style="color: var(--accent-coral);">A</strong> and <strong style="color: var(--accent-coral);">B</strong> in the schematic to toggle their digital state. Watch the logic signals flow through the circuit lines in real-time, computing the Boolean outcomes for <strong style="color: var(--accent-taupe);">AND</strong>, <strong style="color: var(--accent-taupe);">OR</strong>, and <strong style="color: var(--accent-taupe);">XOR</strong> logic gates.
                    </p>

                    <div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: stretch; justify-content: space-between;">
                        
                        <!-- SVG CIRCUIT CANVAS -->
                        <div class="panel lg-canvas-panel" style="flex: 1.4; min-width: 320px; background: #060607; border: 1px solid rgba(255,255,255,0.05); border-radius: var(--radius-sm); padding: 1.5rem; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
                            
                            <!-- Scanner line effect for aesthetic depth -->
                            <div style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 4px, 3px 100%;"></div>
                            
                            <svg id="logic-circuit-svg" viewBox="0 0 500 280" style="width: 100%; height: auto; font-family: 'Fira Code', monospace; user-select: none;">
                                <!-- DEFINITIONS -->
                                <defs>
                                    <filter id="glow-coral" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="4" result="blur" />
                                        <feMerge>
                                            <feMergeNode in="blur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                <!-- CIRCUIT WIRES -->
                                <!-- Wire A branches -->
                                <path id="wire-a-and" d="M 70 80 H 130 V 65 H 200" fill="none" stroke="#252528" stroke-width="3" style="transition: stroke 0.25s, filter 0.25s;" />
                                <path id="wire-a-or"  d="M 70 80 H 120 V 135 H 200" fill="none" stroke="#252528" stroke-width="3" style="transition: stroke 0.25s, filter 0.25s;" />
                                <path id="wire-a-xor" d="M 70 80 H 100 V 205 H 200" fill="none" stroke="#252528" stroke-width="3" style="transition: stroke 0.25s, filter 0.25s;" />

                                <!-- Wire B branches -->
                                <path id="wire-b-and" d="M 70 200 H 150 V 85 H 200" fill="none" stroke="#252528" stroke-width="3" style="transition: stroke 0.25s, filter 0.25s;" />
                                <path id="wire-b-or"  d="M 70 200 H 120 V 155 H 200" fill="none" stroke="#252528" stroke-width="3" style="transition: stroke 0.25s, filter 0.25s;" />
                                <path id="wire-b-xor" d="M 70 200 H 100 V 225 H 200" fill="none" stroke="#252528" stroke-width="3" style="transition: stroke 0.25s, filter 0.25s;" />

                                <!-- Output Wires -->
                                <path id="wire-out-and" d="M 270 75 H 380" fill="none" stroke="#252528" stroke-width="3" style="transition: stroke 0.25s, filter 0.25s;" />
                                <path id="wire-out-or"  d="M 270 147 H 380" fill="none" stroke="#252528" stroke-width="3" style="transition: stroke 0.25s, filter 0.25s;" />
                                <path id="wire-out-xor" d="M 270 217 H 380" fill="none" stroke="#252528" stroke-width="3" style="transition: stroke 0.25s, filter 0.25s;" />

                                <!-- GATE BLOCKS -->
                                <!-- AND Gate -->
                                <g transform="translate(0,0)">
                                    <rect x="200" y="52" width="70" height="45" rx="4" fill="#0c0c0e" stroke="rgba(183, 171, 152, 0.25)" stroke-width="1.5" />
                                    <text x="235" y="80" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--text-primary)">AND</text>
                                </g>
                                <!-- OR Gate -->
                                <g transform="translate(0,0)">
                                    <rect x="200" y="125" width="70" height="45" rx="4" fill="#0c0c0e" stroke="rgba(183, 171, 152, 0.25)" stroke-width="1.5" />
                                    <text x="235" y="153" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--text-primary)">OR</text>
                                </g>
                                <!-- XOR Gate -->
                                <g transform="translate(0,0)">
                                    <rect x="200" y="195" width="70" height="45" rx="4" fill="#0c0c0e" stroke="rgba(183, 171, 152, 0.25)" stroke-width="1.5" />
                                    <text x="235" y="223" text-anchor="middle" font-size="12" font-weight="bold" fill="var(--text-primary)">XOR</text>
                                </g>

                                <!-- INPUT SWITCHES (A & B) -->
                                <!-- Input A Node -->
                                <g id="node-a-trigger" style="cursor: pointer;">
                                    <circle id="node-a-circle" cx="50" cy="80" r="22" fill="#121214" stroke="rgba(183, 171, 152, 0.4)" stroke-width="2" style="transition: fill 0.3s, stroke 0.3s;" />
                                    <text x="50" y="77" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--text-secondary)">IN A</text>
                                    <text id="node-a-val" x="50" y="93" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff" style="transition: fill 0.3s;">0</text>
                                </g>

                                <!-- Input B Node -->
                                <g id="node-b-trigger" style="cursor: pointer;">
                                    <circle id="node-b-circle" cx="50" cy="200" r="22" fill="#121214" stroke="rgba(183, 171, 152, 0.4)" stroke-width="2" style="transition: fill 0.3s, stroke 0.3s;" />
                                    <text x="50" y="197" text-anchor="middle" font-size="11" font-weight="bold" fill="var(--text-secondary)">IN B</text>
                                    <text id="node-b-val" x="50" y="213" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff" style="transition: fill 0.3s;">0</text>
                                </g>

                                <!-- OUTPUT INDICATORS -->
                                <!-- AND Output -->
                                <g>
                                    <circle id="node-and-out" cx="400" cy="75" r="16" fill="#121214" stroke="#252528" stroke-width="2" style="transition: fill 0.3s, stroke 0.3s, filter 0.3s;" />
                                    <text id="node-and-out-val" x="400" y="80" text-anchor="middle" font-size="13" font-weight="bold" fill="var(--text-secondary)" style="transition: fill 0.3s;">0</text>
                                    <text x="428" y="80" font-size="10" font-weight="bold" fill="var(--accent-taupe)">OUT</text>
                                </g>
                                <!-- OR Output -->
                                <g>
                                    <circle id="node-or-out" cx="400" cy="147" r="16" fill="#121214" stroke="#252528" stroke-width="2" style="transition: fill 0.3s, stroke 0.3s, filter 0.3s;" />
                                    <text id="node-or-out-val" x="400" y="152" text-anchor="middle" font-size="13" font-weight="bold" fill="var(--text-secondary)" style="transition: fill 0.3s;">0</text>
                                    <text x="428" y="152" font-size="10" font-weight="bold" fill="var(--accent-taupe)">OUT</text>
                                </g>
                                <!-- XOR Output -->
                                <g>
                                    <circle id="node-xor-out" cx="400" cy="217" r="16" fill="#121214" stroke="#252528" stroke-width="2" style="transition: fill 0.3s, stroke 0.3s, filter 0.3s;" />
                                    <text id="node-xor-out-val" x="400" y="222" text-anchor="middle" font-size="13" font-weight="bold" fill="var(--text-secondary)" style="transition: fill 0.3s;">0</text>
                                    <text x="428" y="222" font-size="10" font-weight="bold" fill="var(--accent-taupe)">OUT</text>
                                </g>
                            </svg>
                        </div>

                        <!-- TRUTH TABLE & INFORMATION -->
                        <div class="panel lg-info-panel" style="flex: 1; min-width: 260px; background: #060607; border: 1px solid rgba(255,255,255,0.05); border-radius: var(--radius-sm); padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
                            <div>
                                <h3 style="font-size: 0.9rem; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent-taupe); margin-bottom: 1rem; border-bottom: 1px solid rgba(183,171,152,0.1); padding-bottom: 6px;">
                                    Boolean Truth Table
                                </h3>

                                <table class="truth-table" style="width: 100%; border-collapse: collapse; font-family: 'Fira Code', monospace; font-size: 0.8rem; text-align: center;">
                                    <thead>
                                        <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1); color: var(--text-secondary);">
                                            <th style="padding: 6px;">A</th>
                                            <th style="padding: 6px; border-right: 1px solid rgba(255,255,255,0.1);">B</th>
                                            <th style="padding: 6px; color: var(--text-primary);">AND</th>
                                            <th style="padding: 6px; color: var(--text-primary);">OR</th>
                                            <th style="padding: 6px; color: var(--text-primary);">XOR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr id="row-0-0" style="border-bottom: 1px solid rgba(255,255,255,0.03); transition: background-color 0.25s, color 0.25s;">
                                            <td style="padding: 8px; color: var(--text-secondary);">0</td>
                                            <td style="padding: 8px; color: var(--text-secondary); border-right: 1px solid rgba(255,255,255,0.1);">0</td>
                                            <td style="padding: 8px; font-weight: bold;">0</td>
                                            <td style="padding: 8px; font-weight: bold;">0</td>
                                            <td style="padding: 8px; font-weight: bold;">0</td>
                                        </tr>
                                        <tr id="row-0-1" style="border-bottom: 1px solid rgba(255,255,255,0.03); transition: background-color 0.25s, color 0.25s;">
                                            <td style="padding: 8px; color: var(--text-secondary);">0</td>
                                            <td style="padding: 8px; color: var(--text-secondary); border-right: 1px solid rgba(255,255,255,0.1);">1</td>
                                            <td style="padding: 8px; font-weight: bold;">0</td>
                                            <td style="padding: 8px; font-weight: bold;">1</td>
                                            <td style="padding: 8px; font-weight: bold;">1</td>
                                        </tr>
                                        <tr id="row-1-0" style="border-bottom: 1px solid rgba(255,255,255,0.03); transition: background-color 0.25s, color 0.25s;">
                                            <td style="padding: 8px; color: var(--text-secondary);">1</td>
                                            <td style="padding: 8px; color: var(--text-secondary); border-right: 1px solid rgba(255,255,255,0.1);">0</td>
                                            <td style="padding: 8px; font-weight: bold;">0</td>
                                            <td style="padding: 8px; font-weight: bold;">1</td>
                                            <td style="padding: 8px; font-weight: bold;">1</td>
                                        </tr>
                                        <tr id="row-1-1" style="border-bottom: 1px solid rgba(255,255,255,0.03); transition: background-color 0.25s, color 0.25s;">
                                            <td style="padding: 8px; color: var(--text-secondary);">1</td>
                                            <td style="padding: 8px; color: var(--text-secondary); border-right: 1px solid rgba(255,255,255,0.1);">1</td>
                                            <td style="padding: 8px; font-weight: bold;">1</td>
                                            <td style="padding: 8px; font-weight: bold;">1</td>
                                            <td style="padding: 8px; font-weight: bold;">0</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div style="margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
                                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; font-family: 'Satoshi', sans-serif;">
                                    <div style="display: flex; gap: 8px; align-items: flex-start;">
                                        <span style="color: var(--accent-coral); font-family: 'Fira Code', monospace; font-weight: bold;">[AND]</span>
                                        <span class="text-secondary">High output (1) requires A and B to be 1.</span>
                                    </div>
                                    <div style="display: flex; gap: 8px; align-items: flex-start;">
                                        <span style="color: var(--accent-coral); font-family: 'Fira Code', monospace; font-weight: bold;">[OR]</span>
                                        <span class="text-secondary">High output (1) if A is 1, or B is 1 (or both).</span>
                                    </div>
                                    <div style="display: flex; gap: 8px; align-items: flex-start;">
                                        <span style="color: var(--accent-coral); font-family: 'Fira Code', monospace; font-weight: bold;">[XOR]</span>
                                        <span class="text-secondary">High output (1) only if inputs are different.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `);
    }

    init() {
        this.triggerA = DOM.get('#node-a-trigger');
        this.triggerB = DOM.get('#node-b-trigger');

        this.circleA = DOM.get('#node-a-circle');
        this.circleB = DOM.get('#node-b-circle');

        this.valA = DOM.get('#node-a-val');
        this.valB = DOM.get('#node-b-val');

        // Wires
        this.wires = {
            aAnd: DOM.get('#wire-a-and'),
            aOr: DOM.get('#wire-a-or'),
            aXor: DOM.get('#wire-a-xor'),
            bAnd: DOM.get('#wire-b-and'),
            bOr: DOM.get('#wire-b-or'),
            bXor: DOM.get('#wire-b-xor'),
            outAnd: DOM.get('#wire-out-and'),
            outOr: DOM.get('#wire-out-or'),
            outXor: DOM.get('#wire-out-xor')
        };

        // Outputs
        this.outNodeAnd = DOM.get('#node-and-out');
        this.outNodeOr = DOM.get('#node-or-out');
        this.outNodeXor = DOM.get('#node-xor-out');

        this.outValAnd = DOM.get('#node-and-out-val');
        this.outValOr = DOM.get('#node-or-out-val');
        this.outValXor = DOM.get('#node-xor-out-val');

        // Event hooks
        if (this.triggerA) {
            this.triggerA.addEventListener('click', () => {
                this.inputs.A = !this.inputs.A;
                this.updateUI();
            });
        }

        if (this.triggerB) {
            this.triggerB.addEventListener('click', () => {
                this.inputs.B = !this.inputs.B;
                this.updateUI();
            });
        }

        this.updateUI();
    }

    updateUI() {
        const a = this.inputs.A;
        const b = this.inputs.B;

        // Logic operations
        const andRes = a && b;
        const orRes = a || b;
        const xorRes = a !== b;

        const activeColor = '#eb5939'; // Coral glow
        const inactiveColor = '#252528'; // Dark grey

        // Update Input nodes styling
        if (this.circleA) {
            this.circleA.setAttribute('stroke', a ? activeColor : 'rgba(183, 171, 152, 0.4)');
            this.circleA.style.fill = a ? 'rgba(235, 89, 57, 0.1)' : '#121214';
            if (a) {
                this.circleA.setAttribute('filter', 'url(#glow-coral)');
            } else {
                this.circleA.removeAttribute('filter');
            }
        }
        if (this.valA) {
            this.valA.textContent = a ? '1' : '0';
            this.valA.style.fill = a ? activeColor : 'var(--text-secondary)';
        }

        if (this.circleB) {
            this.circleB.setAttribute('stroke', b ? activeColor : 'rgba(183, 171, 152, 0.4)');
            this.circleB.style.fill = b ? 'rgba(235, 89, 57, 0.1)' : '#121214';
            if (b) {
                this.circleB.setAttribute('filter', 'url(#glow-coral)');
            } else {
                this.circleB.removeAttribute('filter');
            }
        }
        if (this.valB) {
            this.valB.textContent = b ? '1' : '0';
            this.valB.style.fill = b ? activeColor : 'var(--text-secondary)';
        }

        // Update Input Wires coloring
        this.setWireState(this.wires.aAnd, a, activeColor, inactiveColor);
        this.setWireState(this.wires.aOr, a, activeColor, inactiveColor);
        this.setWireState(this.wires.aXor, a, activeColor, inactiveColor);

        this.setWireState(this.wires.bAnd, b, activeColor, inactiveColor);
        this.setWireState(this.wires.bOr, b, activeColor, inactiveColor);
        this.setWireState(this.wires.bXor, b, activeColor, inactiveColor);

        // Update Output Wires coloring
        this.setWireState(this.wires.outAnd, andRes, activeColor, inactiveColor);
        this.setWireState(this.wires.outOr, orRes, activeColor, inactiveColor);
        this.setWireState(this.wires.outXor, xorRes, activeColor, inactiveColor);

        // Update Output node Indicators
        this.setOutputState(this.outNodeAnd, this.outValAnd, andRes, activeColor);
        this.setOutputState(this.outNodeOr, this.outValOr, orRes, activeColor);
        this.setOutputState(this.outNodeXor, this.outValXor, xorRes, activeColor);

        // Update Truth Table highlight
        const activeRowId = `row-${a ? '1' : '0'}-${b ? '1' : '0'}`;
        const rows = ['row-0-0', 'row-0-1', 'row-1-0', 'row-1-1'];
        rows.forEach(rowId => {
            const el = DOM.get(`#${rowId}`);
            if (el) {
                if (rowId === activeRowId) {
                    el.style.backgroundColor = 'rgba(235, 89, 57, 0.12)';
                    el.style.color = '#ffffff';
                    el.style.borderLeft = '3px solid var(--accent-coral)';
                } else {
                    el.style.backgroundColor = '';
                    el.style.color = 'var(--text-secondary)';
                    el.style.borderLeft = '';
                }
            }
        });
    }

    setWireState(wireEl, state, activeColor, inactiveColor) {
        if (!wireEl) return;
        wireEl.setAttribute('stroke', state ? activeColor : inactiveColor);
        if (state) {
            wireEl.setAttribute('filter', 'url(#glow-coral)');
        } else {
            wireEl.removeAttribute('filter');
        }
    }

    setOutputState(circleEl, valEl, state, activeColor) {
        if (circleEl) {
            circleEl.setAttribute('stroke', state ? activeColor : '#252528');
            circleEl.style.fill = state ? 'rgba(235, 89, 57, 0.15)' : '#121214';
            if (state) {
                circleEl.setAttribute('filter', 'url(#glow-coral)');
            } else {
                circleEl.removeAttribute('filter');
            }
        }
        if (valEl) {
            valEl.textContent = state ? '1' : '0';
            valEl.style.fill = state ? '#ffffff' : 'var(--text-secondary)';
        }
    }

    destroy() {
        // Reset states
        this.inputs.A = false;
        this.inputs.B = false;
    }
}
window.LogicGates = LogicGates;

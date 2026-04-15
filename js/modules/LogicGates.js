import { DOM } from '../core/dom.js';

export default class LogicGates {
    constructor() {
        this.inputs = { A: false, B: false };
    }

    render() {
        return DOM.create(`
            <div class="module-section gap-lg">
                <div class="panel">
                    <div class="panel-header"><h2 class="panel-title">Logic Gate Simulator</h2></div>
                    <p class="text-secondary" style="margin-bottom: 2rem;">
                        Toggle the digital inputs (A and B) to observe how different logic gates compute their outputs.
                    </p>

                    <div class="flex gap-lg justify-between" style="flex-wrap: wrap;">
                        <!-- Inputs Panel -->
                        <div class="panel" style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.4);">
                            <h3 style="margin-bottom: 1rem; text-align: center; color: var(--text-secondary);">Inputs</h3>
                            <div class="flex-col gap-md items-center">
                                <button id="btn-input-a" class="btn" style="width: 100px; font-size: 1.5rem; background: var(--bg-secondary); border: 2px solid var(--border-color); color: var(--text-primary);">0</button>
                                <button id="btn-input-b" class="btn" style="width: 100px; font-size: 1.5rem; background: var(--bg-secondary); border: 2px solid var(--border-color); color: var(--text-primary);">0</button>
                            </div>
                        </div>

                        <!-- Outputs Panel -->
                        <div class="panel" style="flex: 2; min-width: 300px; background: rgba(0,0,0,0.4);">
                            <h3 style="margin-bottom: 1rem; text-align: center; color: var(--text-secondary);">Gate Outputs</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem;">
                                
                                <!-- AND Gate -->
                                <div class="gate-box text-center">
                                    <h4 class="text-secondary" style="margin-bottom: 0.5rem;">AND</h4>
                                    <div id="out-and" class="indicator" style="width: 50px; height: 50px; border-radius: 50%; margin: 0 auto; background: #222; border: 2px solid var(--border-color); transition: all var(--trans-fast);"></div>
                                </div>

                                <!-- OR Gate -->
                                <div class="gate-box text-center">
                                    <h4 class="text-secondary" style="margin-bottom: 0.5rem;">OR</h4>
                                    <div id="out-or" class="indicator" style="width: 50px; height: 50px; border-radius: 50%; margin: 0 auto; background: #222; border: 2px solid var(--border-color); transition: all var(--trans-fast);"></div>
                                </div>

                                <!-- XOR Gate -->
                                <div class="gate-box text-center">
                                    <h4 class="text-secondary" style="margin-bottom: 0.5rem;">XOR</h4>
                                    <div id="out-xor" class="indicator" style="width: 50px; height: 50px; border-radius: 50%; margin: 0 auto; background: #222; border: 2px solid var(--border-color); transition: all var(--trans-fast);"></div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    init() {
        this.btnA = DOM.get('#btn-input-a');
        this.btnB = DOM.get('#btn-input-b');
        
        this.outAND = DOM.get('#out-and');
        this.outOR = DOM.get('#out-or');
        this.outXOR = DOM.get('#out-xor');

        this.btnA.addEventListener('click', () => {
            this.inputs.A = !this.inputs.A;
            this.updateUI();
        });

        this.btnB.addEventListener('click', () => {
            this.inputs.B = !this.inputs.B;
            this.updateUI();
        });

        this.updateUI();
    }

    updateUI() {
        // Update Buttons
        this.btnA.textContent = this.inputs.A ? '1' : '0';
        this.btnB.textContent = this.inputs.B ? '1' : '0';
        this.btnA.style.borderColor = this.inputs.A ? 'var(--text-accent)' : 'var(--border-color)';
        this.btnA.style.color = this.inputs.A ? 'var(--text-accent)' : 'var(--text-primary)';
        this.btnB.style.borderColor = this.inputs.B ? 'var(--text-accent)' : 'var(--border-color)';
        this.btnB.style.color = this.inputs.B ? 'var(--text-accent)' : 'var(--text-primary)';

        // Calculate Logic
        const a = this.inputs.A;
        const b = this.inputs.B;
        
        const andRes = a && b;
        const orRes = a || b;
        const xorRes = a !== b;

        // Update Indicators
        this.setIndicator(this.outAND, andRes);
        this.setIndicator(this.outOR, orRes);
        this.setIndicator(this.outXOR, xorRes);
    }

    setIndicator(element, state) {
        if (state) {
            element.style.background = 'var(--text-success)';
            element.style.borderColor = 'transparent';
            element.style.boxShadow = '0 0 20px var(--text-success)';
        } else {
            element.style.background = '#222';
            element.style.borderColor = 'var(--border-color)';
            element.style.boxShadow = 'none';
        }
    }
}

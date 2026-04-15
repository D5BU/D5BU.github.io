import { DOM } from '../core/dom.js';

export default class BruteForceDemo {
    constructor() {
        this.isAttacking = false;
        this.attempts = 0;
        this.targetPassword = '';
    }

    render() {
        return DOM.create(`
            <div class="module-section gap-lg">
                <div class="panel">
                    <div class="panel-header"><h2 class="panel-title">Brute Force Attack Simulation</h2></div>
                    <p class="text-secondary" style="margin-bottom: 2rem;">
                        This simulation calculates the theoretical time required to crack a password using brute force, and visually simulates the process.
                    </p>

                    <div class="flex gap-lg" style="flex-wrap: wrap;">
                        <div class="panel" style="flex: 1; border-color: rgba(255, 51, 102, 0.3);">
                            <h3 style="margin-bottom: 1rem; color: var(--text-danger);">Target Configuration</h3>
                            <div class="input-group">
                                <label class="input-label text-secondary">Target Password</label>
                                <input type="text" id="bf-password" class="input-text" value="pass123">
                            </div>
                            <button id="btn-start-attack" class="btn btn-danger w-full" style="width: 100%;">Start Attack</button>
                            
                            <div id="bf-stats" class="mt-md hidden" style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-secondary);">
                                Entropy: <span id="bf-entropy" class="text-accent">0</span> bits<br>
                                Est. Time: <span id="bf-est-time" class="text-warning">0</span>
                            </div>
                        </div>

                        <div class="panel" style="flex: 2; background: #050505; border: 1px solid #333;">
                            <h3 style="margin-bottom: 1rem; color: var(--text-success); font-family: var(--font-mono);">Terminal Output</h3>
                            <div id="terminal-output" style="height: 200px; overflow-y: hidden; font-family: var(--font-mono); font-size: 0.8rem; color: #00FF66; display: flex; flex-direction: column; justify-content: flex-end;">
                                <div>> System Ready. Waiting for target...</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    init() {
        this.btnStart = DOM.get('#btn-start-attack');
        this.inputPassword = DOM.get('#bf-password');
        this.terminal = DOM.get('#terminal-output');
        this.statsDiv = DOM.get('#bf-stats');
        this.entropySpan = DOM.get('#bf-entropy');
        this.estTimeSpan = DOM.get('#bf-est-time');

        this.btnStart.addEventListener('click', () => {
            if (this.isAttacking) return;
            this.targetPassword = this.inputPassword.value;
            if (!this.targetPassword) return;

            this.calculateStats();
            this.startSimulation();
        });
    }

    calculateStats() {
        let charsetSize = 0;
        if (/[a-z]/.test(this.targetPassword)) charsetSize += 26;
        if (/[A-Z]/.test(this.targetPassword)) charsetSize += 26;
        if (/[0-9]/.test(this.targetPassword)) charsetSize += 10;
        if (/[^a-zA-Z0-9]/.test(this.targetPassword)) charsetSize += 32;

        const length = this.targetPassword.length;
        const combinations = Math.pow(charsetSize, length);
        const entropy = (length * Math.log2(charsetSize)).toFixed(2);
        
        let estTime = 'Instant'; // Assuming 100 billion guesses per sec for modern GPU array
        const guessesPerSec = 100000000000;
        const seconds = combinations / guessesPerSec;
        
        if (seconds > 31536000) estTime = `${(seconds / 31536000).toFixed(2)} years`;
        else if (seconds > 86400) estTime = `${(seconds / 86400).toFixed(2)} days`;
        else if (seconds > 3600) estTime = `${(seconds / 3600).toFixed(2)} hours`;
        else if (seconds > 60) estTime = `${(seconds / 60).toFixed(2)} minutes`;
        else if (seconds > 1) estTime = `${seconds.toFixed(2)} seconds`;

        this.entropySpan.textContent = isNaN(entropy) ? 0 : entropy;
        this.estTimeSpan.textContent = estTime;
        this.statsDiv.classList.remove('hidden');
    }

    logTerminal(text, color = '#00FF66') {
        const line = document.createElement('div');
        line.style.color = color;
        line.textContent = text;
        this.terminal.appendChild(line);
        if (this.terminal.children.length > 15) {
            this.terminal.removeChild(this.terminal.firstChild);
        }
    }

    getCharList(length) {
        let chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let res = '';
        for(let i=0; i<length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
        return res;
    }

    startSimulation() {
        this.isAttacking = true;
        this.btnStart.textContent = 'Attacking...';
        this.btnStart.classList.add('hidden');
        this.logTerminal('> Initializing attack vector...');
        this.logTerminal(`> Target length: ${this.targetPassword.length}`);
        
        this.attempts = 0;
        let found = false;

        const loop = setInterval(() => {
            if (found) {
                clearInterval(loop);
                return;
            }

            // Simulate high speed logging batch
            let batchOutput = '';
            for(let i=0; i<20; i++) {
                // To simulate we eventually "find" it randomly for the sake of demo max timeout
                if (this.attempts > 100 && Math.random() > 0.98) {
                    found = true;
                    this.logTerminal(`> [SUCCESS] Target acquired: ${this.targetPassword}`, 'var(--text-danger)');
                    this.logTerminal(`> Time elapsed: Simulated`, 'var(--text-danger)');
                    this.btnStart.textContent = 'Attack Finished';
                    this.btnStart.classList.remove('hidden');
                    this.isAttacking = false;
                    clearInterval(loop);
                    break;
                } else {
                    const guess = this.getCharList(this.targetPassword.length);
                    batchOutput = `Attempt ${this.attempts}: ${guess}`;
                    this.attempts++;
                }
            }
            if(!found) this.logTerminal(batchOutput);

        }, 50); // every 50ms output a batch
    }
}

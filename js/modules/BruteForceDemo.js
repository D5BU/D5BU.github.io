class BruteForceDemo {
    constructor() {
        this.isAttacking = false;
        this.attempts = 0;
        this.targetPassword = '';
        this.loopInterval = null;
        this.cpuInterval = null;
        
        // Settings defaults
        this.charsets = {
            lowercase: true,
            uppercase: false,
            numbers: true,
            symbols: false
        };
        this.gpusCount = 4; // Simulated GPU grids
    }

    render() {
        return DOM.create(`
            <div class="module-section gap-lg" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div class="panel" style="background: #0b0b0c; border: 1px solid rgba(183, 171, 152, 0.15);">
                    <div class="panel-header" style="border-bottom: 1px solid rgba(183, 171, 152, 0.1); padding-bottom: 1rem; margin-bottom: 1.5rem;">
                        <h2 class="panel-title" style="font-size: 1.4rem; letter-spacing: 0.05em; color: var(--text-primary); text-transform: uppercase;">
                            Brute Force Attack Visualizer
                        </h2>
                    </div>

                    <p class="text-secondary" style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; font-family: 'Satoshi', sans-serif;">
                        This visualizer demonstrates the vulnerability of low-entropy passwords. Configure the target password, select the active search criteria, scale up the computing grid resources, and monitor the high-speed search space cracking matrix.
                    </p>

                    <div style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: stretch; justify-content: space-between;">
                        
                        <!-- CONFIGURATION PANEL -->
                        <div class="panel" style="flex: 1.1; min-width: 300px; background: #060607; border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1.5rem;">
                            
                            <div>
                                <h3 style="font-size: 0.9rem; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent-taupe); margin-bottom: 1.2rem;">
                                    Target Settings
                                </h3>

                                <div class="input-group" style="margin-bottom: 1rem; display: flex; flex-direction: column; gap: 6px;">
                                    <label class="input-label text-secondary" style="font-size: 0.8rem; font-family: 'Satoshi', sans-serif;">Password Target</label>
                                    <input type="text" id="bf-password" class="input-text" value="admin12" style="background: #0d0d0d; border: 1px solid rgba(255,255,255,0.1); padding: 10px; color: var(--text-primary); font-family: 'Fira Code', monospace; border-radius: var(--radius-sm); font-size: 0.9rem; outline: none; width: 100%;">
                                </div>

                                <div style="margin-bottom: 1rem;">
                                    <label class="input-label text-secondary" style="font-size: 0.8rem; display: block; margin-bottom: 6px; font-family: 'Satoshi', sans-serif;">Search Space Character Sets</label>
                                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-family: 'Satoshi', sans-serif; font-size: 0.8rem;">
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-secondary);">
                                            <input type="checkbox" id="chk-lowercase" checked style="accent-color: var(--accent-coral);"> a-z (Lowercase)
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-secondary);">
                                            <input type="checkbox" id="chk-uppercase" style="accent-color: var(--accent-coral);"> A-Z (Uppercase)
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-secondary);">
                                            <input type="checkbox" id="chk-numbers" checked style="accent-color: var(--accent-coral);"> 0-9 (Numbers)
                                        </label>
                                        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-secondary);">
                                            <input type="checkbox" id="chk-symbols" style="accent-color: var(--accent-coral);"> Special Char
                                        </label>
                                    </div>
                                </div>

                                <div style="margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 6px;">
                                    <label class="input-label text-secondary" style="font-size: 0.8rem; font-family: 'Satoshi', sans-serif; display: flex; justify-content: space-between;">
                                        <span>Simulated GPU Arrays:</span>
                                        <strong id="gpu-count-display" style="color: var(--accent-coral);">4 Clusters</strong>
                                    </label>
                                    <input type="range" id="gpu-range" min="1" max="16" value="4" style="width: 100%; accent-color: var(--accent-coral); height: 4px; border-radius: 2px; cursor: pointer; background: #222; border: none; outline: none;">
                                </div>
                            </div>

                            <!-- ATTACK TRIGGER -->
                            <div>
                                <button id="btn-start-attack" class="btn" style="width: 100%; padding: 12px; background: var(--accent-coral); color: #ffffff; border: none; border-radius: var(--radius-sm); font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem; font-family: 'Satoshi', sans-serif; transition: opacity 0.3s, transform 0.2s;">
                                    Initialize Decryption
                                </button>
                                <button id="btn-stop-attack" class="btn hidden" style="width: 100%; padding: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.15); color: var(--text-secondary); border-radius: var(--radius-sm); font-weight: bold; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem; font-family: 'Satoshi', sans-serif; transition: all 0.3s;">
                                    Abort Attack Sequence
                                </button>
                            </div>
                        </div>

                        <!-- TERMINAL DISPLAY & STATISTICS -->
                        <div class="panel" style="flex: 1.4; min-width: 320px; background: #060607; border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
                            
                            <!-- CPU grid / stats -->
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-family: 'Fira Code', monospace; font-size: 0.75rem;">
                                <div style="background: #0b0b0c; border: 1px solid rgba(255,255,255,0.03); padding: 8px; border-radius: var(--radius-sm);">
                                    <span style="color: var(--accent-taupe); display: block; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 4px;">Complexity</span>
                                    <span id="bf-entropy" style="color: #ffffff; font-weight: bold; font-size: 0.95rem;">0</span> <span style="color: var(--text-secondary); font-size: 0.7rem;">bits</span>
                                </div>
                                <div style="background: #0b0b0c; border: 1px solid rgba(255,255,255,0.03); padding: 8px; border-radius: var(--radius-sm);">
                                    <span style="color: var(--accent-taupe); display: block; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 4px;">Search Space</span>
                                    <span id="bf-combinations" style="color: #ffffff; font-weight: bold; font-size: 0.95rem;">0</span>
                                </div>
                                <div style="background: #0b0b0c; border: 1px solid rgba(255,255,255,0.03); padding: 8px; border-radius: var(--radius-sm); position: relative; overflow: hidden;">
                                    <span style="color: var(--accent-taupe); display: block; font-size: 0.65rem; text-transform: uppercase; margin-bottom: 4px;">Sim GPU Load</span>
                                    <div style="display: flex; gap: 3px; align-items: center; height: 16px; margin-top: 4px;">
                                        <div class="gpu-load-bar" style="width: 25%; height: 6px; background: #222; border-radius: 1px; transition: background-color 0.3s;"></div>
                                        <div class="gpu-load-bar" style="width: 25%; height: 6px; background: #222; border-radius: 1px; transition: background-color 0.3s;"></div>
                                        <div class="gpu-load-bar" style="width: 25%; height: 6px; background: #222; border-radius: 1px; transition: background-color 0.3s;"></div>
                                        <div class="gpu-load-bar" style="width: 25%; height: 6px; background: #222; border-radius: 1px; transition: background-color 0.3s;"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- TERMINAL AREA -->
                            <div style="flex: 1; min-height: 200px; background: #040405; border: 1px solid rgba(255,255,255,0.04); border-radius: var(--radius-sm); padding: 12px; display: flex; flex-direction: column; justify-content: flex-end; position: relative; overflow: hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.8);">
                                
                                <!-- Scanline effect overlay -->
                                <div style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05)); background-size: 100% 4px, 3px 100%;"></div>
                                
                                <div id="terminal-output" style="font-family: 'Fira Code', monospace; font-size: 0.75rem; color: #00FF66; text-shadow: 0 0 4px rgba(0,255,102,0.45); display: flex; flex-direction: column; justify-content: flex-end; gap: 4px; z-index: 2; overflow-y: hidden;">
                                    <div style="color: var(--text-secondary);">> CORE // Simulation host online. Ready for targets.</div>
                                </div>
                            </div>

                            <!-- Estimated Crack Time panel -->
                            <div style="font-family: 'Fira Code', monospace; font-size: 0.75rem; color: var(--text-secondary); background: #0b0b0c; border: 1px solid rgba(255,255,255,0.03); padding: 10px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
                                <span>Estimated time to crack (Theoretical):</span>
                                <strong id="bf-est-time" style="color: var(--accent-coral); font-size: 0.85rem;">0.00s</strong>
                            </div>

                        </div>
                        
                    </div>
                </div>
            </div>
        `);
    }

    init() {
        this.btnStart = DOM.get('#btn-start-attack');
        this.btnStop = DOM.get('#btn-stop-attack');
        this.inputPassword = DOM.get('#bf-password');
        
        // Checkboxes
        this.chkLower = DOM.get('#chk-lowercase');
        this.chkUpper = DOM.get('#chk-uppercase');
        this.chkNum = DOM.get('#chk-numbers');
        this.chkSym = DOM.get('#chk-symbols');

        // GPU Array Controls
        this.gpuSlider = DOM.get('#gpu-range');
        this.gpuDisplay = DOM.get('#gpu-count-display');

        // Panels & Stats
        this.terminal = DOM.get('#terminal-output');
        this.entropySpan = DOM.get('#bf-entropy');
        this.combinationsSpan = DOM.get('#bf-combinations');
        this.estTimeSpan = DOM.get('#bf-est-time');
        this.loadBars = document.querySelectorAll('.gpu-load-bar');

        // Add settings listeners
        this.inputPassword.addEventListener('input', () => this.calculateStats());
        this.chkLower.addEventListener('change', () => this.calculateStats());
        this.chkUpper.addEventListener('change', () => this.calculateStats());
        this.chkNum.addEventListener('change', () => this.calculateStats());
        this.chkSym.addEventListener('change', () => this.calculateStats());

        this.gpuSlider.addEventListener('input', (e) => {
            this.gpusCount = parseInt(e.target.value);
            this.gpuDisplay.textContent = `${this.gpusCount} Cluster${this.gpusCount > 1 ? 's' : ''}`;
            this.calculateStats();
        });

        // Trigger clicks
        this.btnStart.addEventListener('click', () => this.startSimulation());
        this.btnStop.addEventListener('click', () => this.stopSimulation());

        this.calculateStats();
    }

    calculateStats() {
        this.targetPassword = this.inputPassword.value;
        
        // Active charsets configuration
        this.charsets.lowercase = this.chkLower.checked;
        this.charsets.uppercase = this.chkUpper.checked;
        this.charsets.numbers = this.chkNum.checked;
        this.charsets.symbols = this.chkSym.checked;

        let charsetSize = 0;
        if (this.charsets.lowercase) charsetSize += 26;
        if (this.charsets.uppercase) charsetSize += 26;
        if (this.charsets.numbers) charsetSize += 10;
        if (this.charsets.symbols) charsetSize += 32;

        const length = this.targetPassword.length;

        if (charsetSize === 0 || length === 0) {
            this.entropySpan.textContent = '0';
            this.combinationsSpan.textContent = '0';
            this.estTimeSpan.textContent = '0.00s';
            return;
        }

        const combinations = Math.pow(charsetSize, length);
        const entropy = (length * Math.log2(charsetSize)).toFixed(1);
        
        // 1 cluster simulates 50 Billion hashes/sec. Scaling up with array clusters.
        const hashRatePerGpu = 50000000000;
        const totalHashRate = hashRatePerGpu * this.gpusCount;
        const secondsToCrack = combinations / totalHashRate;
        
        let estTime = '';
        if (secondsToCrack < 0.01) {
            estTime = 'Instant (under 0.01s)';
        } else if (secondsToCrack < 1) {
            estTime = `${secondsToCrack.toFixed(3)} seconds`;
        } else if (secondsToCrack < 60) {
            estTime = `${secondsToCrack.toFixed(2)} seconds`;
        } else if (secondsToCrack < 3600) {
            estTime = `${(secondsToCrack / 60).toFixed(2)} minutes`;
        } else if (secondsToCrack < 86400) {
            estTime = `${(secondsToCrack / 3600).toFixed(2)} hours`;
        } else if (secondsToCrack < 31536000) {
            estTime = `${(secondsToCrack / 86400).toFixed(1)} days`;
        } else if (secondsToCrack < 3153600000) {
            estTime = `${(secondsToCrack / 31536000).toFixed(1)} years`;
        } else {
            estTime = 'Infinite (billions of years)';
        }

        this.entropySpan.textContent = entropy;
        this.combinationsSpan.textContent = this.formatNumber(combinations);
        this.estTimeSpan.textContent = estTime;
    }

    formatNumber(num) {
        if (num >= 1e18) return `${(num / 1e18).toFixed(2)} Exa`;
        if (num >= 1e15) return `${(num / 1e15).toFixed(2)} Peta`;
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)} Tera`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)} Giga`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)} Million`;
        return num.toLocaleString();
    }

    logTerminal(text, color = '#00FF66') {
        const line = document.createElement('div');
        line.style.color = color;
        line.style.textShadow = color.includes('00FF66') ? '0 0 4px rgba(0,255,102,0.45)' : '0 0 4px rgba(235,89,57,0.45)';
        line.textContent = text;
        this.terminal.appendChild(line);

        // Keep last 10 elements to prevent page bloat and preserve performance
        if (this.terminal.children.length > 10) {
            this.terminal.removeChild(this.terminal.firstChild);
        }
    }

    getCharList(length) {
        let chars = '';
        if (this.charsets.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
        if (this.charsets.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (this.charsets.numbers) chars += '0123456789';
        if (this.charsets.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (!chars) chars = 'abc'; // fallback

        let res = '';
        for (let i = 0; i < length; i++) {
            res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res;
    }

    startSimulation() {
        if (this.isAttacking) return;
        
        this.targetPassword = this.inputPassword.value;
        if (!this.targetPassword) return;

        // Verify that at least one charset is checked
        if (!this.chkLower.checked && !this.chkUpper.checked && !this.chkNum.checked && !this.chkSym.checked) {
            this.logTerminal('> [CRITICAL ERROR] No character sets enabled!', '#FF3366');
            return;
        }

        this.isAttacking = true;
        this.attempts = 0;

        // Toggle layout buttons
        this.btnStart.classList.add('hidden');
        this.btnStop.classList.remove('hidden');

        // Disable input configurations during attack run
        this.inputPassword.disabled = true;
        this.chkLower.disabled = true;
        this.chkUpper.disabled = true;
        this.chkNum.disabled = true;
        this.chkSym.disabled = true;
        this.gpuSlider.disabled = true;

        this.logTerminal(`> GPU NODE [${this.gpusCount} Array Clusters] // INITIALIZING CRACKING SEQUENCE...`, 'var(--accent-taupe)');
        this.logTerminal(`> TARGET PATTERN SIZE: ${this.targetPassword.length} characters`);
        
        let found = false;

        // Animate simulated GPU load bars flicker
        this.cpuInterval = setInterval(() => {
            this.loadBars.forEach(bar => {
                const load = Math.random();
                if (load > 0.3) {
                    bar.style.backgroundColor = '#00FF66';
                    bar.style.boxShadow = '0 0 8px #00FF66';
                } else {
                    bar.style.backgroundColor = '#222';
                    bar.style.boxShadow = 'none';
                }
            });
        }, 150);

        // Run batch guesses simulation
        this.loopInterval = setInterval(() => {
            if (found) {
                this.stopSimulation();
                return;
            }

            let batchOutput = '';
            // Process high-speed visual guess batch
            for (let i = 0; i < 15; i++) {
                // Check if simulated attempt hits target password
                // Simulating statistical probability of hit: higher entropy takes longer to hit in UI demo
                let matchChance = 0.985;
                if (this.attempts > 120) matchChance = 0.95;
                if (this.attempts > 200) matchChance = 0.90;
                
                // Keep simulation relatively fast for demo
                if (this.attempts > 25 && Math.random() > matchChance) {
                    found = true;
                    this.logTerminal(`> [SUCCESS] TARGET MATCH FOUND! KEY DECRYPTED IN ${this.attempts} STEPS.`, 'var(--accent-coral)');
                    this.logTerminal(`> EXTRACTED DECRYPT KEY: [ ${this.targetPassword} ]`, '#ffffff');
                    
                    // Stop loads, restore buttons
                    this.resetControlsUI();
                    clearInterval(this.loopInterval);
                    clearInterval(this.cpuInterval);
                    break;
                } else {
                    const guess = this.getCharList(this.targetPassword.length);
                    batchOutput = `NODE ${Math.floor(Math.random() * this.gpusCount)} Attempt #${this.attempts.toLocaleString()} // HASH TRY: ${guess}`;
                    this.attempts += Math.floor(Math.random() * 5) + 1;
                }
            }

            if (!found) {
                this.logTerminal(batchOutput);
            }
        }, 60);
    }

    stopSimulation() {
        if (!this.isAttacking) return;
        this.logTerminal('> [ABORT SEQUENCE] User initiated system interrupt. Connection severed.', '#FF3366');
        this.destroy();
    }

    resetControlsUI() {
        this.isAttacking = false;
        this.btnStart.classList.remove('hidden');
        this.btnStop.classList.add('hidden');

        // Re-enable settings
        this.inputPassword.disabled = false;
        this.chkLower.disabled = false;
        this.chkUpper.disabled = false;
        this.chkNum.disabled = false;
        this.chkSym.disabled = false;
        this.gpuSlider.disabled = false;

        this.loadBars.forEach(bar => {
            bar.style.backgroundColor = '#222';
            bar.style.boxShadow = 'none';
        });
    }

    destroy() {
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        if (this.cpuInterval) {
            clearInterval(this.cpuInterval);
            this.cpuInterval = null;
        }
        this.resetControlsUI();
    }
}
window.BruteForceDemo = BruteForceDemo;

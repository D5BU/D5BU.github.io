/**
 * OSI CyberRun: The Hacking-Courier Game
 * Integrates interactive arcade running (Packet Courier) and logical CLI network puzzles (Cyber Heist)
 * across the 7 layers of the OSI model. Features a dynamic Web Audio synthesizer.
 */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.bgOsc = null;
        this.bgGain = null;
        this.isPlayingMusic = false;
        this.musicInterval = null;
        this.enabled = false;
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    playBleep(freq = 440, duration = 0.08, type = 'sine') {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        // Envelope
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playJump() {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playExplosion() {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }

    playSuccess() {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.08);

            gain.gain.setValueAtTime(0.12, now + index * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + index * 0.08);
            osc.stop(now + index * 0.08 + 0.15);
        });
    }

    playFail() {
        if (!this.enabled || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(130, this.ctx.currentTime);
        osc.frequency.setValueAtTime(110, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    startMusic() {
        if (!this.enabled || this.isPlayingMusic || !this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.isPlayingMusic = true;
        let step = 0;
        // Simple retro cyberpunk baseline arpeggio
        const notes = [
            110.00, 110.00, 130.81, 110.00, // A2, A2, C3, A2
            98.00, 98.00, 116.54, 98.00,    // G2, G2, Bb2, G2
            87.31, 87.31, 103.83, 87.31,    // F2, F2, Ab2, F2
            73.42, 82.41, 98.00, 110.00     // D2, E2, G2, A2
        ];

        this.musicInterval = setInterval(() => {
            if (!this.isPlayingMusic || !this.ctx) return;
            const freq = notes[step % notes.length];
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            // Simple low pass filter to give it a dark feel
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);
            step++;
        }, 250);
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }

    destroy() {
        this.stopMusic();
        if (this.ctx) {
            this.ctx.close();
            this.ctx = null;
        }
        this.enabled = false;
    }
}

class OsiGame {
    constructor() {
        this.audio = new AudioEngine();
        this.soundEnabled = false;
        this.currentMode = 'menu'; // 'menu', 'courier', 'heist'
        
        // Courier Arcade State
        this.courier = {
            canvas: null,
            ctx: null,
            animationFrame: null,
            player: { x: 50, y: 130, size: 24, track: 1, targetY: 130 },
            obstacles: [],
            collectibles: [],
            score: 0,
            distance: 0,
            currentLayer: 7, // 7 down to 1
            isGameOver: false,
            isVictory: false,
            speed: 4,
            spawnTimer: 0,
            layerProgress: 0,
            headersCollected: []
        };

        // Cyber Heist Puzzle State
        this.heist = {
            currentLayer: 1, // 1 to 7
            maxUnlocked: 1,
            solved: false,
            puzzleState: {}
        };
    }

    render() {
        return DOM.create(`
            <div class="osi-game-container" style="color: #e2e2e8; font-family: 'Satoshi', sans-serif; display: flex; flex-direction: column; gap: 1.2rem; min-height: 520px; width: 100%;">
                
                <!-- Dynamic Local Styles Injected -->
                <style>
                    .game-hud-btn {
                        background: rgba(255,255,255,0.04);
                        border: 1px solid rgba(255,255,255,0.1);
                        color: #e2e2e8;
                        padding: 8px 16px;
                        font-family: 'Fira Code', monospace;
                        font-size: 11px;
                        cursor: pointer;
                        text-transform: uppercase;
                        font-weight: bold;
                        border-radius: 4px;
                        transition: all 0.3s;
                    }
                    .game-hud-btn:hover {
                        border-color: var(--accent-coral);
                        background: rgba(235, 89, 57, 0.1);
                    }
                    .game-hud-btn.active {
                        background: var(--accent-coral);
                        border-color: var(--accent-coral);
                        color: #fff;
                    }
                    .heist-layer-tab {
                        flex: 1;
                        padding: 8px 4px;
                        background: #030304;
                        border: 1px solid rgba(255,255,255,0.04);
                        text-align: center;
                        font-size: 10px;
                        font-family: 'Clash Grotesk', sans-serif;
                        font-weight: 700;
                        cursor: pointer;
                        color: var(--text-secondary);
                        transition: all 0.3s;
                        border-radius: 3px;
                    }
                    .heist-layer-tab.active {
                        border-color: var(--accent-coral);
                        color: var(--accent-coral);
                        background: rgba(235, 89, 57, 0.05);
                    }
                    .heist-layer-tab.locked {
                        opacity: 0.3;
                        cursor: not-allowed;
                    }
                    .pipe-node {
                        width: 50px;
                        height: 50px;
                        background: #0d0d0e;
                        border: 1px solid rgba(255,255,255,0.06);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        cursor: pointer;
                        font-family: 'Fira Code', monospace;
                        font-weight: bold;
                        transition: all 0.2s;
                        border-radius: 4px;
                        color: var(--text-secondary);
                    }
                    .pipe-node:hover {
                        border-color: var(--accent-coral);
                        background: #151518;
                    }
                    .pipe-node.connected {
                        color: #00FF66;
                        border-color: #00FF66;
                        box-shadow: 0 0 8px rgba(0, 255, 102, 0.15);
                    }
                </style>

                <!-- GAME TOP CONTROL BAR -->
                <div class="panel" style="background: #0b0b0c; border: 1px solid rgba(183, 171, 152, 0.15); padding: 1rem 1.2rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h2 style="font-size: 1.3rem; letter-spacing: 0.05em; color: var(--text-primary); text-transform: uppercase; font-family: 'Clash Grotesk', sans-serif; margin: 0;">
                            OSI CyberRun // Arcade & Puzzle Lab
                        </h2>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button id="game-btn-toggle-sound" class="game-hud-btn">🔇 Sound: Off</button>
                        <button id="game-btn-mode-menu" class="game-hud-btn active">Menu</button>
                        <button id="game-btn-mode-courier" class="game-hud-btn">1. Packet Courier</button>
                        <button id="game-btn-mode-heist" class="game-hud-btn">2. Cyber Heist</button>
                    </div>
                </div>

                <!-- GAME SCREEN MOUNT FRAME -->
                <div id="game-screen-mount" class="panel" style="background: #060607; border: 1px solid rgba(255,255,255,0.05); min-height: 400px; display: flex; align-items: center; justify-content: center; position: relative; border-radius: 4px;">
                    <!-- Views will be injected dynamically -->
                </div>
            </div>
        `);
    }

    init() {
        this.btnSound = DOM.get('#game-btn-toggle-sound');
        this.btnMenu = DOM.get('#game-btn-mode-menu');
        this.btnCourier = DOM.get('#game-btn-mode-courier');
        this.btnHeist = DOM.get('#game-btn-mode-heist');
        this.screenMount = DOM.get('#game-screen-mount');

        // Nav click events
        this.btnSound.addEventListener('click', () => this.toggleSound());
        this.btnMenu.addEventListener('click', () => this.switchMode('menu'));
        this.btnCourier.addEventListener('click', () => this.switchMode('courier'));
        this.btnHeist.addEventListener('click', () => this.switchMode('heist'));

        // Load main menu
        this.switchMode('menu');
    }

    toggleSound() {
        this.audio.init();
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) {
            this.btnSound.textContent = "🔊 Sound: On";
            this.btnSound.classList.add('active');
            this.audio.startMusic();
        } else {
            this.btnSound.textContent = "🔇 Sound: Off";
            this.btnSound.classList.remove('active');
            this.audio.stopMusic();
        }
    }

    switchMode(mode) {
        // Halt any ongoing animation cycles
        this.stopCourierLoop();

        // Manage active button styles
        [this.btnMenu, this.btnCourier, this.btnHeist].forEach(btn => btn.classList.remove('active'));
        if (mode === 'menu') this.btnMenu.classList.add('active');
        if (mode === 'courier') this.btnCourier.classList.add('active');
        if (mode === 'heist') this.btnHeist.classList.add('active');

        this.currentMode = mode;
        
        if (mode === 'menu') {
            this.loadMenuScreen();
        } else if (mode === 'courier') {
            this.loadCourierScreen();
        } else if (mode === 'heist') {
            this.loadHeistScreen();
        }

        if (this.soundEnabled) {
            this.audio.playBleep(520, 0.06);
        }
    }

    /* --- MENU SCREEN --- */
    loadMenuScreen() {
        this.screenMount.innerHTML = `
            <div style="text-align: center; max-width: 500px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
                <h3 style="font-family: 'Clash Grotesk', sans-serif; font-size: 2rem; color: var(--accent-coral); text-transform: uppercase;">Choose Your Operation</h3>
                <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">
                    Explore the Open Systems Interconnection (OSI) reference model through two interactive learning paths. Enable sound for an 8-bit retro arcade experience.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                    <div class="panel" style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 1.2rem; border-radius: 4px; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                        <h4 style="text-transform: uppercase; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary);">1. Packet Courier</h4>
                        <span style="font-size: 11px; color: var(--text-secondary); min-height: 48px;">Pilot Packy down the tracks. Collect headers (AH-DH) and serialize into physical bits.</span>
                        <button id="menu-btn-launch-courier" class="game-hud-btn" style="background: var(--accent-coral); color: white; border-color: var(--accent-coral);">Run Courier</button>
                    </div>
                    <div class="panel" style="flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 1.2rem; border-radius: 4px; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                        <h4 style="text-transform: uppercase; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary);">2. Cyber Heist</h4>
                        <span style="font-size: 11px; color: var(--text-secondary); min-height: 48px;">Infiltrate ADYU Corp. Solve 7 cybersecurity networking puzzles (one for each layer).</span>
                        <button id="menu-btn-launch-heist" class="game-hud-btn" style="background: var(--accent-coral); color: white; border-color: var(--accent-coral);">Start Heist</button>
                    </div>
                </div>
            </div>
        `;

        DOM.get('#menu-btn-launch-courier').addEventListener('click', () => this.switchMode('courier'));
        DOM.get('#menu-btn-launch-heist').addEventListener('click', () => this.switchMode('heist'));
    }

    /* --- COURIER ARCADE MODE --- */
    loadCourierScreen() {
        if (this.keyboardHandler) {
            window.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }
        this.courier.score = 0;
        this.courier.distance = 0;
        this.courier.currentLayer = 7;
        this.courier.layerProgress = 0;
        this.courier.isGameOver = false;
        this.courier.isVictory = false;
        this.courier.obstacles = [];
        this.courier.collectibles = [];
        this.courier.headersCollected = [];
        this.courier.player.track = 1;
        this.courier.player.y = 130;
        this.courier.player.targetY = 130;

        this.screenMount.innerHTML = `
            <div style="display: flex; flex-direction: column; width: 100%; height: 100%; position: relative; padding: 1rem;">
                
                <!-- Game HUD -->
                <div style="display: flex; justify-content: space-between; font-family: 'Fira Code', monospace; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 8px;">
                    <div>LAYER: <strong id="courier-hud-layer" style="color: var(--accent-coral);">7 (Application)</strong></div>
                    <div>HEADER PAYLOAD: <span id="courier-hud-headers" style="color: #00FF66;">[None]</span></div>
                    <div>SCORE: <strong id="courier-hud-score">0</strong></div>
                </div>

                <!-- Game Canvas -->
                <div style="position: relative; width: 100%; overflow: hidden; background: #010102; border: 1px solid rgba(255,255,255,0.03); border-radius: 4px;">
                    <canvas id="courier-canvas" width="680" height="260" tabindex="0" style="display: block; width: 100%; height: auto; outline: none;"></canvas>
                    
                    <!-- Mobile Virtual Keys / Help Overlays -->
                    <div style="position: absolute; bottom: 8px; right: 8px; display: flex; gap: 4px;">
                        <button id="virtual-up" class="game-hud-btn" style="padding: 6px 10px;">▲ UP</button>
                        <button id="virtual-down" class="game-hud-btn" style="padding: 6px 10px;">▼ DOWN</button>
                    </div>
                    <div style="position: absolute; bottom: 8px; left: 8px; font-family: 'Fira Code', monospace; font-size: 9px; color: var(--text-secondary); pointer-events: none;">
                        Controls: WASD / Arrow Keys to change tracks
                    </div>
                </div>

                <!-- Layer Context Details -->
                <div id="courier-layer-tip-panel" class="panel" style="margin-top: 10px; background: #0b0b0c; border: 1px solid rgba(255,255,255,0.05); padding: 10px; font-size: 11px; line-height: 1.4; font-family: 'Satoshi', sans-serif;">
                    <span style="color: var(--accent-coral); font-weight: bold; text-transform: uppercase;">Current Objective:</span> 
                    <span id="courier-layer-tip">Collect the Application Header (AH) and reach 100% layer transmission distance!</span>
                </div>
            </div>
        `;

        this.courier.canvas = DOM.get('#courier-canvas');
        this.courier.ctx = this.courier.canvas.getContext('2d');
        
        // Focus the canvas immediately so that keyboard controls work without needing a mouse click
        setTimeout(() => {
            if (this.courier.canvas) {
                this.courier.canvas.focus();
            }
        }, 50);

        // Setup Virtual Keys
        DOM.get('#virtual-up').addEventListener('click', () => this.moveCourierPlayer(-1));
        DOM.get('#virtual-down').addEventListener('click', () => this.moveCourierPlayer(1));

        // Keyboard Listener
        this.keyboardHandler = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.moveCourierPlayer(-1);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this.moveCourierPlayer(1);
            }
        };
        window.addEventListener('keydown', this.keyboardHandler);

        // Start Loop
        this.startCourierLoop();
    }

    moveCourierPlayer(dir) {
        if (this.courier.isGameOver || this.courier.isVictory) return;
        let newTrack = this.courier.player.track + dir;
        if (newTrack >= 0 && newTrack <= 2) {
            this.courier.player.track = newTrack;
            this.courier.player.targetY = 40 + newTrack * 90;
            if (this.soundEnabled) {
                this.audio.playJump();
            }
        }
    }

    startCourierLoop() {
        this.stopCourierLoop();
        const loop = () => {
            this.updateCourier();
            this.drawCourier();
            this.courier.animationFrame = requestAnimationFrame(loop);
        };
        this.courier.animationFrame = requestAnimationFrame(loop);
    }

    stopCourierLoop() {
        if (this.courier.animationFrame) {
            cancelAnimationFrame(this.courier.animationFrame);
            this.courier.animationFrame = null;
        }
        if (this.keyboardHandler) {
            window.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }
    }

    updateCourier() {
        if (this.courier.isGameOver || this.courier.isVictory) return;

        // Smooth Lerp Y position of player
        this.courier.player.y += (this.courier.player.targetY - this.courier.player.y) * 0.2;

        // Update progress distance
        this.courier.distance += 0.15;
        this.courier.layerProgress = Math.min(100, Math.floor((this.courier.distance % 50) * 2));

        // Spawning
        this.courier.spawnTimer++;
        if (this.courier.spawnTimer > 45) {
            this.courier.spawnTimer = 0;
            this.spawnCourierEntities();
        }

        // Move Collectibles and Obstacles
        this.courier.collectibles.forEach(col => col.x -= this.courier.speed);
        this.courier.obstacles.forEach(obs => obs.x -= this.courier.speed);

        // Filter offscreen entities
        this.courier.collectibles = this.courier.collectibles.filter(col => col.x > -50);
        this.courier.obstacles = this.courier.obstacles.filter(obs => obs.x > -50);

        // Collision Checks
        const px = this.courier.player.x;
        const py = this.courier.player.y;
        const ps = this.courier.player.size;

        this.courier.collectibles.forEach((col, idx) => {
            if (Math.abs(col.x - px) < (ps + col.size)/2 && Math.abs(col.y - py) < (ps + col.size)/2) {
                // Collected!
                this.collectHeader(col.header);
                this.courier.score += 100;
                this.courier.collectibles.splice(idx, 1);
                if (this.soundEnabled) {
                    this.audio.playSuccess();
                }
            }
        });

        this.courier.obstacles.forEach((obs, idx) => {
            if (Math.abs(obs.x - px) < (ps + obs.size)/2 && Math.abs(obs.y - py) < (ps + obs.size)/2) {
                // Collided! Hit obstacle
                this.courier.obstacles.splice(idx, 1);
                this.triggerGameOver();
            }
        });

        // Layer Progression logic
        if (this.courier.layerProgress >= 100) {
            const currentRequiredHeader = this.getLayerHeaderName(this.courier.currentLayer);
            const hasHeader = this.courier.headersCollected.includes(currentRequiredHeader) || currentRequiredHeader === 'NONE';
            
            if (hasHeader) {
                if (this.courier.currentLayer > 1) {
                    this.courier.currentLayer--;
                    this.courier.distance = 0;
                    this.courier.layerProgress = 0;
                    this.courier.speed += 0.5;
                    this.updateLayerContextText();
                    if (this.soundEnabled) {
                        this.audio.playBleep(880, 0.2, 'triangle');
                    }
                } else {
                    // Reached physical layer & finished
                    this.courier.isVictory = true;
                    if (this.soundEnabled) {
                        this.audio.playSuccess();
                    }
                }
            }
        }

        // Update DOM stats
        const scoreDiv = DOM.get('#courier-hud-score');
        const headersDiv = DOM.get('#courier-hud-headers');
        const layerDiv = DOM.get('#courier-hud-layer');
        if (scoreDiv) scoreDiv.textContent = this.courier.score;
        if (headersDiv) {
            headersDiv.textContent = this.courier.headersCollected.length > 0 
                ? `[ ${this.courier.headersCollected.join(' -> ')} ]` 
                : '[None]';
        }
        if (layerDiv) layerDiv.textContent = `${this.courier.currentLayer} (${this.getLayerName(this.courier.currentLayer)})`;
    }

    getLayerName(layer) {
        const names = {
            7: 'Application', 6: 'Presentation', 5: 'Session', 
            4: 'Transport', 3: 'Network', 2: 'Data Link', 1: 'Physical'
        };
        return names[layer] || 'Unknown';
    }

    getLayerHeaderName(layer) {
        const headers = { 7: 'AH', 6: 'PH', 5: 'SH', 4: 'TH', 3: 'NH', 2: 'DH', 1: 'BITS' };
        return headers[layer] || 'NONE';
    }

    updateLayerContextText() {
        const tipEl = DOM.get('#courier-layer-tip');
        if (!tipEl) return;
        const currentHeader = this.getLayerHeaderName(this.courier.currentLayer);
        const lName = this.getLayerName(this.courier.currentLayer);

        let desc = '';
        if (this.courier.currentLayer === 6) {
            desc = `Collect the Presentation Header (PH) to package protocols and format data. Avoid electromagnetic wave noises!`;
        } else if (this.courier.currentLayer === 5) {
            desc = `Collect the Session Header (SH) to coordinate dialogue. Watch out for buffer timeouts!`;
        } else if (this.courier.currentLayer === 4) {
            desc = `Collect the Transport Header (TH) to segment payloads. Dodge TCP Buffer Overflows!`;
        } else if (this.courier.currentLayer === 3) {
            desc = `Collect the Network Header (NH) for routing. Jump subnets to avoid packet looping drops!`;
        } else if (this.courier.currentLayer === 2) {
            desc = `Collect the Data Link Header (DH) to frame data. Bypass local switch crashes.`;
        } else if (this.courier.currentLayer === 1) {
            desc = `Physical Layer reached! Convert the packet into fiber bits (BITS) to reach the user target terminal!`;
        } else {
            desc = `Collect the Application Header (${currentHeader}) and run down the tracks to complete layer transmission.`;
        }

        tipEl.textContent = desc;
    }

    collectHeader(header) {
        if (!this.courier.headersCollected.includes(header)) {
            this.courier.headersCollected.push(header);
        }
    }

    spawnCourierEntities() {
        // Spawn randomly across the 3 tracks
        const trackIdx = Math.floor(Math.random() * 3);
        const y = 40 + trackIdx * 90;

        // Decide if spawning collectible header or obstacle
        const reqHeader = this.getLayerHeaderName(this.courier.currentLayer);
        const hasHeader = this.courier.headersCollected.includes(reqHeader);

        if (!hasHeader && Math.random() > 0.4) {
            // Spawn Required Header
            this.courier.collectibles.push({
                x: 700, y: y, size: 20, header: reqHeader
            });
        } else {
            // Spawn Obstacle
            const obstaclesList = [
                'DROP', 'OVERFLOW', 'NOISE', 'COLLISION', 'CONGESTION'
            ];
            const obsType = obstaclesList[Math.floor(Math.random() * obstaclesList.length)];
            this.courier.obstacles.push({
                x: 700, y: y, size: 32, type: obsType
            });
        }
    }

    triggerGameOver() {
        this.courier.isGameOver = true;
        if (this.soundEnabled) {
            this.audio.playExplosion();
            this.audio.playFail();
        }
    }

    drawCourier() {
        const ctx = this.courier.ctx;
        if (!ctx) return;

        // Clear Canvas
        ctx.fillStyle = '#010102';
        ctx.fillRect(0, 0, 680, 260);

        // Draw horizontal track lines (3 lanes)
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 40 + i * 90);
            ctx.lineTo(680, 40 + i * 90);
            ctx.stroke();
        }

        // Draw track boundary outlines
        ctx.strokeStyle = 'rgba(183, 171, 152, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 680, 260);

        // Draw progress bar outline in background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, 0, 680, 6);
        ctx.fillStyle = 'var(--accent-coral)';
        ctx.fillRect(0, 0, (this.courier.layerProgress / 100) * 680, 6);

        // Draw Collectibles
        this.courier.collectibles.forEach(col => {
            ctx.fillStyle = '#00FF66';
            ctx.shadowColor = '#00FF66';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(col.x, col.y, col.size/2, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            ctx.font = 'bold 8px Courier';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(col.header, col.x, col.y);
        });

        // Draw Obstacles
        this.courier.obstacles.forEach(obs => {
            ctx.fillStyle = '#FF3366';
            ctx.shadowColor = '#FF3366';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.rect(obs.x - obs.size/2, obs.y - obs.size/2, obs.size, obs.size);
            ctx.fill();

            // Label (High contrast black text, larger size for readability)
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#0b0b0c';
            ctx.font = 'bold 9px "Fira Code"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(obs.type.substring(0, 4), obs.x, obs.y);
        });

        // Draw Player ("Packy")
        const px = this.courier.player.x;
        const py = this.courier.player.y;
        const ps = this.courier.player.size;

        ctx.fillStyle = 'var(--text-primary)';
        ctx.shadowColor = 'var(--text-primary)';
        ctx.shadowBlur = 10;
        ctx.fillRect(px - ps/2, py - ps/2, ps, ps);
        ctx.shadowBlur = 0;

        // Player face lines
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + 2, py - 4);
        ctx.lineTo(px + 2, py + 4);
        ctx.stroke();

        // Screen state overlays
        if (this.courier.isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, 680, 260);

            ctx.fillStyle = '#FF3366';
            ctx.font = 'bold 24px "Clash Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('PACKET COLLISION / DROPPED', 340, 110);

            ctx.fillStyle = '#e2e2e8';
            ctx.font = '12px "Fira Code", monospace';
            ctx.fillText('Press RESTART to retake transaction pipeline', 340, 145);

            // Draw restart button inside overlay frame coordinates
            this.drawOverlayButton('RESTART RUN', 340, 180);
        }

        if (this.courier.isVictory) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, 680, 260);

            ctx.fillStyle = '#00FF66';
            ctx.font = 'bold 24px "Clash Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('TRANSACTION DELIVERED SUCCESS', 340, 110);

            ctx.fillStyle = '#e2e2e8';
            ctx.font = '12px "Fira Code", monospace';
            ctx.fillText(`PDU packets compiled & routed. Final Score: ${this.courier.score}`, 340, 145);

            this.drawOverlayButton('PLAY AGAIN', 340, 180);
        }
    }

    drawOverlayButton(text, cx, cy) {
        const ctx = this.courier.ctx;
        ctx.strokeStyle = 'var(--accent-coral)';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 70, cy - 16, 140, 32);
        
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = 'bold 10px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, cx, cy);

        // Click detection coordinates registered
        if (!this.overlayBtnRegistered) {
            this.overlayBtnRegistered = true;
            this.courier.canvas.addEventListener('click', (e) => {
                if (!this.courier.isGameOver && !this.courier.isVictory) return;
                
                // Get canvas space coordinates
                const rect = this.courier.canvas.getBoundingClientRect();
                const mx = ((e.clientX - rect.left) / rect.width) * 680;
                const my = ((e.clientY - rect.top) / rect.height) * 260;

                // Hitbox check
                if (mx >= cx - 70 && mx <= cx + 70 && my >= cy - 16 && my <= cy + 16) {
                    this.overlayBtnRegistered = false;
                    this.loadCourierScreen();
                }
            });
        }
    }

    /* --- CYBER HEIST PUZZLE MODE --- */
    loadHeistScreen() {
        this.screenMount.innerHTML = `
            <div style="display: flex; flex-direction: column; width: 100%; padding: 1.2rem; gap: 1rem; text-align: left;">
                
                <!-- Progress tabs for 7 layers -->
                <div style="display: flex; gap: 6px; width: 100%;">
                    <div id="heist-tab-1" class="heist-layer-tab active">L1: Phys</div>
                    <div id="heist-tab-2" class="heist-layer-tab locked">L2: Link</div>
                    <div id="heist-tab-3" class="heist-layer-tab locked">L3: Net</div>
                    <div id="heist-tab-4" class="heist-layer-tab locked">L4: Trans</div>
                    <div id="heist-tab-5" class="heist-layer-tab locked">L5: Sess</div>
                    <div id="heist-tab-6" class="heist-layer-tab locked">L6: Pres</div>
                    <div id="heist-tab-7" class="heist-layer-tab locked">L7: App</div>
                </div>

                <div class="panel" style="background: #0b0b0c; border: 1px solid rgba(255,255,255,0.05); padding: 1rem; border-radius: 4px; display: flex; flex-direction: column; gap: 12px; min-height: 280px; position: relative;">
                    <div id="heist-puzzle-title" style="font-family: 'Clash Grotesk', sans-serif; font-weight: bold; font-size: 1.1rem; color: var(--accent-coral); text-transform: uppercase;">
                        Layer 1 // Physical Wire Splice
                    </div>
                    <div id="heist-puzzle-instruction" style="font-size: 12px; color: var(--text-secondary); line-height: 1.5;">
                        Connect the copper cables to establish signal line voltage. Click the grid blocks to rotate them until a path is linked.
                    </div>
                    
                    <!-- PUZZLE WORK AREA -->
                    <div id="heist-puzzle-body" style="display: flex; justify-content: center; align-items: center; padding: 1rem 0; flex: 1;">
                        <!-- Custom layout loaded per layer -->
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px;">
                        <span id="heist-puzzle-feedback" style="font-family: 'Fira Code', monospace; font-size: 11px; color: #FF3366;">[ SYSTEM: OFFLINE ]</span>
                        <button id="heist-puzzle-submit" class="game-hud-btn" style="background: var(--accent-coral); border-color: var(--accent-coral); color: #fff;">Verify Link</button>
                    </div>
                </div>

            </div>
        `;

        // Wire tabs click listeners
        for (let i = 1; i <= 7; i++) {
            DOM.get(`#heist-tab-${i}`).addEventListener('click', () => {
                if (i <= this.heist.maxUnlocked) {
                    this.heist.currentLayer = i;
                    this.loadHeistLayerPuzzle();
                } else {
                    if (this.soundEnabled) this.audio.playFail();
                }
            });
        }

        DOM.get('#heist-puzzle-submit').addEventListener('click', () => this.verifyHeistPuzzle());

        // Load L1 Puzzle
        this.loadHeistLayerPuzzle();
    }

    loadHeistLayerPuzzle() {
        const layer = this.heist.currentLayer;
        
        // Update active tab styles
        for (let i = 1; i <= 7; i++) {
            const tab = DOM.get(`#heist-tab-${i}`);
            if (tab) {
                tab.className = 'heist-layer-tab';
                if (i === layer) tab.classList.add('active');
                if (i > this.heist.maxUnlocked) tab.classList.add('locked');
            }
        }

        // Set solved to false
        this.heist.solved = false;

        const titleEl = DOM.get('#heist-puzzle-title');
        const descEl = DOM.get('#heist-puzzle-instruction');
        const bodyEl = DOM.get('#heist-puzzle-body');
        const feedbackEl = DOM.get('#heist-puzzle-feedback');

        if (feedbackEl) {
            feedbackEl.textContent = '[ SYSTEM: WAITING FOR PAYLOAD VERIFICATION ]';
            feedbackEl.style.color = 'var(--text-purple)';
        }

        // Load specific puzzle body
        if (layer === 1) {
            titleEl.textContent = "Layer 1 (Physical) // Optic/Copper Wire Splicer";
            descEl.textContent = "Click each segment box to rotate its connection terminals. Link the Left input terminal to the Right receiver node.";
            
            // 4x4 Grid of pipes. Let's make a simple interactive game.
            // Pipes representations: '─', '│', '┌', '┐', '└', '┘'
            // To make it easy and bug-free, we generate 4 clickable blocks. When clicked, they cycle orientations.
            // Initial states: angles [90, 0, 180, 270] degrees. Target to form connection is all 0 degrees (straight line).
            this.heist.puzzleState = { angles: [90, 270, 90, 180] };
            
            let html = '<div style="display: flex; gap: 12px;">';
            for (let i = 0; i < 4; i++) {
                html += `<div class="pipe-node" id="wire-node-${i}" style="transform: rotate(${this.heist.puzzleState.angles[i]}deg); font-size: 24px;">➔</div>`;
            }
            html += '</div>';
            bodyEl.innerHTML = html;

            for (let i = 0; i < 4; i++) {
                DOM.get(`#wire-node-${i}`).addEventListener('click', (e) => {
                    this.heist.puzzleState.angles[i] = (this.heist.puzzleState.angles[i] + 90) % 360;
                    e.target.style.transform = `rotate(${this.heist.puzzleState.angles[i]}deg)`;
                    if (this.soundEnabled) this.audio.playBleep(330, 0.05);
                });
            }

        } else if (layer === 2) {
            titleEl.textContent = "Layer 2 (Data Link) // MAC Address Spoofing";
            descEl.textContent = "The local firewall blocks unknown MAC addresses. Intercept a packet from the printer/camera, and select its authorized MAC address below to clone.";
            
            this.heist.puzzleState = {
                targetMac: '00:1A:2B:3C:4D:5E',
                options: [
                    'DE:AD:BE:EF:00:11',
                    '00:1A:2B:3C:4D:5E', // Target (Printer)
                    'FF:FF:FF:FF:FF:FF',
                    '80:E6:50:22:A1:C9'
                ]
            };

            let html = '<div style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:320px;">';
            this.heist.puzzleState.options.forEach((mac, i) => {
                html += `
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-family:'Fira Code', monospace; font-size:12px; background:rgba(255,255,255,0.02); padding:8px; border:1px solid rgba(255,255,255,0.05); border-radius:4px;">
                        <input type="radio" name="mac-spoof" value="${mac}" ${i===0?'checked':''}>
                        <span>Device #${i+1}: ${mac} ${mac === '00:1A:2B:3C:4D:5E' ? '(HQ Printer - Authorized)' : '(Unknown)'}</span>
                    </label>
                `;
            });
            html += '</div>';
            bodyEl.innerHTML = html;

        } else if (layer === 3) {
            titleEl.textContent = "Layer 3 (Network) // Subnet Router Config";
            descEl.textContent = "Route packets to the corporate server located on subnet 10.0.4.0/24. Pick the correct Next Hop router gateway.";
            
            this.heist.puzzleState = {
                correctGateway: '10.0.4.1',
                options: [
                    { ip: '192.168.1.1', mask: 'Home/Local LAN' },
                    { ip: '10.0.1.254', mask: 'Sales LAN (10.0.1.0/24)' },
                    { ip: '10.0.4.1', mask: 'Vault Subnet Gateway (10.0.4.0/24)' }, // Correct
                    { ip: '8.8.8.8', mask: 'External DNS IP' }
                ]
            };

            let html = '<div style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:340px;">';
            this.heist.puzzleState.options.forEach((opt, i) => {
                html += `
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-family:'Fira Code', monospace; font-size:12px; background:rgba(255,255,255,0.02); padding:8px; border:1px solid rgba(255,255,255,0.05); border-radius:4px;">
                        <input type="radio" name="ip-route" value="${opt.ip}" ${i===0?'checked':''}>
                        <span>IP: <strong>${opt.ip}</strong> (${opt.mask})</span>
                    </label>
                `;
            });
            html += '</div>';
            bodyEl.innerHTML = html;

        } else if (layer === 4) {
            titleEl.textContent = "Layer 4 (Transport) // TCP 3-Way Handshake SYN Matcher";
            descEl.textContent = "Align the synchronization sequence. A SYN signal is sent. Select the matching response flags in order to complete connection.";
            
            this.heist.puzzleState = {
                sequence: ['SYN-ACK', 'ACK'],
                step: 0
            };

            bodyEl.innerHTML = `
                <div style="text-align:center; font-family:'Fira Code', monospace;">
                    <div style="color:var(--text-purple); font-size:13px; margin-bottom:15px;">Handshake Step: <strong id="heist-tcp-step-label">1 of 2: Awaiting SYN Response</strong></div>
                    <div id="heist-tcp-status" style="background:#000; border:1px solid rgba(255,255,255,0.05); padding:15px; border-radius:4px; font-size:11px; color:#fff; min-width:260px; min-height:60px; display:flex; align-items:center; justify-content:center;">
                        [ INCOMING SEGMENT: SYN ]
                    </div>
                    <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                        <button id="tcp-flag-rst" class="game-hud-btn">RST</button>
                        <button id="tcp-flag-synack" class="game-hud-btn">SYN-ACK</button>
                        <button id="tcp-flag-ack" class="game-hud-btn">ACK</button>
                    </div>
                </div>
            `;

            DOM.get('#tcp-flag-rst').addEventListener('click', () => this.handleTcpPress('RST'));
            DOM.get('#tcp-flag-synack').addEventListener('click', () => this.handleTcpPress('SYN-ACK'));
            DOM.get('#tcp-flag-ack').addEventListener('click', () => this.handleTcpPress('ACK'));

        } else if (layer === 5) {
            titleEl.textContent = "Layer 5 (Session) // Token Replay Hijack";
            descEl.textContent = "Hijack the administrative session. Pick the unexpired token cookie matching administrative hash (Admin ID: 88).";
            
            this.heist.puzzleState = {
                correctToken: 'token_admin_88_active',
                options: [
                    'session_user_12_expired',
                    'guest_session_99_guest',
                    'token_admin_88_active', // Correct
                    'sess_hash_null'
                ]
            };

            let html = '<div style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:320px;">';
            this.heist.puzzleState.options.forEach((opt, i) => {
                html += `
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-family:'Fira Code', monospace; font-size:12px; background:rgba(255,255,255,0.02); padding:8px; border:1px solid rgba(255,255,255,0.05); border-radius:4px;">
                        <input type="radio" name="session-tok" value="${opt}" ${i===0?'checked':''}>
                        <span>cookie: <strong>${opt}</strong></span>
                    </label>
                `;
            });
            html += '</div>';
            bodyEl.innerHTML = html;

        } else if (layer === 6) {
            titleEl.textContent = "Layer 6 (Presentation) // SSL/TLS Cipher Decrypter";
            descEl.textContent = "The server payload is encrypted. Use the shift slider to decrypt the Caesar Cipher block and reveal the vault credentials.";
            
            // Message: "ACCESS_GRANTED" ciphered by shift 5
            // ACCESS_GRANTED -> FHHJVV_LWFSYJI (or simple caesar)
            // Let's use simple Caesar: A+5=F, C+5=H, E+5=J, S+5=X, G+5=L, R+5=W, A+5=F, N+5=S, T+5=Y, E+5=J, D+5=I
            // ACCESS_GRANTED -> FHHJVX_LWFSYJI
            this.heist.puzzleState = {
                ciphertext: "FHHJVX_LWFSYJI",
                correctShift: 5
            };

            bodyEl.innerHTML = `
                <div style="width:100%; max-width:320px; display:flex; flex-direction:column; gap:12px; font-family:'Fira Code', monospace; text-align:center;">
                    <div style="font-size:11px; color:var(--text-secondary);">Ciphertext Received:</div>
                    <div style="font-size:18px; font-weight:bold; letter-spacing:4px; color:#fff; background:#000; padding:10px; border:1px solid rgba(255,255,255,0.05); border-radius:4px;">
                        FHHJVX_LWFSYJI
                    </div>
                    <div style="font-size:11px; color:var(--text-secondary); margin-top:8px;">Decrypted Stream Output:</div>
                    <div id="heist-caesar-output" style="font-size:18px; font-weight:bold; letter-spacing:4px; color:var(--accent-coral);">
                        FHHJVX_LWFSYJI
                    </div>
                    <div style="margin-top:10px; display:flex; flex-direction:column; gap:6px;">
                        <input type="range" id="caesar-slider" min="0" max="25" value="0" style="width:100%; cursor:pointer;">
                        <div style="display:flex; justify-content:space-between; font-size:9px; color:var(--text-secondary);">
                            <span>Shift: 0</span>
                            <span id="caesar-shift-val">Shift: 0</span>
                            <span>Shift: 25</span>
                        </div>
                    </div>
                </div>
            `;

            const slider = DOM.get('#caesar-slider');
            const shiftLabel = DOM.get('#caesar-shift-val');
            const outputText = DOM.get('#heist-caesar-output');

            slider.addEventListener('input', (e) => {
                const shift = parseInt(e.target.value);
                shiftLabel.textContent = `Shift: ${shift}`;
                
                // Decode Caesar cipher
                let decoded = "";
                for (let i = 0; i < this.heist.puzzleState.ciphertext.length; i++) {
                    const char = this.heist.puzzleState.ciphertext.charAt(i);
                    if (char === '_') {
                        decoded += '_';
                    } else {
                        let code = char.charCodeAt(0) - shift;
                        if (code < 65) {
                            code = 90 - (64 - code);
                        }
                        decoded += String.fromCharCode(code);
                    }
                }
                outputText.textContent = decoded;
                if (this.soundEnabled && shift % 3 === 0) {
                    this.audio.playBleep(350 + shift * 10, 0.03);
                }
            });

        } else if (layer === 7) {
            titleEl.textContent = "Layer 7 (Application) // SQL Database Exfiltration";
            descEl.textContent = "Exfiltrate the database contents. Craft the SQL injection parameter payload that resolves query authorization check to true.";
            
            this.heist.puzzleState = {
                correctAnswer: `' OR 1=1 --`,
                options: [
                    `admin`,
                    `' OR 1=1 --`, // SQL injection
                    `passwd`,
                    `UNION SELECT null`
                ]
            };

            let html = '<div style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:320px; font-family:\'Fira Code\', monospace;">';
            html += `<div style="font-size:10px; color:var(--text-secondary); margin-bottom:4px;">SELECT * FROM credentials WHERE user = 'admin' AND pass = '<span id="heist-sql-payload-render" style="color:var(--accent-coral); font-weight:bold;">[SELECT]</span>';</div>`;
            this.heist.puzzleState.options.forEach((opt, i) => {
                html += `
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:11px; background:rgba(255,255,255,0.02); padding:8px; border:1px solid rgba(255,255,255,0.05); border-radius:4px;">
                        <input type="radio" name="sql-inj" value="${opt}" ${i===0?'checked':''}>
                        <span>Option #${i+1}: <strong>${opt}</strong></span>
                    </label>
                `;
            });
            html += '</div>';
            bodyEl.innerHTML = html;

            // Wire input updates to display preview
            const radios = bodyEl.querySelectorAll('input[type="radio"]');
            const previewSpan = DOM.get('#heist-sql-payload-render');
            
            const updatePreview = () => {
                const checked = bodyEl.querySelector('input[type="radio"]:checked');
                if (checked && previewSpan) {
                    previewSpan.textContent = checked.value;
                }
            };
            
            radios.forEach(radio => radio.addEventListener('change', updatePreview));
            updatePreview();
        }
    }

    handleTcpPress(flag) {
        const step = this.heist.puzzleState.step;
        const statusEl = DOM.get('#heist-tcp-status');
        const labelEl = DOM.get('#heist-tcp-step-label');

        if (step === 0 && flag === 'SYN-ACK') {
            this.heist.puzzleState.step = 1;
            if (statusEl) statusEl.textContent = '[ SENT: SYN-ACK ] // [ INCOMING FLAGS: ACK ]';
            if (labelEl) labelEl.textContent = '2 of 2: Awaiting Connection Acknowledgement';
            if (this.soundEnabled) this.audio.playBleep(660, 0.08, 'sine');
        } else if (step === 1 && flag === 'ACK') {
            this.heist.puzzleState.step = 2;
            if (statusEl) statusEl.textContent = '[ TIMING SEQUENCE ESTABLISHED: TCP LINK VERIFIED ]';
            if (labelEl) labelEl.textContent = 'Verification Ready';
            if (this.soundEnabled) this.audio.playSuccess();
        } else {
            // Mistake / Reset
            this.heist.puzzleState.step = 0;
            if (statusEl) statusEl.textContent = '[ ERROR: HANDSHAKE RESET ] // [ INCOMING FLAGS: SYN ]';
            if (labelEl) labelEl.textContent = '1 of 2: Awaiting SYN Response';
            if (this.soundEnabled) this.audio.playFail();
        }
    }

    verifyHeistPuzzle() {
        const layer = this.heist.currentLayer;
        const feedbackEl = DOM.get('#heist-puzzle-feedback');
        let success = false;

        if (layer === 1) {
            // Check if all angles are 0 (straight line orientation)
            const sum = this.heist.puzzleState.angles.reduce((a, b) => a + b, 0);
            success = (sum === 0);

        } else if (layer === 2) {
            const checked = DOM.get('input[name="mac-spoof"]:checked');
            success = (checked && checked.value === this.heist.puzzleState.targetMac);

        } else if (layer === 3) {
            const checked = DOM.get('input[name="ip-route"]:checked');
            success = (checked && checked.value === this.heist.puzzleState.correctGateway);

        } else if (layer === 4) {
            success = (this.heist.puzzleState.step === 2);

        } else if (layer === 5) {
            const checked = DOM.get('input[name="session-tok"]:checked');
            success = (checked && checked.value === this.heist.puzzleState.correctToken);

        } else if (layer === 6) {
            const slider = DOM.get('#caesar-slider');
            success = (slider && parseInt(slider.value) === this.heist.puzzleState.correctShift);

        } else if (layer === 7) {
            const checked = DOM.get('input[name="sql-inj"]:checked');
            success = (checked && checked.value === this.heist.puzzleState.correctAnswer);
        }

        if (success) {
            if (feedbackEl) {
                feedbackEl.textContent = '[ VERIFICATION SUCCESSFUL ]';
                feedbackEl.style.color = '#00FF66';
            }
            if (this.soundEnabled) {
                this.audio.playSuccess();
            }

            // Unlock next layer
            if (this.heist.currentLayer === this.heist.maxUnlocked && this.heist.maxUnlocked < 7) {
                this.heist.maxUnlocked++;
            }

            // Prompt user to go to next floor
            setTimeout(() => {
                if (this.heist.currentLayer < 7) {
                    this.heist.currentLayer++;
                    this.loadHeistLayerPuzzle();
                } else {
                    // Game won!
                    this.loadHeistVictoryScreen();
                }
            }, 1200);

        } else {
            if (feedbackEl) {
                feedbackEl.textContent = '[ FAILED: PAYLOAD INTEGRITY CORRUPTED ]';
                feedbackEl.style.color = '#FF3366';
            }
            if (this.soundEnabled) {
                this.audio.playFail();
            }
        }
    }

    loadHeistVictoryScreen() {
        const bodyEl = DOM.get('#heist-puzzle-body');
        const titleEl = DOM.get('#heist-puzzle-title');
        const descEl = DOM.get('#heist-puzzle-instruction');
        const submitBtn = DOM.get('#heist-puzzle-submit');

        if (titleEl) titleEl.textContent = "HEIST SUCCESSFUL // SYSTEM ACCESS GRANTED";
        if (descEl) descEl.textContent = "You successfully bypassed all security checks from Layer 1 to Layer 7 and exfiltrated the critical system files!";
        if (submitBtn) submitBtn.style.display = 'none';

        if (bodyEl) {
            bodyEl.innerHTML = `
                <div style="text-align: center; font-family:'Fira Code', monospace; padding: 2rem;">
                    <div style="font-size: 40px; color:#00FF66; animation: pulse 1s infinite alternate; margin-bottom: 20px;">🔓 ACCESS GRANTED</div>
                    <div style="font-size:11px; color:var(--text-secondary); line-height: 1.5;">
                        Subnet: ADYU Corp (10.0.4.0/24)<br>
                        Files Exfiltrated: credentials.db, internal_routing_table.txt<br>
                        Status: Mission Complete
                    </div>
                    <button id="btn-heist-restart" class="game-hud-btn" style="margin-top: 20px;">Restart Heist Operation</button>
                </div>
            `;

            DOM.get('#btn-heist-restart').addEventListener('click', () => {
                this.heist.currentLayer = 1;
                this.heist.maxUnlocked = 1;
                this.loadHeistScreen();
            });
        }
    }

    /* --- DESTRUCTOR --- */
    destroy() {
        this.stopCourierLoop();
        this.audio.destroy();
    }
}

// Bind to window globally
window.OsiGame = OsiGame;

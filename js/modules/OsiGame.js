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
            headersCollected: [],
            dialogueActive: false,
            dialogueSlideIndex: 0,
            dialogueTimeout: null
        };

        // Cyber Heist Puzzle State
        this.heist = {
            currentLayer: 1, // 1 to 7
            maxUnlocked: 1,
            solved: false,
            puzzleState: {}
        };

        // Port Connector Game State
        this.portsGame = {
            canvas: null,
            ctx: null,
            animationFrame: null,
            score: 0,
            lives: 3,
            isGameOver: false,
            isVictory: false,
            cables: [],
            sockets: [],
            spawnTimer: 0,
            activeDragCable: null,
            mousePos: { x: 0, y: 0 },
            currentMnemonic: ""
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
                    /* Dialogue Layout & Animations */
                    .dialogue-container {
                        display: flex;
                        gap: 1.5rem;
                        background: rgba(3, 3, 4, 0.6);
                        border: 1px solid rgba(255, 255, 255, 0.05);
                        border-radius: 8px;
                        padding: 1.5rem;
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        position: relative;
                        overflow: hidden;
                        margin-top: 10px;
                        animation: fadeIn 0.4s ease-out;
                        width: 100%;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .packy-avatar-box {
                        width: 90px;
                        height: 90px;
                        background: rgba(255, 255, 255, 0.02);
                        border: 1px solid rgba(255, 255, 255, 0.08);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                        flex-shrink: 0;
                        box-shadow: 0 0 15px rgba(235, 89, 57, 0.1);
                        animation: breathe 3s ease-in-out infinite alternate;
                    }
                    @keyframes breathe {
                        0% { transform: translateY(0px) scale(1); }
                        100% { transform: translateY(-4px) scale(1.02); }
                    }
                    .dialogue-bubble {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                        gap: 12px;
                    }
                    /* Encapsulation Stack Styles */
                    .encap-stack-container {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-wrap: wrap;
                        gap: 6px;
                        min-height: 45px;
                        padding: 10px;
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 4px;
                        border: 1px dashed rgba(255, 255, 255, 0.05);
                        margin: 10px 0;
                    }
                    .encap-block {
                        padding: 4px 10px;
                        font-family: 'Fira Code', monospace;
                        font-size: 11px;
                        font-weight: bold;
                        border-radius: 3px;
                        text-transform: uppercase;
                        box-shadow: 0 0 6px rgba(255,255,255,0.05);
                        animation: slideIn 0.3s ease-out;
                    }
                    .encap-block.header {
                        background: #00FF66;
                        color: #0b0b0c;
                        border: 1px solid #00FF66;
                    }
                    .encap-block.payload {
                        background: var(--accent-coral);
                        color: #fff;
                        border: 1px solid var(--accent-coral);
                        box-shadow: 0 0 10px rgba(235, 89, 57, 0.3);
                    }
                    .encap-block.bits {
                        background: transparent;
                        color: #00FF66;
                        border: 1px solid rgba(0, 255, 102, 0.3);
                        font-size: 10px;
                        letter-spacing: 1px;
                        box-shadow: 0 0 8px rgba(0, 255, 102, 0.2);
                    }
                    @keyframes slideIn {
                        from { transform: scale(0.8); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
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
                        <button id="game-btn-mode-ports" class="game-hud-btn">3. Port Connector</button>
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
        this.btnPorts = DOM.get('#game-btn-mode-ports');
        this.screenMount = DOM.get('#game-screen-mount');

        // Nav click events
        this.btnSound.addEventListener('click', () => this.toggleSound());
        this.btnMenu.addEventListener('click', () => this.switchMode('menu'));
        this.btnCourier.addEventListener('click', () => this.switchMode('courier'));
        this.btnHeist.addEventListener('click', () => this.switchMode('heist'));
        this.btnPorts.addEventListener('click', () => this.switchMode('ports'));

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
        // Halt any ongoing animation cycles and keyboard listeners
        this.stopCourierLoop();
        this.stopPortsLoop();
        this.removeKeyboardListener();

        this.courier.dialogueActive = false;
        this.courier.dialogueSlideIndex = 0;
        if (this.courier.dialogueTimeout) {
            clearTimeout(this.courier.dialogueTimeout);
            this.courier.dialogueTimeout = null;
        }

        // Manage active button styles
        [this.btnMenu, this.btnCourier, this.btnHeist, this.btnPorts].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        if (mode === 'menu' && this.btnMenu) this.btnMenu.classList.add('active');
        if (mode === 'courier' && this.btnCourier) this.btnCourier.classList.add('active');
        if (mode === 'heist' && this.btnHeist) this.btnHeist.classList.add('active');
        if (mode === 'ports' && this.btnPorts) this.btnPorts.classList.add('active');

        this.currentMode = mode;
        
        if (mode === 'menu') {
            this.loadMenuScreen();
        } else if (mode === 'courier') {
            this.loadCourierScreen();
        } else if (mode === 'heist') {
            this.loadHeistScreen();
        } else if (mode === 'ports') {
            this.loadPortsScreen();
        }

        if (this.soundEnabled) {
            this.audio.playBleep(520, 0.06);
        }
    }

    /* --- MENU SCREEN --- */
    loadMenuScreen() {
        this.screenMount.innerHTML = `
            <div style="text-align: center; max-width: 760px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
                <h3 style="font-family: 'Clash Grotesk', sans-serif; font-size: 2rem; color: var(--accent-coral); text-transform: uppercase; margin: 0;">Choose Your Operation</h3>
                <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; max-width: 550px; margin: 0 auto;">
                    Explore the Open Systems Interconnection (OSI) model and TCP/UDP port mapping through three interactive paths. Enable sound for an 8-bit retro arcade experience.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap;">
                    <div class="panel" style="flex: 1; min-width: 200px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 1.2rem; border-radius: 4px; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                        <h4 style="text-transform: uppercase; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary); margin: 0;">1. Packet Courier</h4>
                        <span style="font-size: 11px; color: var(--text-secondary); min-height: 48px;">Pilot Packy down the tracks. Collect headers (AH-DH) and serialize into physical bits.</span>
                        <button id="menu-btn-launch-courier" class="game-hud-btn" style="background: var(--accent-coral); color: white; border-color: var(--accent-coral);">Run Courier</button>
                    </div>
                    <div class="panel" style="flex: 1; min-width: 200px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 1.2rem; border-radius: 4px; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                        <h4 style="text-transform: uppercase; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary); margin: 0;">2. Cyber Heist</h4>
                        <span style="font-size: 11px; color: var(--text-secondary); min-height: 48px;">Infiltrate ADYU Corp. Solve 7 cybersecurity networking puzzles (one for each layer).</span>
                        <button id="menu-btn-launch-heist" class="game-hud-btn" style="background: var(--accent-coral); color: white; border-color: var(--accent-coral);">Start Heist</button>
                    </div>
                    <div class="panel" style="flex: 1; min-width: 200px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 1.2rem; border-radius: 4px; display: flex; flex-direction: column; gap: 10px; align-items: center;">
                        <h4 style="text-transform: uppercase; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary); margin: 0;">3. Port Connector</h4>
                        <span style="font-size: 11px; color: var(--text-secondary); min-height: 48px;">Connect service plugs (HTTP, SSH) into their laptop port sockets. Memorize with mnemonics.</span>
                        <button id="menu-btn-launch-ports" class="game-hud-btn" style="background: var(--accent-coral); color: white; border-color: var(--accent-coral);">Practice Ports</button>
                    </div>
                </div>
            </div>
        `;

        DOM.get('#menu-btn-launch-courier').addEventListener('click', () => this.switchMode('courier'));
        DOM.get('#menu-btn-launch-heist').addEventListener('click', () => this.switchMode('heist'));
        DOM.get('#menu-btn-launch-ports').addEventListener('click', () => this.switchMode('ports'));
    }

    /* --- COURIER ARCADE MODE --- */
    loadCourierScreen() {
        this.removeKeyboardListener();
        this.screenMount.innerHTML = `
            <div style="text-align: left; max-width: 550px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; font-family: 'Satoshi', sans-serif;">
                <h3 style="font-family: 'Clash Grotesk', sans-serif; font-size: 1.6rem; color: var(--accent-coral); text-transform: uppercase; margin: 0; letter-spacing: 0.05em;">
                    Operation: Packet Courier
                </h3>
                
                <div style="font-size: 13px; line-height: 1.6; color: var(--text-secondary); display: flex; flex-direction: column; gap: 12px;">
                    <p style="margin: 0;">
                        <strong>What are we?</strong><br>
                        You are <strong>\"Packy\"</strong>, a data packet traveling down the local system's network stack, preparing to be transmitted across the internet.
                    </p>
                    <p style="margin: 0;">
                        <strong>Objective:</strong><br>
                        Safely package your payload by descending through all <strong>7 layers of the OSI model</strong> (from Layer 7: Application down to Layer 1: Physical).
                    </p>
                    <ul style="list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: 8px; margin: 0;">
                        <li style="display: flex; align-items: start; gap: 8px;">
                            <span style="color: #00FF66;">🟢</span>
                            <span><strong style="color: #00FF66; text-transform: uppercase;">Do:</strong> Collect the green headers for the current layer (e.g., <strong>AH</strong> for Application, <strong>PH</strong> for Presentation) to advance your transmission progress to 100%.</span>
                        </li>
                        <li style="display: flex; align-items: start; gap: 8px;">
                            <span style="color: #FF3366;">🔴</span>
                            <span><strong style="color: #FF3366; text-transform: uppercase;">Avoid:</strong> Red obstacle blocks representing network hazards (like <code>DROP</code>, <code>OVERFLOW</code>, or <code>NOISE</code>) which will drop your packet and terminate the run.</span>
                        </li>
                    </ul>
                    <p style="margin: 0;">
                        <strong>Controls:</strong><br>
                        Press <strong>W / S</strong> or the <strong>Up / Down Arrow Keys</strong> on your keyboard to switch lanes. You can also click the virtual buttons on-screen.
                    </p>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 0.5rem;">
                    <button id="briefing-btn-start" class="game-hud-btn" style="background: var(--accent-coral); color: white; border-color: var(--accent-coral); padding: 10px 24px;">Start Transmission</button>
                    <button id="briefing-btn-back" class="game-hud-btn" style="padding: 10px 20px;">Back to Menu</button>
                </div>
            </div>
        `;

        DOM.get('#briefing-btn-start').addEventListener('click', () => {
            this.runCourierArcade();
        });
        DOM.get('#briefing-btn-back').addEventListener('click', () => {
            this.switchMode('menu');
        });
    }

    runCourierArcade() {
        this.removeKeyboardListener();
        this.courier.score = 0;
        this.courier.distance = 0;
        this.courier.currentLayer = 7;
        this.courier.layerProgress = 0;
        this.courier.isGameOver = false;
        this.courier.isVictory = false;
        this.courier.speed = 4;
        this.courier.obstacles = [];
        this.courier.collectibles = [];
        this.courier.headersCollected = [];
        this.courier.player.track = 1;
        this.courier.player.y = 130;
        this.courier.player.targetY = 130;
        this.courier.dialogueActive = false;
        this.courier.dialogueSlideIndex = 0;
        this.courier.particles = [];
        if (this.courier.dialogueTimeout) {
            clearTimeout(this.courier.dialogueTimeout);
            this.courier.dialogueTimeout = null;
        }

        this.screenMount.innerHTML = `
            <div style="display: flex; flex-direction: column; width: 100%; height: 100%; position: relative; padding: 1rem;">
                
                <!-- Game HUD -->
                <div style="display: flex; justify-content: space-between; font-family: 'Fira Code', monospace; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 8px; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>LAYER: <strong id="courier-hud-layer" style="color: var(--accent-coral);">7 (Application)</strong></div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>PROGRESS:</span>
                        <div style="width: 80px; height: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; display: inline-block;">
                            <div id="courier-hud-progress-fill" style="width: 0%; height: 100%; background: var(--accent-coral); transition: width 0.1s;"></div>
                        </div>
                        <span id="courier-hud-progress-pct">0%</span>
                    </div>
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

    getDialogueSlides() {
        return [
            {
                title: "Journey Commencement",
                speaker: "Packy",
                expression: "happy",
                text: "Hey there, pilot! I am Packy, your networking courier! 🚀 You did it—you helped me navigate through all 7 layers of the network stack to be transmitted! But do you know what we actually just did? Let's trace my epic journey from raw application clicks to physical pulses traveling under the ocean!",
                stack: ["payload"]
            },
            {
                title: "Layer 7: Application Layer",
                speaker: "Packy",
                expression: "happy",
                text: "It all started in Layer 7, the Application Layer, right where you interact with the software! When you clicked 'Start Transmission', I was born as raw Application data (HTTP payload). To mark my birth and specify what the server needs to do, we stamped me with the Application Header (AH). We successfully encapsulated the first layer!",
                stack: ["AH", "payload"]
            },
            {
                title: "Layer 6: Presentation Layer",
                speaker: "Packy",
                expression: "curious",
                text: "Next, we descended into Layer 6, the Presentation Layer. This is the translator of the network. Raw HTTP payload is often bloated or insecure. Here, my body was standardized into common UTF-8 formatting, compressed to save bandwidth, and encrypted with SSL/TLS keys to block hackers. Stamped with the Presentation Header (PH), we dodged the static electromagnetic NOISE that would scramble my syntax!",
                stack: ["PH", "AH", "payload"]
            },
            {
                title: "Layer 5: Session Layer",
                speaker: "Packy",
                expression: "happy",
                text: "Down we went to Layer 5, the Session Layer, the coordinator of the chat. Think of it like establishing a phone call. We appended the Session Header (SH) to establish, manage, and terminate the connection session between your client browser and the target server. This keeps our dialogue synchronized and guards against connection TIMEOUTS that would drop the call!",
                stack: ["SH", "PH", "AH", "payload"]
            },
            {
                title: "Layer 4: Transport Layer",
                speaker: "Packy",
                expression: "dizzy",
                text: "Things got segmentary at Layer 4, the Transport Layer! If a data stream is too big, this layer chops it up into smaller packets. We stamped the Transport Header (TH), selecting TCP as our transmission protocol. TH holds sequence numbers for ordered reassembly and source/destination port numbers (like port 443 for secure HTTPS). We dodged the TCP Buffer OVERFLOWS here!",
                stack: ["TH", "SH", "PH", "AH", "payload"]
            },
            {
                title: "Layer 3: Network Layer",
                speaker: "Packy",
                expression: "worried",
                text: "We reached Layer 3, the Network Layer—the global router! Now segmented, I needed to know how to travel across the internet. This layer packed me inside an IP datagram and stamped the Network Header (NH), containing your machine's source IP and the server's target IP. This is where physical routers inspected my NH to prevent routing loops (which trigger DROP hazards) and direct me toward the destination!",
                stack: ["NH", "TH", "SH", "PH", "AH", "payload"]
            },
            {
                title: "Layer 2: Data Link Layer",
                speaker: "Packy",
                expression: "happy",
                text: "Almost there! Layer 2, the Data Link Layer, prepared me for local hardware transit. We framed me into an Ethernet frame by attaching the Data Link Header (DH). This header specifies physical MAC addresses: your network card's MAC and the next-hop hardware device (like your router or switch). This local node-to-node framing helped us bypass local switch collision drops!",
                stack: ["DH", "NH", "TH", "SH", "PH", "AH", "payload"]
            },
            {
                title: "Layer 1: Physical Layer",
                speaker: "Packy",
                expression: "celebrate",
                text: "Finally, we hit Layer 1, the Physical Layer! Here, my frame structure was converted and serialized into raw BITS (1s and 0s). These bits were pulsed as electric voltages down copper lines, laser flashes down fiber-optic cables, or radio waves through the air. The journey was complete! 🌎✨",
                stack: ["bits"]
            },
            {
                title: "Journey Complete!",
                speaker: "Packy",
                expression: "celebrate",
                text: "And that is how a simple request turns into physical pulses traversing the globe! Together, we traveled from the user interface down to the physical wire. Thank you for being such an awesome pilot! Let's check out our final scorecard!",
                stack: ["bits"]
            }
        ];
    }

    drawPackyAvatarSvg(expression) {
        let eyesHtml = '';
        let mouthHtml = '';
        
        if (expression === 'happy') {
            eyesHtml = `
                <path d="M 22 38 Q 28 30 34 38" stroke="var(--accent-coral)" stroke-width="3" stroke-linecap="round" fill="none" />
                <path d="M 56 38 Q 62 30 68 38" stroke="var(--accent-coral)" stroke-width="3" stroke-linecap="round" fill="none" />
            `;
            mouthHtml = `<path d="M 38 50 Q 45 57 52 50" stroke="var(--accent-coral)" stroke-width="3" stroke-linecap="round" fill="none" />`;
        } else if (expression === 'curious') {
            eyesHtml = `
                <circle cx="28" cy="36" r="3.5" fill="#00FF66" />
                <path d="M 55 32 L 65 36" stroke="#00FF66" stroke-width="3" stroke-linecap="round" />
                <circle cx="60" cy="38" r="3.5" fill="#00FF66" />
            `;
            mouthHtml = `<circle cx="45" cy="52" r="3" fill="#00FF66" />`;
        } else if (expression === 'dizzy') {
            eyesHtml = `
                <path d="M 23 32 L 31 40 M 31 32 L 23 40" stroke="#FF3366" stroke-width="3" stroke-linecap="round" />
                <path d="M 57 32 L 65 40 M 65 32 L 57 40" stroke="#FF3366" stroke-width="3" stroke-linecap="round" />
            `;
            mouthHtml = `<path d="M 36 53 Q 41 47 46 53 T 56 53" stroke="#FF3366" stroke-width="2.5" stroke-linecap="round" fill="none" />`;
        } else if (expression === 'worried') {
            eyesHtml = `
                <path d="M 22 36 L 34 33" stroke="#e2e2e8" stroke-width="2.5" stroke-linecap="round" />
                <circle cx="28" cy="40" r="3" fill="#e2e2e8" />
                <path d="M 56 33 L 68 36" stroke="#e2e2e8" stroke-width="2.5" stroke-linecap="round" />
                <circle cx="62" cy="40" r="3" fill="#e2e2e8" />
            `;
            mouthHtml = `<path d="M 38 54 Q 45 46 52 54" stroke="#e2e2e8" stroke-width="3" stroke-linecap="round" fill="none" />`;
        } else if (expression === 'celebrate') {
            eyesHtml = `
                <path d="M 22 36 Q 28 28 34 36 Q 28 44 22 36 Z" fill="#00FF66" />
                <path d="M 56 36 Q 62 28 68 36 Q 62 44 56 36 Z" fill="#00FF66" />
            `;
            mouthHtml = `<path d="M 34 48 Q 45 60 56 48 Z" fill="#00FF66" />`;
        }

        const strokeColor = expression === 'dizzy' ? '#FF3366' : (expression === 'curious' ? '#00FF66' : 'var(--accent-coral)');

        return `
            <svg width="80" height="80" viewBox="0 0 90 90" style="display: block;">
                <defs>
                    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="rgba(255,255,255,0.06)" />
                        <stop offset="100%" stop-color="rgba(255,255,255,0.01)" />
                    </linearGradient>
                </defs>
                <rect x="5" y="15" width="80" height="60" rx="10" ry="10" fill="url(#avatarGrad)" stroke="${strokeColor}" stroke-width="2.5" style="filter: drop-shadow(0 0 6px ${strokeColor}44);" />
                
                <line x1="25" y1="15" x2="25" y2="8" stroke="${strokeColor}" stroke-width="2" />
                <circle cx="25" cy="7" r="2" fill="${strokeColor}" />
                <line x1="65" y1="15" x2="65" y2="8" stroke="${strokeColor}" stroke-width="2" />
                <circle cx="65" cy="7" r="2" fill="${strokeColor}" />

                <circle cx="15" cy="25" r="2.5" fill="#00FF66" style="opacity: 0.8;" />
                <circle cx="75" cy="25" r="2.5" fill="#FF3366" style="opacity: 0.8;" />

                <g>
                    ${eyesHtml}
                    ${mouthHtml}
                </g>
            </svg>
        `;
    }

    typewriterDialogueText(targetId, fullText, callback) {
        if (this.courier.dialogueTimeout) {
            clearTimeout(this.courier.dialogueTimeout);
        }

        const el = DOM.get(`#${targetId}`);
        if (!el) return;
        el.innerHTML = '';
        
        let index = 0;
        const type = () => {
            if (!this.courier.dialogueActive) return;
            if (index < fullText.length) {
                const char = fullText[index++];
                el.innerHTML += char;
                if (this.soundEnabled && index % 3 === 0 && char !== ' ') {
                    this.audio.playBleep(350, 0.03, 'sine');
                }
                this.courier.dialogueTimeout = setTimeout(type, 18);
            } else {
                this.courier.dialogueTimeout = null;
                if (callback) callback();
            }
        };
        type();
    }

    drawEncapsulationStackHtml(stackArray) {
        if (!stackArray || stackArray.length === 0) return '';
        
        if (stackArray.includes('bits')) {
            return `
                <div class="encap-block bits" style="animation: pulse 1s infinite alternate;">
                    01000011 01011001 01000012 01000101 01010010 01010010 01010101 01001110
                </div>
            `;
        }

        return stackArray.map(item => {
            if (item === 'payload') {
                return `<div class="encap-block payload">DATA</div>`;
            } else {
                return `<div class="encap-block header">${item}</div>`;
            }
        }).join('<span style="color:rgba(255,255,255,0.3); font-size:10px; font-weight:bold;">&lt;</span>');
    }

    showCourierDialogueStep(slideIndex) {
        const slides = this.getDialogueSlides();
        if (slideIndex < 0 || slideIndex >= slides.length) {
            this.showCourierChronicleVictoryScreen();
            return;
        }

        this.courier.dialogueSlideIndex = slideIndex;
        const slide = slides[slideIndex];

        this.screenMount.innerHTML = `
            <div style="width: 100%; max-width: 580px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; font-family: 'Satoshi', sans-serif;">
                <h3 style="font-family: 'Clash Grotesk', sans-serif; font-size: 1.3rem; color: #00FF66; text-transform: uppercase; margin: 0; letter-spacing: 0.05em; display: flex; align-items: center; justify-content: space-between;">
                    <span>📂 Transmission Success // Narrative</span>
                    <span style="font-family: monospace; font-size: 11px; color: var(--text-secondary);">${slideIndex + 1} / ${slides.length}</span>
                </h3>
                
                <div class="dialogue-container">
                    <div class="packy-avatar-box">
                        ${this.drawPackyAvatarSvg(slide.expression)}
                    </div>
                    <div class="dialogue-bubble">
                        <div style="font-family: 'Clash Grotesk', sans-serif; font-size: 12px; font-weight: bold; color: var(--accent-coral); text-transform: uppercase; letter-spacing: 0.05em;">
                            ${slide.speaker} (${slide.title})
                        </div>
                        <div id="dialogue-text-content" style="color: var(--text-primary); font-size: 12px; line-height: 1.6; min-height: 90px; font-family: 'Satoshi', sans-serif;">
                        </div>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="font-family: monospace; font-size: 10px; color: var(--text-secondary); text-transform: uppercase; font-weight: bold; text-align: center;">
                        Active Encapsulation Stack:
                    </div>
                    <div class="encap-stack-container">
                        ${this.drawEncapsulationStackHtml(slide.stack)}
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 12px; margin-top: 0.5rem;">
                    <button id="dialogue-btn-skip" class="game-hud-btn" style="color: var(--text-secondary); border-color: rgba(255,255,255,0.05);">Skip Dialogue</button>
                    <div style="display: flex; gap: 8px;">
                        <button id="dialogue-btn-back" class="game-hud-btn" ${slideIndex === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>◀ Back</button>
                        <button id="dialogue-btn-next" class="game-hud-btn" style="background: var(--accent-coral); color: white; border-color: var(--accent-coral); min-width: 80px;">
                            ${slideIndex === slides.length - 1 ? 'Finish 🏁' : 'Next ▶'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.typewriterDialogueText('dialogue-text-content', slide.text);

        DOM.get('#dialogue-btn-skip').addEventListener('click', () => {
            this.courier.dialogueActive = false;
            if (this.courier.dialogueTimeout) clearTimeout(this.courier.dialogueTimeout);
            this.showCourierChronicleVictoryScreen();
        });

        if (slideIndex > 0) {
            DOM.get('#dialogue-btn-back').addEventListener('click', () => {
                this.showCourierDialogueStep(slideIndex - 1);
            });
        }

        DOM.get('#dialogue-btn-next').addEventListener('click', () => {
            this.showCourierDialogueStep(slideIndex + 1);
        });
    }

    loadCourierVictoryScreen() {
        this.stopCourierLoop();
        this.removeKeyboardListener();

        this.courier.isVictory = true;
        this.courier.dialogueActive = true;

        if (this.soundEnabled) {
            this.audio.playSuccess();
        }

        this.showCourierDialogueStep(0);
    }

    showCourierChronicleVictoryScreen() {
        this.screenMount.innerHTML = `
            <div style="text-align: left; width: 100%; max-width: 580px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; font-family: 'Satoshi', sans-serif;">
                <h3 style="font-family: 'Clash Grotesk', sans-serif; font-size: 1.8rem; color: #00FF66; text-transform: uppercase; margin: 0; letter-spacing: 0.05em; display: flex; align-items: center; gap: 10px;">
                    🔓 Transaction Success // Packet Delivered!
                </h3>
                
                <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.6; margin: 0;">
                    Congratulations! You successfully piloted <strong>Packy</strong> through the entire network stack. Here is the chronicle of how your data was wrapped, routed, and serialized:
                </p>

                <!-- Scrollable Journey Container -->
                <div style="max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 8px; border: 1px solid rgba(255,255,255,0.05); background: #030304; padding: 12px; border-radius: 4px;">
                    
                    <!-- L7 -->
                    <div style="border-left: 2px solid var(--accent-coral); padding-left: 10px;">
                        <h4 style="font-size: 12px; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary); margin: 0 0 4px 0; text-transform: uppercase;">
                            Layer 7: Application <span style="color: #00FF66; font-family: monospace; font-size: 10px; margin-left: 6px;">[AH ATTACHED]</span>
                        </h4>
                        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            Packy was initialized at the User Interface. You gathered the raw HTTP application data and stamped the **Application Header (AH)** to initiate the request payload.
                        </p>
                    </div>

                    <!-- L6 -->
                    <div style="border-left: 2px solid var(--accent-coral); padding-left: 10px;">
                        <h4 style="font-size: 12px; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary); margin: 0 0 4px 0; text-transform: uppercase;">
                            Layer 6: Presentation <span style="color: #00FF66; font-family: monospace; font-size: 10px; margin-left: 6px;">[PH ATTACHED]</span>
                        </h4>
                        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            Packy entered the translation layer. The raw data was standardized, compressed, and encrypted (using SSL/TLS keys), adding the **Presentation Header (PH)**.
                        </p>
                    </div>

                    <!-- L5 -->
                    <div style="border-left: 2px solid var(--accent-coral); padding-left: 10px;">
                        <h4 style="font-size: 12px; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary); margin: 0 0 4px 0; text-transform: uppercase;">
                            Layer 5: Session <span style="color: #00FF66; font-family: monospace; font-size: 10px; margin-left: 6px;">[SH ATTACHED]</span>
                        </h4>
                        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            To manage dialogue checkpoints, Packy established a logical session connection with the target server, appending the **Session Header (SH)**.
                        </p>
                    </div>

                    <!-- L4 -->
                    <div style="border-left: 2px solid var(--accent-coral); padding-left: 10px;">
                        <h4 style="font-size: 12px; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary); margin: 0 0 4px 0; text-transform: uppercase;">
                            Layer 4: Transport <span style="color: #00FF66; font-family: monospace; font-size: 10px; margin-left: 6px;">[TH ATTACHED]</span>
                        </h4>
                        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            Packy's stream was segmented, and the **Transport Header (TH)** set target TCP ports (e.g. 443) and sequence numbers to guarantee ordered delivery.
                        </p>
                    </div>

                    <!-- L3 -->
                    <div style="border-left: 2px solid var(--accent-coral); padding-left: 10px;">
                        <h4 style="font-size: 12px; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary); margin: 0 0 4px 0; text-transform: uppercase;">
                            Layer 3: Network <span style="color: #00FF66; font-family: monospace; font-size: 10px; margin-left: 6px;">[NH ATTACHED]</span>
                        </h4>
                        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            Packy was packed inside an IP datagram. Stamping source and destination IP addresses, the **Network Header (NH)** enabled routing across network hops.
                        </p>
                    </div>

                    <!-- L2 -->
                    <div style="border-left: 2px solid var(--accent-coral); padding-left: 10px;">
                        <h4 style="font-size: 12px; font-family: 'Clash Grotesk', sans-serif; color: var(--text-primary); margin: 0 0 4px 0; text-transform: uppercase;">
                            Layer 2: Data Link <span style="color: #00FF66; font-family: monospace; font-size: 10px; margin-left: 6px;">[DH ATTACHED]</span>
                        </h4>
                        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            Packy was framed. The **Data Link Header (DH)** was attached, adding target physical MAC addresses to hop from node to node on the local switch.
                        </p>
                    </div>

                    <!-- L1 -->
                    <div style="border-left: 2px solid #00FF66; padding-left: 10px;">
                        <h4 style="font-size: 12px; font-family: 'Clash Grotesk', sans-serif; color: #00FF66; margin: 0 0 4px 0; text-transform: uppercase;">
                            Layer 1: Physical <span style="color: #00FF66; font-family: monospace; font-size: 10px; margin-left: 6px;">[BITS SERIALIZED]</span>
                        </h4>
                        <p style="font-size: 11px; color: var(--text-secondary); margin: 0; line-height: 1.5;">
                            Physical Layer reached! The entire structured frame was serialized into raw electric voltages and light pulses (**BITS**), traveling down wire boundaries.
                        </p>
                    </div>

                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; margin-top: 0.2rem;">
                    <div style="font-family: 'Fira Code', monospace; font-size: 12px; color: var(--text-secondary);">
                        Final Score: <strong style="color: #00FF66;">${this.courier.score}</strong>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="victory-btn-replay" class="game-hud-btn" style="background: var(--accent-coral); color: white; border-color: var(--accent-coral); padding: 8px 16px;">Run Again</button>
                        <button id="victory-btn-menu" class="game-hud-btn" style="padding: 8px 16px;">Main Menu</button>
                    </div>
                </div>
            </div>
        `;

        DOM.get('#victory-btn-replay').addEventListener('click', () => {
            this.runCourierArcade();
        });
        DOM.get('#victory-btn-menu').addEventListener('click', () => {
            this.switchMode('menu');
        });
    }

    /* --- PORT CONNECTOR MODE --- */
    loadPortsScreen() {
        this.removeKeyboardListener();
        this.screenMount.innerHTML = `
            <div style="text-align: left; max-width: 550px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; font-family: 'Satoshi', sans-serif;">
                <h3 style="font-family: 'Clash Grotesk', sans-serif; font-size: 1.6rem; color: var(--accent-coral); text-transform: uppercase; margin: 0; letter-spacing: 0.05em;">
                    Operation: Port Connector
                </h3>
                
                <div style="font-size: 13px; line-height: 1.6; color: var(--text-secondary); display: flex; flex-direction: column; gap: 12px;">
                    <p style="margin: 0;">
                        <strong>What are we doing?</strong><br>
                        We are mapping logical request cables (HTTP, SSH, DNS, FTP) to their matching numbered port sockets on the motherboard.
                    </p>
                    <p style="margin: 0;">
                        <strong>Objective:</strong><br>
                        Drag the falling cable plugs and connect them to their correct port numbers. Reach <strong>1000 points</strong> to win!
                    </p>
                    <ul style="list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: 8px; margin: 0;">
                        <li style="display: flex; align-items: start; gap: 8px;">
                            <span style="color: #00FF66;">🟢</span>
                            <span><strong>Correct Plug:</strong> Connect cables to the matching ports to score <strong>+100 pts</strong> and learn the port mnemonic.</span>
                        </li>
                        <li style="display: flex; align-items: start; gap: 8px;">
                            <span style="color: #FF3366;">🔴</span>
                            <span><strong>Hazards:</strong> Do not plug into the wrong port, and do not let cables touch the bottom of the screen! Doing so triggers a short-circuit and deducts a life.</span>
                        </li>
                    </ul>
                </div>

                <div style="display: flex; gap: 10px; margin-top: 0.5rem;">
                    <button id="ports-briefing-btn-start" class="game-hud-btn" style="background: var(--accent-coral); color: white; border-color: var(--accent-coral); padding: 10px 24px;">Start Operation</button>
                    <button id="ports-briefing-btn-back" class="game-hud-btn" style="padding: 10px 20px;">Back to Menu</button>
                </div>
            </div>
        `;

        DOM.get('#ports-briefing-btn-start').addEventListener('click', () => {
            this.runPortsGame();
        });
        DOM.get('#ports-briefing-btn-back').addEventListener('click', () => {
            this.switchMode('menu');
        });
    }

    runPortsGame() {
        this.removeKeyboardListener();
        this.portsGame.score = 0;
        this.portsGame.lives = 3;
        this.portsGame.isGameOver = false;
        this.portsGame.isVictory = false;
        this.portsGame.cables = [];
        this.portsGame.spawnTimer = 0;
        this.portsGame.activeDragCable = null;
        this.portsGame.clickBound = false;
        this.portsGame.currentMnemonic = "Drag and plug the falling service cables into the correct sockets!";

        const portDefinitions = [
            { label: 'FTP', port: 21, mnemonic: 'FTP is legal at age 21—transfer files freely!' },
            { label: 'SSH', port: 22, mnemonic: 'Double 2s (22) lock your remote shell connection tight!' },
            { label: 'Telnet', port: 23, mnemonic: 'Telnet (23) is an unencrypted, old-school connection!' },
            { label: 'SMTP', port: 25, mnemonic: 'Send Mail To People (SMTP) on December 25th!' },
            { label: 'DNS', port: 53, mnemonic: 'DNS translates domain names to IPs in 5.3 seconds!' },
            { label: 'HTTP', port: 80, mnemonic: 'HTTP is standard web traffic on route 80.' },
            { label: 'HTTPS', port: 443, mnemonic: 'Secure HTTPS locks down traffic on route 443!' },
            { label: 'MySQL', port: 3306, mnemonic: 'MySQL database stores data in 3,306 tables!' }
        ];

        this.portsGame.sockets = portDefinitions.map((def, idx) => {
            return {
                x: 48 + idx * 84,
                y: 200,
                label: def.label,
                port: def.port,
                mnemonic: def.mnemonic,
                radius: 18,
                isMatched: false
            };
        });

        this.screenMount.innerHTML = `
            <div style="display: flex; flex-direction: column; width: 100%; height: 100%; position: relative; padding: 0.5rem 1rem;">
                
                <!-- Port Connector HUD -->
                <div style="display: flex; justify-content: space-between; font-family: 'Fira Code', monospace; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 8px; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>OPERATION: <strong style="color: var(--accent-coral);">PORT CONNECTOR</strong></div>
                    <div>LIVES: <span id="ports-hud-lives" style="color: #FF3366; font-weight: bold;">❤❤❤</span></div>
                    <div>SCORE: <strong id="ports-hud-score" style="color: #00FF66;">0 / 1000</strong></div>
                </div>

                <!-- Canvas -->
                <div style="position: relative; width: 100%; overflow: hidden; background: #010102; border: 1px solid rgba(255,255,255,0.03); border-radius: 4px;">
                    <canvas id="ports-canvas" width="680" height="260" style="display: block; width: 100%; height: auto; outline: none; cursor: crosshair;"></canvas>
                </div>

                <!-- Mnemonic Helper panel -->
                <div id="ports-mnemonic-panel" class="panel" style="margin-top: 10px; background: #0b0b0c; border: 1px solid rgba(255,255,255,0.05); padding: 10px; font-size: 11px; line-height: 1.4; font-family: 'Satoshi', sans-serif; min-height: 48px;">
                    <span style="color: var(--accent-coral); font-weight: bold; text-transform: uppercase;">Mnemonic Aid:</span> 
                    <span id="ports-mnemonic-text">Drag and plug the falling service cables into the correct sockets!</span>
                </div>
            </div>
        `;

        this.portsGame.canvas = DOM.get('#ports-canvas');
        this.portsGame.ctx = this.portsGame.canvas.getContext('2d');

        this.setupPortsInputHandlers();
        this.startPortsLoop();
    }

    setupPortsInputHandlers() {
        const canvas = this.portsGame.canvas;
        
        const getMouseCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 680;
            const y = ((e.clientY - rect.top) / rect.height) * 260;
            return { x, y };
        };

        const handleStart = (coords) => {
            if (this.portsGame.isGameOver || this.portsGame.isVictory) return;
            
            for (let i = 0; i < this.portsGame.cables.length; i++) {
                const cab = this.portsGame.cables[i];
                const dx = coords.x - cab.x;
                const dy = coords.y - cab.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 25) {
                    this.portsGame.activeDragCable = cab;
                    cab.isDragging = true;
                    cab.dragOffset = { x: dx, y: dy };
                    break;
                }
            }
        };

        const handleMove = (coords) => {
            this.portsGame.mousePos = coords;
            if (this.portsGame.activeDragCable) {
                this.portsGame.activeDragCable.x = coords.x - this.portsGame.activeDragCable.dragOffset.x;
                this.portsGame.activeDragCable.y = coords.y - this.portsGame.activeDragCable.dragOffset.y;
            }
        };

        const handleEnd = () => {
            if (!this.portsGame.activeDragCable) return;
            const cab = this.portsGame.activeDragCable;
            cab.isDragging = false;
            this.portsGame.activeDragCable = null;

            let snapMatched = false;
            for (let i = 0; i < this.portsGame.sockets.length; i++) {
                const sock = this.portsGame.sockets[i];
                const dx = cab.x - sock.x;
                const dy = cab.y - sock.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 28) {
                    if (sock.port === cab.port) {
                        snapMatched = true;
                        this.portsGame.score += 100;
                        
                        if (this.soundEnabled) {
                            this.audio.playBleep(880, 0.15, 'triangle');
                        }
                        
                        this.portsGame.currentMnemonic = `[CORRECT!] Port ${sock.port} (${sock.label}): ${sock.mnemonic}`;
                        const txtEl = DOM.get('#ports-mnemonic-text');
                        if (txtEl) txtEl.textContent = sock.mnemonic;

                        this.portsGame.cables = this.portsGame.cables.filter(c => c !== cab);
                        
                        if (this.portsGame.score >= 1000) {
                            this.triggerPortsVictory();
                        }
                    } else {
                        snapMatched = true;
                        this.portsGame.lives--;
                        this.triggerPortsShortCircuit(cab, `Mismatch! Connected ${cab.label} to Port ${sock.port} instead of Port ${cab.port}.`);
                    }
                    break;
                }
            }

            if (!snapMatched) {
                cab.isDragging = false;
            }
        };

        canvas.addEventListener('mousedown', (e) => handleStart(getMouseCoords(e)));
        canvas.addEventListener('mousemove', (e) => handleMove(getMouseCoords(e)));
        window.addEventListener('mouseup', () => handleEnd());

        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                handleStart(getMouseCoords(e.touches[0]));
            }
        });
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                handleMove(getMouseCoords(e.touches[0]));
            }
        });
        canvas.addEventListener('touchend', () => handleEnd());
    }

    triggerPortsShortCircuit(cable, reason) {
        if (this.soundEnabled) {
            this.audio.playFail();
        }

        const txtEl = DOM.get('#ports-mnemonic-text');
        if (txtEl) {
            txtEl.innerHTML = `<span style="color:#FF3366; font-weight:bold;">⚠️ SHORT CIRCUIT!</span> ${reason}`;
        }

        this.portsGame.cables = this.portsGame.cables.filter(c => c !== cable);

        if (this.portsGame.lives <= 0) {
            this.triggerPortsGameOver();
        }
    }

    triggerPortsGameOver() {
        this.portsGame.isGameOver = true;
        if (this.soundEnabled) {
            this.audio.playExplosion();
        }
    }

    triggerPortsVictory() {
        this.portsGame.isVictory = true;
        if (this.soundEnabled) {
            this.audio.playSuccess();
        }
    }

    startPortsLoop() {
        this.stopPortsLoop();
        const loop = () => {
            this.updatePorts();
            this.drawPorts();
            this.portsGame.animationFrame = requestAnimationFrame(loop);
        };
        this.portsGame.animationFrame = requestAnimationFrame(loop);
    }

    stopPortsLoop() {
        if (this.portsGame.animationFrame) {
            cancelAnimationFrame(this.portsGame.animationFrame);
            this.portsGame.animationFrame = null;
        }
    }

    updatePorts() {
        if (this.portsGame.isGameOver || this.portsGame.isVictory) return;

        this.portsGame.spawnTimer++;
        if (this.portsGame.spawnTimer > 160) {
            this.portsGame.spawnTimer = 0;
            this.spawnPortsCable();
        }

        this.portsGame.cables.forEach((cab, idx) => {
            if (!cab.isDragging) {
                cab.y += cab.speed;
                cab.x = cab.spawnX; // align back to vertical fallback lane
                
                if (cab.y > 175) {
                    this.portsGame.lives--;
                    this.portsGame.cables.splice(idx, 1);
                    
                    if (this.soundEnabled) {
                        this.audio.playFail();
                    }

                    const txtEl = DOM.get('#ports-mnemonic-text');
                    if (txtEl) {
                        txtEl.innerHTML = `<span style="color:#FF3366; font-weight:bold;">⚠️ CABLE DROPPED!</span> ${cab.label} reached the chassis without connection (Port ${cab.port}).`;
                    }

                    if (this.portsGame.lives <= 0) {
                        this.triggerPortsGameOver();
                    }
                }
            }
        });

        const scoreEl = DOM.get('#ports-hud-score');
        const livesEl = DOM.get('#ports-hud-lives');
        if (scoreEl) scoreEl.textContent = `${this.portsGame.score} / 1000`;
        if (livesEl) {
            let hearts = '';
            for (let i = 0; i < 3; i++) {
                hearts += i < this.portsGame.lives ? '❤' : '💔';
            }
            livesEl.textContent = hearts;
        }
    }

    spawnPortsCable() {
        const index = Math.floor(Math.random() * this.portsGame.sockets.length);
        const sock = this.portsGame.sockets[index];

        if (this.portsGame.cables.some(c => c.port === sock.port)) return;

        const startX = 60 + Math.random() * 560;
        this.portsGame.cables.push({
            spawnX: startX,
            x: startX,
            y: -20,
            label: sock.label,
            port: sock.port,
            speed: 0.45 + (this.portsGame.score / 1000) * 0.3,
            isDragging: false,
            dragOffset: { x: 0, y: 0 }
        });
    }

    drawPorts() {
        const ctx = this.portsGame.ctx;
        if (!ctx) return;

        ctx.fillStyle = '#010102';
        ctx.fillRect(0, 0, 680, 260);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 680; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 260);
            ctx.stroke();
        }
        for (let j = 0; j < 260; j += 40) {
            ctx.beginPath();
            ctx.moveTo(0, j);
            ctx.lineTo(680, j);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255,255,255,0.01)';
        ctx.fillRect(0, 160, 680, 100);
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 160);
        ctx.lineTo(680, 160);
        ctx.stroke();

        this.portsGame.sockets.forEach(sock => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.strokeStyle = 'var(--text-secondary)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(sock.x, sock.y, sock.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#0b0b0c';
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(sock.x, sock.y, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#00FF66';
            ctx.beginPath();
            ctx.arc(sock.x - 7, sock.y - 7, 1.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'var(--text-primary)';
            ctx.font = 'bold 9.5px "Fira Code", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sock.port, sock.x, sock.y + 28);

            ctx.fillStyle = 'var(--text-secondary)';
            ctx.font = 'bold 8.5px "Fira Code", monospace';
            ctx.fillText(sock.label, sock.x, sock.y - 28);
        });

        this.portsGame.cables.forEach(cab => {
            ctx.strokeStyle = 'rgba(235, 89, 57, 0.35)';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(cab.spawnX, 0);
            const midY = cab.y * 0.45;
            ctx.bezierCurveTo(cab.spawnX, midY, cab.x, midY + 15, cab.x, cab.y);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cab.spawnX, 0);
            ctx.bezierCurveTo(cab.spawnX, midY, cab.x, midY + 15, cab.x, cab.y);
            ctx.stroke();

            const w = 44;
            const h = 18;
            ctx.fillStyle = 'var(--accent-coral)';
            ctx.shadowColor = 'var(--accent-coral)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(cab.x - w/2, cab.y - h/2, w, h, 4);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#FFDD00';
            ctx.fillRect(cab.x - 14, cab.y + h/2, 3, 3);
            ctx.fillRect(cab.x - 4, cab.y + h/2, 3, 3);
            ctx.fillRect(cab.x + 6, cab.y + h/2, 3, 3);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px "Fira Code", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cab.label, cab.x, cab.y);
        });

        if (this.portsGame.isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, 680, 260);

            ctx.fillStyle = '#FF3366';
            ctx.font = 'bold 24px "Clash Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('SHORT CIRCUIT / GAME OVER', 340, 110);

            ctx.fillStyle = '#e2e2e8';
            ctx.font = '12px "Fira Code", monospace';
            ctx.fillText('Port sockets integrity lost. Try again to build memory!', 340, 145);

            this.drawOverlayButtonPorts('RESTART OPERATION', 340, 180);
        }

        if (this.portsGame.isVictory) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, 680, 260);

            ctx.fillStyle = '#00FF66';
            ctx.font = 'bold 24px "Clash Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('PORT MASTER // MEMORY CAPTURED!', 340, 100);

            ctx.fillStyle = '#e2e2e8';
            ctx.font = '12px "Fira Code", monospace';
            ctx.fillText('Congratulations! You correctly mapped all TCP/UDP connections!', 340, 135);

            this.drawOverlayButtonPorts('CONTINUE TO MENU', 340, 175);
        }
    }

    drawOverlayButtonPorts(text, x, y) {
        const ctx = this.portsGame.ctx;
        const w = 180;
        const h = 30;

        const mx = this.portsGame.mousePos.x;
        const my = this.portsGame.mousePos.y;
        const isHover = mx >= x - w/2 && mx <= x + w/2 && my >= y - h/2 && my <= y + h/2;

        ctx.fillStyle = isHover ? 'var(--accent-coral)' : 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = 'var(--accent-coral)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x - w/2, y - h/2, w, h, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isHover ? '#fff' : 'var(--text-primary)';
        ctx.font = 'bold 10px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);

        if (!this.portsGame.clickBound) {
            this.portsGame.clickBound = true;
            this.portsGame.canvas.addEventListener('click', (e) => {
                if (!this.portsGame.isGameOver && !this.portsGame.isVictory) return;
                const rect = this.portsGame.canvas.getBoundingClientRect();
                const clickX = ((e.clientX - rect.left) / rect.width) * 680;
                const clickY = ((e.clientY - rect.top) / rect.height) * 260;

                if (clickX >= 340 - w/2 && clickX <= 340 + w/2 && clickY >= y - h/2 && clickY <= y + h/2) {
                    if (this.soundEnabled) {
                        this.audio.playBleep(600, 0.06);
                    }
                    if (this.portsGame.isGameOver) {
                        this.runPortsGame();
                    } else if (this.portsGame.isVictory) {
                        this.switchMode('menu');
                    }
                }
            });
        }
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
    }

    removeKeyboardListener() {
        if (this.keyboardHandler) {
            window.removeEventListener('keydown', this.keyboardHandler);
            this.keyboardHandler = null;
        }
    }

    updateCourier() {
        if (this.courier.isGameOver || this.courier.isVictory) return;

        // Smooth Lerp Y position of player
        this.courier.player.y += (this.courier.player.targetY - this.courier.player.y) * 0.2;

        // Spawn and update trailing trail particles
        if (!this.courier.particles) this.courier.particles = [];
        this.courier.particles.push({
            x: this.courier.player.x - this.courier.player.size / 2,
            y: this.courier.player.y + (Math.random() - 0.5) * 8,
            size: Math.random() * 3 + 2,
            opacity: 1
        });
        this.courier.particles.forEach(p => {
            p.x -= this.courier.speed * 0.7;
            p.opacity -= 0.04;
        });
        this.courier.particles = this.courier.particles.filter(p => p.opacity > 0 && p.x > 0);

        // Update progress distance (cap at 50 to prevent modulo rollover and hold 100% until transition)
        if (this.courier.distance < 50) {
            this.courier.distance += 0.15;
        }
        this.courier.layerProgress = Math.min(100, Math.floor((this.courier.distance / 50) * 100));

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

        // Check if header is missing near the end of progress
        const reqHeader = this.getLayerHeaderName(this.courier.currentLayer);
        const hasHeader = this.courier.headersCollected.includes(reqHeader) || reqHeader === 'BITS' || reqHeader === 'NONE';
        
        if (this.courier.layerProgress > 70 && !hasHeader) {
            const tipEl = DOM.get('#courier-layer-tip');
            if (tipEl) {
                tipEl.innerHTML = `<span style="color:#FF3366; font-weight:bold;">⚠️ HEADER MISSING!</span> You MUST collect the green <strong>${reqHeader}</strong> header block! Without it, you cannot transition, and the progress bar will loop back to 0!`;
            }
        }

        // Layer Progression logic
        if (this.courier.layerProgress >= 100) {
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
                    this.loadCourierVictoryScreen();
                }
            }
        }

        // Update DOM stats
        const scoreDiv = DOM.get('#courier-hud-score');
        const headersDiv = DOM.get('#courier-hud-headers');
        const layerDiv = DOM.get('#courier-hud-layer');
        const progressFill = DOM.get('#courier-hud-progress-fill');
        const progressPct = DOM.get('#courier-hud-progress-pct');
        
        if (scoreDiv) scoreDiv.textContent = this.courier.score;
        if (headersDiv) {
            headersDiv.textContent = this.courier.headersCollected.length > 0 
                ? `[ ${this.courier.headersCollected.join(' -> ')} ]` 
                : '[None]';
        }
        if (layerDiv) layerDiv.textContent = `${this.courier.currentLayer} (${this.getLayerName(this.courier.currentLayer)})`;
        if (progressFill) progressFill.style.width = `${this.courier.layerProgress}%`;
        if (progressPct) progressPct.textContent = `${this.courier.layerProgress}%`;
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

        // Draw Collectibles (Header Tags)
        this.courier.collectibles.forEach(col => {
            const w = col.size * 1.8;
            const h = col.size * 1.0;
            ctx.fillStyle = '#00FF66';
            ctx.shadowColor = '#00FF66';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(col.x - w/2, col.y - h/2, w, h, 4);
            ctx.fill();

            // Label
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#0b0b0c';
            ctx.font = 'bold 9.5px "Fira Code", monospace';
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

        // Draw trailing particles
        if (this.courier.particles) {
            this.courier.particles.forEach(p => {
                ctx.fillStyle = `rgba(235, 89, 57, ${p.opacity})`; // var(--accent-coral)
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Draw Player ("Packy")
        const px = this.courier.player.x;
        const py = this.courier.player.y;
        const ps = this.courier.player.size;

        // Draw Antennas
        ctx.strokeStyle = 'var(--accent-coral)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - 5, py - ps/2);
        ctx.lineTo(px - 5, py - ps/2 - 4);
        ctx.moveTo(px + 5, py - ps/2);
        ctx.lineTo(px + 5, py - ps/2 - 4);
        ctx.stroke();

        ctx.fillStyle = 'var(--accent-coral)';
        ctx.beginPath();
        ctx.arc(px - 5, py - ps/2 - 5, 2, 0, Math.PI * 2);
        ctx.arc(px + 5, py - ps/2 - 5, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw Packet Body (rounded glassmorphic rect with neon outline)
        ctx.strokeStyle = 'var(--accent-coral)';
        ctx.fillStyle = 'rgba(235, 89, 57, 0.18)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = 'var(--accent-coral)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(px - ps/2, py - ps/2, ps, ps, 5);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Face inside Packet
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px - 4, py - 2, 2.5, 0, Math.PI * 2); // Left Eye
        ctx.arc(px + 4, py - 2, 2.5, 0, Math.PI * 2); // Right Eye
        ctx.fill();

        // Mouth (small smile)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py + 2, 3, 0, Math.PI);
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
                    this.runCourierArcade();
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
        this.stopPortsLoop();
        this.removeKeyboardListener();
        this.audio.destroy();
    }
}

// Bind to window globally
window.OsiGame = OsiGame;

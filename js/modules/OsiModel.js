// OSI Model Simulator Module
// Implements PDU encapsulation, routing logic, and LIFO decapsulation.

class OsiModel {
    constructor() {
        this.currentProtocol = 'UDP'; // TCP, UDP, ICMP
        this.currentStepIndex = 0;
        this.steps = [];
        this.isRunning = false;
        this.autoPlayInterval = null;
        this.playSpeed = 1500; // default speed in ms

        // Packet state
        this.packet = {
            payload: "DATA: Hello World",
            headers: [] // Pushed LIFO: [ {name: 'AH', val: '...'}, ... ]
        };

        // Static Layer descriptions & issues solved (derived directly from textbook pages 3, 4, 5)
        this.layerInfo = {
            7: {
                name: "Application",
                abbr: "AH",
                pduName: "APDU",
                fullName: "Application Header",
                pduFullName: "Application Protocol Data Unit",
                desc: "Contains a variety of protocols that are commonly needed (e.g., HTTP, SMTP, FTP, DNS).",
                issues: "Provides file transfer services, electronic mail access, remote job entries, directory access, and handles different incompatibilities between file systems."
            },
            6: {
                name: "Presentation",
                abbr: "PH",
                pduName: "PPDU",
                fullName: "Presentation Header",
                pduFullName: "Presentation Protocol Data Unit",
                desc: "Manages the syntax and semantics of the information exchanged.",
                issues: "Encodes data in standard agreed-upon ways. Handles character or numbers translation, data encryption/decryption for security, and compression to reduce size."
            },
            5: {
                name: "Session",
                abbr: "SH",
                pduName: "SPDU",
                fullName: "Session Header",
                pduFullName: "Session Protocol Data Unit",
                desc: "Allows users on different machines to establish sessions between them.",
                issues: "Provides Dialog Control (managing whose turn it is to transmit), Token Management (preventing conflicts on critical operations), and Synchronization (inserting check points to resume after crashes)."
            },
            4: {
                name: "Transport",
                abbr: "TH",
                pduName: "TPDU",
                fullName: "Transport Header",
                pduFullName: "Transport Protocol Data Unit (Segment)",
                desc: "Accepts data from the session layer, splits it up into smaller units if needed, and passes them to the network layer.",
                issues: "True end-to-end connection. Solves multiplexing several network connections onto one connection (reducing costs), implements flow control, and guarantees delivery regardless of the subnet state."
            },
            3: {
                name: "Network",
                abbr: "NH",
                pduName: "Packet",
                fullName: "Network Header",
                pduFullName: "Network Protocol Data Unit (Packet)",
                desc: "Controls the operations of the subnet to determine how data is delivered from source to destination.",
                issues: "Determines physical routing paths (routing mechanism), controls congestion (traffic control), manages accounting, and allows interconnection of heterogeneous (different) networks."
            },
            2: {
                name: "Data Link",
                abbr: "DH",
                pduName: "Frame",
                fullName: "Data Link Header",
                pduFullName: "Data Link Protocol Data Unit (Frame)",
                desc: "Transforms a raw transmission facility into a line that appears free of undetected transmission errors to the network layer.",
                issues: "Solves frame boundaries (attaching special bit patterns to start/end of frames), recovers damaged/lost/duplicate frames, and implements flow control to prevent fast senders from drowning slow receivers."
            },
            1: {
                name: "Physical",
                abbr: "Bits",
                pduName: "Bits",
                fullName: "Physical Raw Stream",
                pduFullName: "Physical Layer Raw Bitstream",
                desc: "Transmits raw bitstreams over a physical communication channel.",
                issues: "Deals with mechanical, electrical, and procedural interfaces, transmission medium specifications, and encoding signal bits (0s and 1s) representing voltage pulses."
            }
        };
    }

    render() {
        return DOM.create(`
            <div class="module-section gap-lg" style="display: flex; flex-direction: column; gap: 1.5rem; color: #e2e2e8; font-family: 'Satoshi', sans-serif;">
                <div class="panel" style="background: #0b0b0c; border: 1px solid rgba(183, 171, 152, 0.15); padding: 1.5rem; border-radius: var(--radius-sm);">
                    
                    <!-- TOP SIMULATOR CONFIGURATION BAR -->
                    <div class="panel-header" style="border-bottom: 1px solid rgba(183, 171, 152, 0.1); padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h2 class="panel-title" style="font-size: 1.4rem; letter-spacing: 0.05em; color: var(--text-primary); text-transform: uppercase; font-family: 'Clash Grotesk', sans-serif;">
                                OSI Layer Protocol PDU Simulator
                            </h2>
                        </div>
                        
                        <!-- Protocol Selectors -->
                        <div style="display: flex; gap: 0.5rem; align-items: center; background: #060607; padding: 4px; border: 1px solid rgba(255,255,255,0.05); border-radius: 4px;">
                            <button id="osi-proto-udp" class="btn btn-proto active" style="padding: 6px 12px; font-size: 10px; border: none; cursor: pointer; background: var(--accent-coral); color: #fff; font-weight: bold; text-transform: uppercase;">UDP</button>
                            <button id="osi-proto-tcp" class="btn btn-proto" style="padding: 6px 12px; font-size: 10px; border: none; cursor: pointer; background: transparent; color: var(--text-secondary); font-weight: bold; text-transform: uppercase;">TCP</button>
                            <button id="osi-proto-icmp" class="btn btn-proto" style="padding: 6px 12px; font-size: 10px; border: none; cursor: pointer; background: transparent; color: var(--text-secondary); font-weight: bold; text-transform: uppercase;">ICMP (Ping)</button>
                        </div>
                    </div>

                    <!-- CENTRAL WORKSPACE LAYOUT -->
                    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: stretch;">
                        
                        <!-- LEFT STACK FLOW (VISUAL REPRESENTATION BASED ON TEXTBOOK DIAGRAM) -->
                        <div class="panel" style="flex: 2; min-width: 480px; background: #060607; border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
                            <!-- Scanline CRT Effect Overlay -->
                            <div style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%); background-size: 100% 4px; z-index: 5;"></div>
                            
                            <!-- Subnet and Peer Boundary Lines Labeled -->
                            <div style="text-align: center; color: var(--accent-taupe); font-size: 10px; text-transform: uppercase; font-family: 'Fira Code', monospace; letter-spacing: 0.1em; margin-bottom: 1.2rem;">
                                Physical Transmission Subnet Medium
                            </div>

                            <div style="position: relative; display: grid; grid-template-columns: 1fr 0.8fr 1fr; gap: 10px; min-height: 420px; align-items: stretch;">
                                
                                <!-- HOST A (Source) -->
                                <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 6px; z-index: 2;">
                                    <div style="text-align: center; font-weight: bold; font-size: 11px; text-transform: uppercase; color: var(--text-primary); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">Host A (Sender)</div>
                                    <div id="osi-layer-a-7" class="osi-layer-node" data-layer="7" data-host="A"><span>7. Application</span><small>APDU</small></div>
                                    <div id="osi-layer-a-6" class="osi-layer-node" data-layer="6" data-host="A"><span>6. Presentation</span><small>PPDU</small></div>
                                    <div id="osi-layer-a-5" class="osi-layer-node" data-layer="5" data-host="A"><span>5. Session</span><small>SPDU</small></div>
                                    <div id="osi-layer-a-4" class="osi-layer-node" data-layer="4" data-host="A"><span>4. Transport</span><small>TPDU</small></div>
                                    <div id="osi-layer-a-3" class="osi-layer-node" data-layer="3" data-host="A"><span>3. Network</span><small>Packet</small></div>
                                    <div id="osi-layer-a-2" class="osi-layer-node" data-layer="2" data-host="A"><span>2. Data Link</span><small>Frame</small></div>
                                    <div id="osi-layer-a-1" class="osi-layer-node" data-layer="1" data-host="A"><span>1. Physical</span><small>Bits</small></div>
                                </div>

                                <!-- ROUTER (Communication Subnet Boundary) -->
                                <div style="display: flex; flex-direction: column; justify-content: flex-end; gap: 6px; background: rgba(183, 171, 152, 0.02); border: 1px dashed rgba(183, 171, 152, 0.15); padding: 8px; border-radius: 4px; z-index: 2;">
                                    <div style="text-align: center; font-weight: bold; font-size: 10px; text-transform: uppercase; color: var(--accent-taupe); margin-bottom: auto; line-height: 1.3;">Subnet<br>Router</div>
                                    <div id="osi-layer-r-3" class="osi-layer-node" data-layer="3" data-host="R" style="height: 48px;"><span>3. Network</span><small>Packet</small></div>
                                    <div id="osi-layer-r-2" class="osi-layer-node" data-layer="2" data-host="R" style="height: 48px;"><span>2. Data Link</span><small>Frame</small></div>
                                    <div id="osi-layer-r-1" class="osi-layer-node" data-layer="1" data-host="R" style="height: 48px;"><span>1. Physical</span><small>Bits</small></div>
                                </div>

                                <!-- HOST B (Destination) -->
                                <div style="display: flex; flex-direction: column; justify-content: space-between; gap: 6px; z-index: 2;">
                                    <div style="text-align: center; font-weight: bold; font-size: 11px; text-transform: uppercase; color: var(--text-primary); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">Host B (Receiver)</div>
                                    <div id="osi-layer-b-7" class="osi-layer-node" data-layer="7" data-host="B"><span>7. Application</span><small>APDU</small></div>
                                    <div id="osi-layer-b-6" class="osi-layer-node" data-layer="6" data-host="B"><span>6. Presentation</span><small>PPDU</small></div>
                                    <div id="osi-layer-b-5" class="osi-layer-node" data-layer="5" data-host="B"><span>5. Session</span><small>SPDU</small></div>
                                    <div id="osi-layer-b-4" class="osi-layer-node" data-layer="4" data-host="B"><span>4. Transport</span><small>TPDU</small></div>
                                    <div id="osi-layer-b-3" class="osi-layer-node" data-layer="3" data-host="B"><span>3. Network</span><small>Packet</small></div>
                                    <div id="osi-layer-b-2" class="osi-layer-node" data-layer="2" data-host="B"><span>2. Data Link</span><small>Frame</small></div>
                                    <div id="osi-layer-b-1" class="osi-layer-node" data-layer="1" data-host="B"><span>1. Physical</span><small>Bits</small></div>
                                </div>

                                <!-- SVG overlay for Peer boundaries and links (mimicking dashed arrows in diagram) -->
                                <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;">
                                    <!-- Logical Peer boundaries (Dashed horizontal lines) -->
                                    <line x1="28%" y1="9.5%" x2="72%" y2="9.5%" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" stroke-width="1" />
                                    <line x1="28%" y1="23.5%" x2="72%" y2="23.5%" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" stroke-width="1" />
                                    <line x1="28%" y1="37.5%" x2="72%" y2="37.5%" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" stroke-width="1" />
                                    <line x1="28%" y1="51.5%" x2="72%" y2="51.5%" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" stroke-width="1" />
                                    
                                    <!-- Flow connections -->
                                    <!-- Host A L1 to Router L1 -->
                                    <path d="M 120 405 H 220" fill="none" stroke="rgba(235, 89, 57, 0.15)" stroke-dasharray="4,4" stroke-width="1.5" />
                                    <!-- Router L1 to Host B L1 -->
                                    <path d="M 280 405 H 380" fill="none" stroke="rgba(235, 89, 57, 0.15)" stroke-dasharray="4,4" stroke-width="1.5" />
                                </svg>
                            </div>
                        </div>

                        <!-- RIGHT INFO / STATUS MONITOR & PDU GROWING WRAPPER -->
                        <div style="flex: 1.5; min-width: 320px; display: flex; flex-direction: column; gap: 1rem;">
                            
                            <!-- PDU DYNAMIC STRUCTURE ("PACKET GROWTH" PANEL) -->
                            <div class="panel" style="background: #060607; border: 1px solid rgba(255,255,255,0.05); padding: 1.2rem;">
                                <h3 style="font-size: 0.9rem; font-weight: bold; letter-spacing: 0.05em; text-transform: uppercase; color: var(--accent-taupe); margin-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px;">
                                    Protocol Data Unit (PDU) Structure
                                </h3>
                                
                                <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px; font-family: 'Fira Code', monospace;">
                                    Unit: <strong id="osi-pdu-title" style="color: #ffffff;">Data (Payload)</strong>
                                </div>

                                <!-- Dynamic Box Container representing PDU frame growth -->
                                <div id="osi-pdu-container" style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center; justify-content: center; min-height: 80px; background: #000; padding: 12px; border: 1px solid rgba(255,255,255,0.03); border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 10px;">
                                    <!-- Header elements injected dynamically here -->
                                </div>
                                <div style="font-size: 9px; color: var(--text-secondary); text-align: center; margin-top: 6px;">
                                    * Click on any segment block above to view details.
                                </div>
                            </div>

                            <!-- EDUCATIONAL COMMENTARY PANEL -->
                            <div class="panel" style="background: #060607; border: 1px solid rgba(255,255,255,0.05); padding: 1.2rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <div id="osi-info-title" style="font-family: 'Clash Grotesk', sans-serif; font-size: 1.1rem; font-weight: bold; color: var(--accent-coral); margin-bottom: 8px; text-transform: uppercase;">
                                        Application Layer
                                    </div>
                                    <div id="osi-info-desc" style="font-size: 0.9rem; line-height: 1.5; color: var(--text-primary); margin-bottom: 12px;">
                                        Waiting to start the simulation flow...
                                    </div>
                                    <div id="osi-info-issues-box" style="background: rgba(183,171,152,0.02); border-left: 2px solid var(--accent-tau); padding: 8px; font-size: 0.8rem; line-height: 1.4; color: var(--text-secondary); border-left-color: var(--accent-taupe);">
                                        <strong>Key Issues Solved:</strong> <span id="osi-info-issues">Select a layer or start step sequence to see issues.</span>
                                    </div>
                                </div>
                                
                                <!-- Simulation Live Monitor Terminal -->
                                <div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
                                    <div style="font-size: 10px; font-family: 'Fira Code', monospace; color: #00FF66; background: #030304; padding: 8px; border-radius: 2px; text-shadow: 0 0 3px rgba(0,255,102,0.3); border: 1px solid rgba(255,255,255,0.02);">
                                        <span style="color: var(--accent-taupe); font-weight: bold;">[TERMINAL MONITOR]</span>
                                        <div id="osi-terminal-text" style="margin-top: 4px; line-height: 1.3;">Simulation idle. Press Step Forward to execute.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- CONTROL BAR PANEL -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; border-top: 1px solid rgba(183, 171, 152, 0.1); padding-top: 1rem; flex-wrap: wrap; gap: 1rem;">
                        <!-- Step Navigation -->
                        <div style="display: flex; gap: 0.5rem;">
                            <button id="osi-btn-prev" class="btn btn-secondary" style="padding: 8px 16px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Step Back</button>
                            <button id="osi-btn-next" class="btn btn-primary" style="padding: 8px 16px; font-size: 11px; font-weight: bold; text-transform: uppercase; background: var(--accent-coral); border-color: var(--accent-coral); color: #fff;">Step Forward</button>
                            <button id="osi-btn-reset" class="btn btn-secondary" style="padding: 8px 16px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Reset</button>
                        </div>
                        
                        <!-- Auto Play Controls -->
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <button id="osi-btn-play" class="btn btn-secondary" style="padding: 8px 16px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Auto Play</button>
                            <select id="osi-play-speed" class="input-text" style="background: #0d0d0d; border: 1px solid rgba(255,255,255,0.1); color: var(--text-primary); font-size: 11px; outline: none; padding: 6px; font-family: 'Satoshi', sans-serif; cursor: pointer; border-radius: 4px;">
                                <option value="2000">1.0x Speed (Slow)</option>
                                <option value="1200" selected>1.5x Speed (Normal)</option>
                                <option value="600">2.5x Speed (Fast)</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>
        `);
    }

    init() {
        // Wire protocol selection buttons
        this.btnUdp = DOM.get('#osi-proto-udp');
        this.btnTcp = DOM.get('#osi-proto-tcp');
        this.btnIcmp = DOM.get('#osi-proto-icmp');

        // Play/Step buttons
        this.btnPrev = DOM.get('#osi-btn-prev');
        this.btnNext = DOM.get('#osi-btn-next');
        this.btnReset = DOM.get('#osi-btn-reset');
        this.btnPlay = DOM.get('#osi-btn-play');
        this.speedSelector = DOM.get('#osi-play-speed');

        // Content fields
        this.pduContainer = DOM.get('#osi-pdu-container');
        this.pduTitle = DOM.get('#osi-pdu-title');
        this.infoTitle = DOM.get('#osi-info-title');
        this.infoDesc = DOM.get('#osi-info-desc');
        this.infoIssues = DOM.get('#osi-info-issues');
        this.terminalText = DOM.get('#osi-terminal-text');

        // Layer Nodes List
        this.layerNodes = document.querySelectorAll('.osi-layer-node');

        // Setup Event Listeners for Protocols
        if (this.btnUdp) {
            this.btnUdp.addEventListener('click', () => this.selectProtocol('UDP'));
        }
        if (this.btnTcp) {
            this.btnTcp.addEventListener('click', () => this.selectProtocol('TCP'));
        }
        if (this.btnIcmp) {
            this.btnIcmp.addEventListener('click', () => this.selectProtocol('ICMP'));
        }

        // Setup Steps
        if (this.btnPrev) {
            this.btnPrev.addEventListener('click', () => this.stepBackward());
        }
        if (this.btnNext) {
            this.btnNext.addEventListener('click', () => this.stepForward());
        }
        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => this.resetSimulation());
        }
        if (this.btnPlay) {
            this.btnPlay.addEventListener('click', () => this.toggleAutoPlay());
        }
        if (this.speedSelector) {
            this.speedSelector.addEventListener('change', (e) => {
                this.playSpeed = parseInt(e.target.value);
                if (this.isRunning) {
                    this.stopAutoPlay();
                    this.startAutoPlay();
                }
            });
        }

        // Initialize node list style handlers
        this.layerNodes.forEach(node => {
            node.style.cssText = 'height: 42px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); display: flex; flex-direction: column; justify-content: center; padding: 0 10px; border-radius: 4px; transition: all 0.3s ease; cursor: pointer; position: relative;';
            const span = node.querySelector('span');
            if (span) span.style.cssText = 'font-size: 11px; font-weight: bold; color: var(--text-primary); text-transform: uppercase;';
            const small = node.querySelector('small');
            if (small) small.style.cssText = 'font-size: 9px; color: var(--text-secondary); font-family: "Fira Code", monospace;';

            node.addEventListener('click', () => {
                const layer = parseInt(node.getAttribute('data-layer'));
                this.displayLayerDetail(layer);
            });
        });

        // Setup Simulation Steps based on protocol selection
        this.buildStepMatrix();
        this.updateUI();
    }

    selectProtocol(protocol) {
        if (this.isRunning) this.stopAutoPlay();
        this.currentProtocol = protocol;

        // Toggle active button style
        [this.btnUdp, this.btnTcp, this.btnIcmp].forEach(btn => {
            if (btn) {
                btn.style.background = 'transparent';
                btn.style.color = 'var(--text-secondary)';
            }
        });

        const activeBtn = protocol === 'UDP' ? this.btnUdp : (protocol === 'TCP' ? this.btnTcp : this.btnIcmp);
        if (activeBtn) {
            activeBtn.style.background = 'var(--accent-coral)';
            activeBtn.style.color = '#fff';
        }

        this.resetSimulation();
    }

    buildStepMatrix() {
        this.steps = [];

        // 1. TCP HANDSHAKE PHASE
        if (this.currentProtocol === 'TCP') {
            this.steps.push({
                host: 'A', layer: 4, action: 'handshake', name: 'SYN',
                terminal: 'TCP Handshake (1/3): Host A sends connection request segment [SYN] to Host B.',
                desc: 'Client initiates connection by sending a SYN (Synchronize) sequence segment from Host A Transport layer down to the network and across to Host B.',
                pdu: ['SYN']
            });
            this.steps.push({
                host: 'B', layer: 4, action: 'handshake', name: 'SYN-ACK',
                terminal: 'TCP Handshake (2/3): Host B responds with [SYN-ACK] segment back to Host A.',
                desc: 'Server acknowledges the request by sending back a SYN-ACK segment from Host B Transport layer, verifying connection availability.',
                pdu: ['SYN-ACK']
            });
            this.steps.push({
                host: 'A', layer: 4, action: 'handshake', name: 'ACK',
                terminal: 'TCP Handshake (3/3): Host A sends final [ACK] segment. Three-Way Handshake established!',
                desc: 'Client receives the response and replies with an ACK (Acknowledge) segment. A reliable virtual link is now established between processes.',
                pdu: ['ACK']
            });
        }

        // 2. ENCAPSULATION PHASE (Host A: L7 down to L1)
        if (this.currentProtocol !== 'ICMP') {
            this.steps.push({
                host: 'A', layer: 7, action: 'encap',
                terminal: 'Host A Layer 7: User writes data payload. Appends AH (Application Header). PDU: APDU.',
                desc: this.layerInfo[7].desc,
                pdu: ['AH', 'Data']
            });
            this.steps.push({
                host: 'A', layer: 6, action: 'encap',
                terminal: 'Host A Layer 6: Formatting payload parameters. Appends PH (Presentation Header). PDU: PPDU.',
                desc: this.layerInfo[6].desc,
                pdu: ['PH', 'AH', 'Data']
            });
            this.steps.push({
                host: 'A', layer: 5, action: 'encap',
                terminal: 'Host A Layer 5: Establishing dialogue stream session. Appends SH (Session Header). PDU: SPDU.',
                desc: this.layerInfo[5].desc,
                pdu: ['SH', 'PH', 'AH', 'Data']
            });
            this.steps.push({
                host: 'A', layer: 4, action: 'encap',
                terminal: 'Host A Layer 4: Segmenting data and binding Ports (443 -> 80). Appends TH (Transport Header). PDU: TPDU.',
                desc: this.layerInfo[4].desc,
                pdu: ['TH', 'SH', 'PH', 'AH', 'Data']
            });
        } else {
            // ICMP starts at Layer 3
            this.steps.push({
                host: 'A', layer: 3, action: 'encap',
                terminal: 'Host A Layer 3: ICMP Ping Echo Request created. Appends NH (Network Header). PDU: Packet.',
                desc: 'ICMP is a Network-layer protocol. Ping Echo Request contains type 8 control code and target parameters.',
                pdu: ['NH', 'Ping Request']
            });
        }

        // Common L3 and L2 encapsulation
        if (this.currentProtocol !== 'ICMP') {
            this.steps.push({
                host: 'A', layer: 3, action: 'encap',
                terminal: 'Host A Layer 3: Routing IP addresses bound (192.168.1.10 -> 10.0.0.50). Appends NH (Network Header). PDU: Packet.',
                desc: this.layerInfo[3].desc,
                pdu: ['NH', 'TH', 'SH', 'PH', 'AH', 'Data']
            });
        }
        
        // Data Link appends both Header (DH) and Trailer (DT)
        const framePdu = this.currentProtocol === 'ICMP' ? 
            ['DH', 'NH', 'Ping Request', 'DT'] : 
            ['DH', 'NH', 'TH', 'SH', 'PH', 'AH', 'Data', 'DT'];
            
        this.steps.push({
            host: 'A', layer: 2, action: 'encap',
            terminal: 'Host A Layer 2: Adding MAC hardware boundaries and CRC checksum. Appends DH (Data Link Header) & DT (Trailer). PDU: Frame.',
            desc: this.layerInfo[2].desc,
            pdu: framePdu
        });

        this.steps.push({
            host: 'A', layer: 1, action: 'transmit',
            terminal: 'Host A Layer 1: Frame serialized to bits on physical interface card. Transmitting over subnet...',
            desc: this.layerInfo[1].desc,
            pdu: ['01011001_Bits']
        });

        // 3. ROUTING SUB-FLOW (Router L1 -> L3 -> L1)
        this.steps.push({
            host: 'R', layer: 1, action: 'receive',
            terminal: 'Router Layer 1: Interface detects active line voltage and gathers incoming bits.',
            desc: 'The router receives raw binary stream values from Host A over the physical transmission medium.',
            pdu: ['01011001_Bits']
        });

        const routerFramePdu = this.currentProtocol === 'ICMP' ? 
            ['DH', 'NH', 'Ping Request', 'DT'] : 
            ['DH', 'NH', 'TH', 'SH', 'PH', 'AH', 'Data', 'DT'];

        this.steps.push({
            host: 'R', layer: 2, action: 'route',
            terminal: 'Router Layer 2: Parses Frame boundary, validates CRC checksum, and strips MAC Header (DH) for inspection.',
            desc: 'The router verifies the hardware MAC address. If MAC matches, it removes the link header to pass the network packet upward.',
            pdu: routerFramePdu
        });
        
        const routerPacketPdu = this.currentProtocol === 'ICMP' ? 
            ['NH', 'Ping Request'] : 
            ['NH', 'TH', 'SH', 'PH', 'AH', 'Data'];

        this.steps.push({
            host: 'R', layer: 3, action: 'route',
            terminal: 'Router Layer 3: Network interface inspects Destination IP (10.0.0.50) and determines Next Hop routing table match.',
            desc: 'Router Network Layer analyzes the Destination IP to decide the outgoing interface. It modifies TTL (Time to Live) and plans routing path.',
            pdu: routerPacketPdu
        });
        
        this.steps.push({
            host: 'R', layer: 2, action: 'route',
            terminal: 'Router Layer 2: Prepares output Frame. Appends new DH (MAC Header) and new DT (checksum trailer) for outbound link.',
            desc: 'The router rebuilds a brand new link frame, appending its own source MAC and the next-hop hardware destination address.',
            pdu: routerFramePdu
        });
        
        this.steps.push({
            host: 'R', layer: 1, action: 'transmit',
            terminal: 'Router Layer 1: Serializes the updated frame and transmits bits onto outbound physical media line.',
            desc: 'Router converts outgoing frame bytes to raw electrical signals transmitting towards Host B.',
            pdu: ['11001010_Bits']
        });

        // 4. DECAPSULATION PHASE (Host B: L1 up to L7/L3)
        this.steps.push({
            host: 'B', layer: 1, action: 'receive',
            terminal: 'Host B Layer 1: Recieves physical bits stream. Reconstructing frame bytes.',
            desc: this.layerInfo[1].desc,
            pdu: ['11001010_Bits']
        });

        this.steps.push({
            host: 'B', layer: 2, action: 'decap',
            terminal: 'Host B Layer 2: Checks CRC trailer. Success! Stripping DH (Header) and DT (Trailer). PDU: Packet.',
            desc: this.layerInfo[2].desc,
            pdu: routerFramePdu
        });

        if (this.currentProtocol === 'ICMP') {
            // ICMP only goes up to L3 of Host B and then rebounds
            this.steps.push({
                host: 'B', layer: 3, action: 'decap',
                terminal: 'Host B Layer 3: ICMP Ping Echo Request received! Initiating Echo Reply bounce back to Host A.',
                desc: 'Host B identifies the Network-layer packet as an Echo Request. It swaps Source IP (Host B) and Destination IP (Host A) to begin reply flow.',
                pdu: ['NH', 'Ping Reply']
            });
            // Rebound flow - Host B (L3 -> L1)
            this.steps.push({
                host: 'B', layer: 2, action: 'encap',
                terminal: 'Host B Layer 2: Encapsulating ICMP Reply. Appends DH (Header) & DT (Trailer). PDU: Frame.',
                desc: this.layerInfo[2].desc,
                pdu: ['DH', 'NH', 'Ping Reply', 'DT']
            });
            this.steps.push({
                host: 'B', layer: 1, action: 'transmit',
                terminal: 'Host B Layer 1: Transmitting bits stream representing Ping Echo Reply...',
                desc: this.layerInfo[1].desc,
                pdu: ['00111100_Bits']
            });
            // Router Return Journey
            this.steps.push({
                host: 'R', layer: 1, action: 'receive',
                terminal: 'Router Layer 1: Interface detects incoming Echo Reply bitstream.',
                desc: 'Router gathers bit stream for the return route path.',
                pdu: ['00111100_Bits']
            });
            this.steps.push({
                host: 'R', layer: 2, action: 'route',
                terminal: 'Router Layer 2: Validates frame checksum. Strips DH/DT link layers.',
                desc: 'Router unpacks returning frame.',
                pdu: ['DH', 'NH', 'Ping Reply', 'DT']
            });
            this.steps.push({
                host: 'R', layer: 3, action: 'route',
                terminal: 'Router Layer 3: Network routes Echo Reply back to Host A IP (192.168.1.10).',
                desc: 'IP routing table selects Host A local interface.',
                pdu: ['NH', 'Ping Reply']
            });
            this.steps.push({
                host: 'R', layer: 2, action: 'route',
                terminal: 'Router Layer 2: Appends link headers for Host A segment path.',
                desc: 'Re-encapsulates return path.',
                pdu: ['DH', 'NH', 'Ping Reply', 'DT']
            });
            this.steps.push({
                host: 'R', layer: 1, action: 'transmit',
                terminal: 'Router Layer 1: Transmits return path bits towards Host A.',
                desc: 'Transmits bits over physical media.',
                pdu: ['01010101_Bits']
            });
            // Host A Delivery
            this.steps.push({
                host: 'A', layer: 1, action: 'receive',
                terminal: 'Host A Layer 1: Recieves returning Ping Echo Reply bits.',
                desc: this.layerInfo[1].desc,
                pdu: ['01010101_Bits']
            });
            this.steps.push({
                host: 'A', layer: 2, action: 'decap',
                terminal: 'Host A Layer 2: Checks CRC. Strips link layer headers.',
                desc: this.layerInfo[2].desc,
                pdu: ['DH', 'NH', 'Ping Reply', 'DT']
            });
            this.steps.push({
                host: 'A', layer: 3, action: 'decap',
                terminal: 'Host A Layer 3: ICMP Echo Reply delivered! Ping Roundtrip successful. Connection Verified.',
                desc: 'Host A processes the reply and displays roundtrip statistics. Ping sequence successfully completed.',
                pdu: ['Ping Reply Delivered']
            });
        } else {
            // TCP & UDP proceed up the stack of Host B
            this.steps.push({
                host: 'B', layer: 3, action: 'decap',
                terminal: 'Host B Layer 3: IP match verified. Stripping NH (Network Header). PDU: Transport Segment.',
                desc: this.layerInfo[3].desc,
                pdu: ['NH', 'TH', 'SH', 'PH', 'AH', 'Data']
            });
            this.steps.push({
                host: 'B', layer: 4, action: 'decap',
                terminal: 'Host B Layer 4: Destination port match (80 HTTP). Stripping TH (Transport Header). PDU: Session Data.',
                desc: this.layerInfo[4].desc,
                pdu: ['TH', 'SH', 'PH', 'AH', 'Data']
            });
            this.steps.push({
                host: 'B', layer: 5, action: 'decap',
                terminal: 'Host B Layer 5: Validating dialogue session token. Stripping SH (Session Header). PDU: Encoded Data.',
                desc: this.layerInfo[5].desc,
                pdu: ['SH', 'PH', 'AH', 'Data']
            });
            this.steps.push({
                host: 'B', layer: 6, action: 'decap',
                terminal: 'Host B Layer 6: Decoding data syntax representation. Stripping PH (Presentation Header). PDU: Application Data.',
                desc: this.layerInfo[6].desc,
                pdu: ['PH', 'AH', 'Data']
            });
            this.steps.push({
                host: 'B', layer: 7, action: 'decap',
                terminal: 'Host B Layer 7: Stripping AH (Application Header). Payload delivered to destination process!',
                desc: this.layerInfo[7].desc,
                pdu: ['AH', 'Data']
            });

            // 5. TCP ACKNOWLEDGMENT RETURN PHASE
            if (this.currentProtocol === 'TCP') {
                this.steps.push({
                    host: 'B', layer: 4, action: 'ack', name: 'DATA-ACK',
                    terminal: 'TCP Acknowledgement: Host B sends ACK segment back to Host A L4, confirming error-free reception.',
                    desc: 'A crucial TCP function: Host B sends back a segment with the ACK flag set. If Host A did not receive this ACK, it would retransmit the segment.',
                    pdu: ['DATA-ACK']
                });
            }
        }
    }

    stepForward() {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this.updateUI();
        } else {
            this.stopAutoPlay();
            this.logTerminal("Simulation completed! Press Reset to start over.");
        }
    }

    stepBackward() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.updateUI();
        }
    }

    resetSimulation() {
        this.currentStepIndex = 0;
        this.buildStepMatrix();
        this.updateUI();
        this.logTerminal(`OSI Simulator reset. Protocol: ${this.currentProtocol}. Ready to step.`);
    }

    toggleAutoPlay() {
        if (this.isRunning) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.isRunning = true;
        this.btnPlay.textContent = 'Pause Play';
        this.btnPlay.classList.replace('btn-secondary', 'btn-primary');
        this.btnPlay.style.background = 'var(--accent-coral)';
        
        this.autoPlayInterval = setInterval(() => {
            if (this.currentStepIndex < this.steps.length - 1) {
                this.stepForward();
            } else {
                this.stopAutoPlay();
            }
        }, this.playSpeed);
    }

    stopAutoPlay() {
        this.isRunning = false;
        if (this.btnPlay) {
            this.btnPlay.textContent = 'Auto Play';
            this.btnPlay.classList.replace('btn-primary', 'btn-secondary');
            this.btnPlay.style.background = 'transparent';
        }
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    updateUI() {
        const step = this.steps[this.currentStepIndex];
        if (!step) return;

        // Clear active nodes styling
        this.layerNodes.forEach(node => {
            node.style.borderColor = 'rgba(255,255,255,0.06)';
            node.style.background = 'rgba(255,255,255,0.02)';
            node.style.boxShadow = 'none';
        });

        // Highlight active layer node in stack
        const activeNodeId = `#osi-layer-${step.host.toLowerCase()}-${step.layer}`;
        const activeNode = DOM.get(activeNodeId);
        if (activeNode) {
            activeNode.style.borderColor = 'var(--accent-coral)';
            activeNode.style.background = 'rgba(235, 89, 57, 0.12)';
            activeNode.style.boxShadow = '0 0 10px rgba(235, 89, 57, 0.2)';
        }

        // Update commentary card
        const layerMeta = this.layerInfo[step.layer];
        if (layerMeta) {
            DOM.setText(this.infoTitle, `${layerMeta.name} Layer (Layer ${step.layer})`);
            DOM.setText(this.infoDesc, step.desc || layerMeta.desc);
            DOM.setText(this.infoIssues, layerMeta.issues);
        }

        // Update PDU unit title
        let currentPduName = layerMeta ? layerMeta.pduName : 'Data';
        // TCP handshake names TPDU segment
        if (step.action === 'handshake' || step.action === 'ack') {
            currentPduName = "TCP TPDU (Segment)";
        }
        DOM.setText(this.pduTitle, `${currentPduName} (PDU)`);

        // Render Packet growing block visual panel
        this.renderPduDisplay(step);

        // Update Terminal Monitor logs text
        if (this.terminalText) {
            this.terminalText.textContent = `> ${step.terminal}`;
        }

        // Enable/Disable Step buttons limits
        if (this.btnPrev) {
            this.btnPrev.disabled = (this.currentStepIndex === 0);
        }
        if (this.btnNext) {
            this.btnNext.disabled = (this.currentStepIndex === this.steps.length - 1);
        }
    }

    renderPduDisplay(step) {
        if (!this.pduContainer) return;
        this.pduContainer.innerHTML = '';

        const segments = step.pdu || [];
        
        segments.forEach((segName, idx) => {
            const block = document.createElement('div');
            block.style.cssText = 'padding: 8px 12px; border: 1px solid rgba(255,255,255,0.1); border-radius: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.2s ease; position: relative; font-weight: bold; font-size: 10px; display: flex; align-items: center; justify-content: center;';
            block.textContent = segName;

            // Map full forms info
            let detailsTitle = "";
            let detailsText = "";

            if (segName === 'Data' || segName === 'Ping Request' || segName === 'Ping Reply' || segName.includes('Delivered')) {
                block.style.background = 'rgba(255,255,255,0.06)';
                block.style.color = '#ffffff';
                detailsTitle = "Data Payload";
                detailsText = "The raw user message payload transmitted between processes.";
            } else if (segName.includes('Bits')) {
                block.style.background = 'rgba(0,255,102,0.1)';
                block.style.borderColor = '#00FF66';
                block.style.color = '#00FF66';
                detailsTitle = "Physical Layer Bitstream";
                detailsText = "Raw digitized binary bitstream (voltage states) carrying data over copper wire, fiber optics, or radio waves.";
            } else if (segName === 'SYN' || segName === 'SYN-ACK' || segName === 'ACK' || segName === 'DATA-ACK') {
                block.style.background = 'rgba(197, 163, 198, 0.15)';
                block.style.borderColor = 'var(--text-purple)';
                block.style.color = 'var(--text-purple)';
                detailsTitle = "TCP Connection Segment Controls";
                detailsText = `TCP flags used for connection synchronization: ${segName === 'SYN' ? 'SYN (Synchronize Sequence Number)' : (segName === 'SYN-ACK' ? 'SYN-ACK (Synchronize Acknowledge)' : 'ACK (Acknowledged segment receipt)')}.`;
            } else {
                // Header block
                block.style.background = 'rgba(235, 89, 57, 0.08)';
                block.style.borderColor = 'rgba(235, 89, 57, 0.3)';
                block.style.color = 'var(--accent-coral)';

                // Map header full forms
                const headerMap = {
                    'AH': { name: 'Application Header (AH)', desc: 'Added by Layer 7 (Application). Resolves application details and data format bounds.' },
                    'PH': { name: 'Presentation Header (PH)', desc: 'Added by Layer 6 (Presentation). Manages character encoding, encryption schemas, or compression mappings.' },
                    'SH': { name: 'Session Header (SH)', desc: 'Added by Layer 5 (Session). Identifies session checkpoint markers and active tokens.' },
                    'TH': { name: 'Transport Header (TH)', desc: 'Added by Layer 4 (Transport). Stores Source Port (443) and Destination Port (80) fields for process multiplexing.' },
                    'NH': { name: 'Network Header (NH)', desc: 'Added by Layer 3 (Network). Stores Source IP (192.168.1.10) and Destination IP (10.0.0.50) fields for internetwork routing.' },
                    'DH': { name: 'Data Link Header (DH)', desc: 'Added by Layer 2 (Data Link). Contains hardware MAC Address boundaries for local link nodes.' },
                    'DT': { name: 'Data Link Trailer (DT)', desc: 'Added by Layer 2 (Data Link). Contains Cyclic Redundancy Check (CRC) bits representing packet checksum validation.' }
                };

                const mapped = headerMap[segName];
                if (mapped) {
                    detailsTitle = mapped.name;
                    detailsText = mapped.desc;
                }
            }

            // Click listener for details displaying inside the information panels
            block.addEventListener('click', (e) => {
                e.stopPropagation();
                if (detailsTitle) {
                    DOM.setText(this.infoTitle, detailsTitle);
                    DOM.setText(this.infoDesc, detailsText);
                    DOM.setText(this.infoIssues, "Select Step Forward / Backward to see core layer tasks.");
                }
            });

            this.pduContainer.appendChild(block);
        });
    }

    displayLayerDetail(layerIndex) {
        const layer = this.layerInfo[layerIndex];
        if (layer) {
            DOM.setText(this.infoTitle, `${layer.name} Layer (Layer ${layerIndex})`);
            DOM.setText(this.infoDesc, `${layer.desc} // PDU unit: ${layer.pduFullName} (${layer.pduName}).`);
            DOM.setText(this.infoIssues, layer.issues);
        }
    }

    logTerminal(text) {
        if (this.terminalText) {
            this.terminalText.textContent = `> ${text}`;
        }
    }

    destroy() {
        this.stopAutoPlay();
        this.currentStepIndex = 0;
    }
}

window.OsiModel = OsiModel;

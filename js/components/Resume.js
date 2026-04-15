import { DOM } from '../core/dom.js';

export default class Resume {
    render() {
        return DOM.create(`
            <div class="module-section gap-lg" style="display: flex; flex-direction: column;">
                
                <!-- ABOUT ME SECTION -->
                <div class="panel">
                    <div class="panel-header flex items-center gap-md">
                        <div style="flex-shrink: 0; width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 3px solid var(--text-accent); box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);">
                            <img src="assets/profile.jpg" alt="Shubham Waghmare" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <h2 class="panel-title" style="font-size: 1.8rem; margin-bottom: 0.2rem;">Shubham Waghmare</h2>
                            <span style="color: var(--text-accent); font-size: 1rem; font-weight: 500;">Cybersecurity Enthusiast & Developer</span>
                            <div style="display: flex; gap: 0.6rem; margin-top: 0.8rem; flex-wrap: wrap; align-items: center;">
                                <a href="mailto:demaji.zerofive@gmail.com" style="text-decoration: none; background: rgba(0,240,255,0.1); color: var(--text-primary); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(0,240,255,0.3); font-size: 0.8rem; transition: 0.3s;" onmouseover="this.style.background='rgba(0,240,255,0.2)'" onmouseout="this.style.background='rgba(0,240,255,0.1)'">📧 demaji.zerofive@gmail.com</a>
                                <a href="tel:+918956313168" style="text-decoration: none; background: rgba(0,240,255,0.1); color: var(--text-primary); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(0,240,255,0.3); font-size: 0.8rem; transition: 0.3s;" onmouseover="this.style.background='rgba(0,240,255,0.2)'" onmouseout="this.style.background='rgba(0,240,255,0.1)'">📞 +91 8956313168</a>
                                <a href="tel:+917776917051" style="text-decoration: none; background: rgba(0,240,255,0.1); color: var(--text-primary); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(0,240,255,0.3); font-size: 0.8rem; transition: 0.3s;" onmouseover="this.style.background='rgba(0,240,255,0.2)'" onmouseout="this.style.background='rgba(0,240,255,0.1)'">📞 +91 7776917051</a>
                                <a href="https://github.com/D5BU" target="_blank" style="text-decoration: none; background: rgba(255,255,255,0.1); color: var(--text-primary); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.3); font-size: 0.8rem; transition: 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">⬛ GitHub // D5BU</a>
                            </div>
                        </div>
                    </div>
                    <div class="text-secondary" style="font-size: 1.05rem; line-height: 1.7; display: flex; flex-direction: column; gap: 1rem; border-left: 3px solid var(--text-accent); padding-left: 1.5rem; margin-top: 1rem;">
                        <p>
                            <span class="text-primary font-bold">My name is Shubham Waghmare</span>, and I am currently in the final year of my studies at Ajeenkya DY Patil University, located in Lohegaon.
                        </p>
                        <p>
                            I am deeply curious about understanding how things work at a fundamental level — whether it's computers, natural systems, or even everyday objects. I enjoy breaking concepts down to their core and exploring them from a granular perspective.
                        </p>
                        <p>
                            Outside of technology, I have a strong interest in gardening, space observation, and stargazing. These interests reflect my curiosity about both micro-level and macro-level systems.
                        </p>
                    </div>
                </div>

                <!-- SKILLS SECTION -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="panel-header ml-sm"><h2 class="panel-title">Technical Arsenal</h2></div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                        
                        <!-- Skill Category 1 -->
                        <div class="panel" style="background: rgba(0,0,0,0.3); border-top: 2px solid var(--text-accent);">
                            <h3 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--text-accent);">👨‍💻</span> Programming Languages</h3>
                            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.6rem; color: var(--text-secondary);">
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> C</li>
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> C++</li>
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> Java (Intermediate)</li>
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> Python</li>
                            </ul>
                        </div>

                        <!-- Skill Category 2 -->
                        <div class="panel" style="background: rgba(0,0,0,0.3); border-top: 2px solid var(--text-accent);">
                            <h3 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--text-accent);">☁️</span> Cloud Computing</h3>
                            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.6rem; color: var(--text-secondary);">
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> <span class="text-primary">AWS</span> (EC2, S3, RDS, VPC, ELB, DNS)</li>
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> Linux Fundamentals</li>
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> Shell Scripting (Basic)</li>
                            </ul>
                            <div style="margin-top: 1rem; padding-top: 0.8rem; border-top: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-secondary);">
                                <strong>Highlights:</strong> Deployed EC2 web apps, configured IAM/Security Groups, Docker containerization.
                            </div>
                        </div>

                        <!-- Skill Category 3 -->
                        <div class="panel" style="background: rgba(0,0,0,0.3); border-top: 2px solid var(--text-danger);">
                            <h3 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--text-danger);">🛡️</span> Cybersecurity</h3>
                            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.6rem; color: var(--text-secondary);">
                                <li><span style="color: var(--text-accent); font-size: 0.8rem; margin-right:8px;">▶</span> <span class="text-primary">Networking:</span> TCP/IP, DNS, VPC, Subnetting</li>
                                <li><span style="color: var(--text-accent); font-size: 0.8rem; margin-right:8px;">▶</span> <span class="text-primary">Concepts:</span> IAM, Encryption, Firewalls</li>
                                <li><span style="color: var(--text-accent); font-size: 0.8rem; margin-right:8px;">▶</span> <span class="text-primary">Practices:</span> Network Scanning, Vuln Asses., OWASP</li>
                                <li><span style="color: var(--text-accent); font-size: 0.8rem; margin-right:8px;">▶</span> <span class="text-primary">Tools:</span> Nmap, Wireshark, Burp Suite, Docker</li>
                            </ul>
                        </div>

                        <!-- Skill Category 4 -->
                        <div class="panel" style="background: rgba(0,0,0,0.3); border-top: 2px solid var(--text-accent);">
                            <h3 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;"><span style="color: var(--text-accent);">🎨</span> Design & Dev</h3>
                            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.6rem; color: var(--text-secondary);">
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> HTML, CSS, JavaScript</li>
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> UI/UX Design Principles</li>
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> Dashboard Dev (Visual Analytics)</li>
                                <li><span style="color: var(--text-danger); font-size: 0.8rem; margin-right:8px;">▶</span> AutoCAD</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- PROJECTS SECTION -->
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="panel-header ml-sm mt-md"><h2 class="panel-title">Featured Projects</h2></div>
                    
                    <div class="flex gap-lg" style="flex-wrap: wrap;">
                        <div class="panel" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="color: var(--text-primary); font-size: 1.4rem;">JusticeGPT</h3>
                                <span class="badge" style="background: rgba(0,240,255,0.1); color: var(--text-accent); padding: 4px 8px; border-radius: 4px; font-size: 0.7rem;">AI / NLP</span>
                            </div>
                            <p class="text-secondary" style="font-size: 0.95rem;">An advanced AI-based legal assistant system utilizing retrieval-based methodologies to ensure highly accurate, hallucination-free legal responses.</p>
                            <ul style="list-style: disc; margin-left: 1.5rem; color: var(--text-secondary); font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.4rem;">
                                <li>Implemented deep NLP-based query understanding.</li>
                                <li>Focused rigorously on reducing hallucinations in AI responses.</li>
                                <li>Integrated complex structured data handling and backend logic.</li>
                            </ul>
                        </div>

                        <div class="panel" style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <h3 style="color: var(--text-primary); font-size: 1.4rem;">D5BU Shield</h3>
                                <span class="badge" style="background: rgba(255,50,50,0.1); color: var(--text-danger); padding: 4px 8px; border-radius: 4px; font-size: 0.7rem;">CYBERSECURITY</span>
                            </div>
                            <p class="text-secondary" style="font-size: 0.95rem;">A bespoke cybersecurity-focused dashboard application built upon Linux-based technical concepts for deep system analysis.</p>
                            <ul style="list-style: disc; margin-left: 1.5rem; color: var(--text-secondary); font-size: 0.9rem; display: flex; flex-direction: column; gap: 0.4rem;">
                                <li>Engineered a fully functional Network Scanner.</li>
                                <li>Implemented an integrated Steganography module for data concealment analysis.</li>
                                <li>Embedded broad system-level security monitoring utilities.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- WHAT I OFFER SECTION -->
                <div class="panel" style="background: linear-gradient(135deg, rgba(0,240,255,0.05) 0%, rgba(0,0,0,0) 100%);">
                    <div class="panel-header"><h2 class="panel-title" style="color: var(--text-accent);">What I Can Offer</h2></div>
                    <div class="text-secondary" style="font-size: 1.05rem; line-height: 1.8; margin-top: 1rem;">
                        <p style="margin-bottom: 1rem;">
                            I bring a strong curiosity-driven mindset and the ability to understand systems at a deep, fundamental level. I am comfortable working across domains such as cloud computing, cybersecurity, and software development.
                        </p>
                        <p style="margin-bottom: 1rem;">
                            I focus not just on using technologies, but on understanding how they work internally. This allows me to approach problems analytically and build efficient, well-structured solutions.
                        </p>
                        <p>
                            I am eager to contribute, learn, and grow in a real-world environment while adding value through both technical skills and a problem-solving mindset.
                        </p>
                    </div>
                </div>

            </div>
        `);
    }

    init() {
        // Any post-mount logic
    }
}

/**
 * AI Assistant Chat Widget
 * Manages the floating action button and drawer UI, posts message histories
 * to the Cloudflare Worker API, and renders the replies with typewriter effect.
 */
class AiAssistant {
    constructor() {
        this.workerUrl = "https://ambitious-resume-ai.d00005ji.workers.dev"; // Default placeholder URL (User can edit this)
        this.messages = [];
        this.isOpen = false;
        this.isTyping = false;

        // Cache elements
        this.widget = document.getElementById('ai-chat-widget');
        this.toggleBtn = document.getElementById('ai-chat-toggle');
        this.chatWindow = document.getElementById('ai-chat-window');
        this.closeBtn = document.getElementById('ai-chat-close');
        this.messageFeed = document.getElementById('ai-chat-feed');
        this.chatForm = document.getElementById('ai-chat-form');
        this.chatInput = document.getElementById('ai-chat-input');
        
        this.init();
    }

    init() {
        if (!this.widget || !this.toggleBtn || !this.chatWindow || !this.chatForm) return;

        // Toggle open/close
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.toggleChat(false));
        }

        // Form Submit
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSendMessage();
        });

        // Add greeting message
        this.addMessage("D5BU-Bot", "Hello! I am Shubham's virtual assistant. Ask me anything about his B.Tech credentials, AWS security metrics, or featured projects!", "bot");
    }

    toggleChat(forceState) {
        this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.add('open');
            this.toggleBtn.classList.add('active');
            setTimeout(() => this.chatInput.focus(), 300);
        } else {
            this.chatWindow.classList.remove('open');
            this.toggleBtn.classList.remove('active');
        }
    }

    async handleSendMessage() {
        const text = this.chatInput.value.trim();
        if (!text || this.isTyping) return;

        // Clear input
        this.chatInput.value = '';

        // 1. Add user message
        this.addMessage("You", text, "user");
        this.messages.push({ role: "user", content: text });

        // 2. Add loader
        this.showLoader(true);

        try {
            // 3. Post to Cloudflare Worker
            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: this.messages })
            });

            if (!response.ok) throw new Error('API limit or network error');

            const data = await response.json();
            this.showLoader(false);

            if (data && data.choices && data.choices[0] && data.choices[0].message) {
                const replyText = data.choices[0].message.content;
                this.messages.push({ role: "assistant", content: replyText });
                
                // 4. Render with typewriter output
                await this.addTypewriterMessage("D5BU-Bot", replyText, "bot");
            } else {
                throw new Error('Malformed response');
            }
        } catch (err) {
            console.error("AI Assistant Error:", err);
            this.handleLocalFallback(text);
        }
    }

    async handleLocalFallback(text) {
        console.warn("AI Assistant: API unreachable. Transitioning to local rules-based engine.");
        const replyText = this.generateLocalResponse(text);
        
        this.messages.push({ role: "assistant", content: replyText });
        
        // Brief simulated delay
        await new Promise(r => setTimeout(r, 600));
        this.showLoader(false);
        
        await this.addTypewriterMessage("D5BU-Bot", replyText, "bot");
    }

    generateLocalResponse(text) {
        const q = text.toLowerCase().trim();
        const contains = (words) => words.some(w => q.includes(w));
        
        if (contains(["hello", "hi", "hey", "greetings", "yo"])) {
            return "Hello! I am Shubham's virtual assistant. I'm currently running in local offline mode. Ask me anything about his B.Tech credentials, cloud security projects, AWS certifications, or his engineering process!";
        }
        
        if (contains(["project", "work", "portfolio", "featured"])) {
            return "Shubham has several impressive cybersecurity and cloud engineering projects:\n\n" +
                   "• **JusticeGPT:** An AI legal assistant utilizing retrieval-augmented generation (RAG) to deliver accurate, hallucination-free legal precedent mappings.\n" +
                   "• **D5BU Shield:** A security command dashboard that maps local subnets (host/port scanning) and hosts an LSB image steganography lab.\n" +
                   "• **SafeDelete Desktop:** A native disk forensics utility built to overwrite storage blocks using DoD standards and calculate Shannon entropy.\n" +
                   "• **AuditiAutomate:** A Python/Boto3 AWS pipeline that automatically audits credentials and access key ages, pruning risk exposure by 70%.\n" +
                   "• **PhishGuard:** An interactive training simulation for analyzing email headers (SPF, DKIM, DMARC alignment) and homograph URL attacks.\n" +
                   "• **FateOS:** A custom, RAM-disk Linux distribution compiled and built from scratch to explore OS boot processes and BusyBox userspace execution.\n\n" +
                   "Which project would you like to explore in detail?";
        }
        
        if (contains(["justicegpt", "justice"])) {
            return "**JusticeGPT** is an AI legal assistant powered by RAG to prevent LLM hallucinations in legal document processing. It features deep legal query parsing and structured document indexing. View the repository: https://github.com/D5BU/JusticeGPT";
        }
        
        if (contains(["shield", "d5bu shield"])) {
            return "**D5BU Shield** is a cybersecurity command dashboard showing host discovery, port scanning, and steganography. It visualizes local subnet configurations and hosts an LSB image hiding lab. View the repository: https://github.com/D5BU/D5BU-Shield";
        }
        
        if (contains(["safedelete", "raw disk", "shred"])) {
            return "**SafeDelete Desktop** is a disk forensics and file shredding utility. It supports secure sanitization methods like Zero Fill, DoD 5220.22-M 3-Pass, and 7-Pass overrides, and displays Shannon entropy to identify encrypted headers. View the repository: https://github.com/D5BU/RAWDISK";
        }
        
        if (contains(["audit", "auditiautomate", "iam"])) {
            return "**AuditiAutomate** is a Python automation pipeline that utilizes the Boto3 AWS API to automatically disable idle access keys and old IAM credentials, reducing risk surface by 70% and saving 15% in monthly costs. View the repository: https://github.com/D5BU/AuditiAutomate";
        }
        
        if (contains(["phish", "phishguard", "email"])) {
            return "**PhishGuard** is an interactive simulation suite built to train teams on auditing raw email header configurations (SPF, DKIM, DMARC alignments) and identifying homograph spoof attacks. View the repository: https://github.com/D5BU/PhishGuard";
        }

        if (contains(["fateos", "fate", "fate-os", "operating system"])) {
            return "**FateOS** is an ultra-lightweight, custom RAM-disk Linux distribution built from scratch to explore bootloaders, BusyBox userspace, kernel loading, and QEMU hardware emulation. View the repository: https://github.com/D5BU/D5BU-FateOS";
        }

        if (contains(["cert", "credential", "aws", "security+", "comptia", "terraform"])) {
            return "Shubham holds the following industry certifications:\n\n" +
                   "1. **AWS Certified Solutions Architect – Associate** (Issued Jan 2026)\n" +
                   "2. **CompTIA Security+** (Issued Feb 2026)\n" +
                   "3. **HashiCorp Certified: Terraform Associate** (Issued Mar 2026)\n\n" +
                   "You can verify these credentials by launching the **Certifications** section in the main page and clicking 'Verify'!";
        }

        if (contains(["skills", "tech", "languages", "arsenal", "docker", "kubernetes", "linux"])) {
            return "Shubham's technical arsenal spans:\n\n" +
                   "• **Cloud & Infrastructure:** AWS (EC2, VPC, IAM, S3), Cloud Architecture.\n" +
                   "• **Systems & Networking:** Linux, DNS, TCP/IP, network administration.\n" +
                   "• **Infrastructure as Code (IaC):** Terraform.\n" +
                   "• **Containers & Orchestration:** Docker, Kubernetes.\n" +
                   "• **DevOps & Automation:** CI/CD pipelines, GitHub Actions, GitOps.\n" +
                   "• **Security:** Cloud Security, IAM hardening, OWASP Top 10, vulnerability assessment.";
        }

        if (contains(["education", "b.tech", "college", "university", "adypu", "dy patil"])) {
            return "Shubham graduated with a B.Tech in **Cloud Technology & Information Security** from Ajeenkya DY Patil University (Lohegaon). His studies focused on distributed systems, network security architectures, virtualization technologies, and secure software development.";
        }

        if (contains(["process", "approach", "methodology"])) {
            return "Shubham approaches system engineering through a 4-phase process:\n\n" +
                   "1. **Deconstruct:** Breaking complex systems down into their micro-level components.\n" +
                   "2. **Validate:** Subjecting components to rigorous edge-case testing.\n" +
                   "3. **Secure:** Auditing data flows, container namespaces, and permissions.\n" +
                   "4. **Automate:** Scaling operations with Terraform IaC, Boto3 pipelines, and GitOps.";
        }

        if (contains(["contact", "email", "reach", "hire", "phone", "linkedin", "github"])) {
            return "You can get in touch with Shubham by scrolling to the footer of the page or clicking the 'Let's Talk' button. You can also visit his GitHub at: https://github.com/D5BU.";
        }

        if (contains(["help", "what can you do", "commands"])) {
            return "I can answer questions regarding:\n\n" +
                   "• Shubham's **projects** (JusticeGPT, D5BU Shield, SafeDelete, AuditiAutomate, PhishGuard, FateOS)\n" +
                   "• His **certifications** (AWS Solutions Architect, Security+, Terraform)\n" +
                   "• His **skills** and technical **arsenal**\n" +
                   "• His **education** and academic background\n" +
                   "• His engineering **process** and contact info.";
        }

        return "I appreciate your query! As I am currently running in offline fallback mode, I might not have a direct answer for that. Try asking about 'projects', 'certifications', 'skills', 'education', or 'contact' to explore Shubham's credentials!";
    }

    addMessage(sender, text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${type}`;
        msgDiv.innerHTML = `
            <span class="msg-sender">${sender}:</span>
            <span class="msg-content">${text}</span>
        `;
        this.messageFeed.appendChild(msgDiv);
        this.scrollFeed();
    }

    async addTypewriterMessage(sender, text, type) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${type}`;
        msgDiv.innerHTML = `
            <span class="msg-sender">${sender}:</span>
            <span class="msg-content"></span>
        `;
        this.messageFeed.appendChild(msgDiv);
        this.scrollFeed();

        const contentSpan = msgDiv.querySelector('.msg-content');
        this.isTyping = true;

        // Typing character by character
        let i = 0;
        await new Promise((resolve) => {
            const timer = setInterval(() => {
                if (i < text.length) {
                    contentSpan.textContent += text.charAt(i);
                    i++;
                    this.scrollFeed();
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, 12); // fast typing speed
        });

        this.isTyping = false;
    }

    showLoader(show) {
        let loader = document.getElementById('ai-chat-loader');
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'ai-chat-loader';
                loader.className = 'chat-msg system';
                loader.innerHTML = `<span class="prompt-action">[ DECRYPTING RESPONSE... ]</span>`;
                this.messageFeed.appendChild(loader);
            }
            this.scrollFeed();
        } else {
            if (loader) loader.remove();
        }
    }

    scrollFeed() {
        this.messageFeed.scrollTop = this.messageFeed.scrollHeight;
    }
}

// Make globally accessible
window.AiAssistant = AiAssistant;

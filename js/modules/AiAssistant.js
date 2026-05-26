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
            this.showLoader(false);
            this.addMessage("System", "[ ERROR: CONNECTION TERMINATED. PLEASE CHECK WORKER ROUTING CONFIG. ]", "system");
        }
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

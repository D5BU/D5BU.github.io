/**
 * Core State Management
 * Uses a Proxy to intercept state changes and trigger subscribed listeners.
 */

class Store {
    constructor(initialState) {
        this.listeners = new Map();
        
        this.state = new Proxy(initialState || {}, {
            set: (target, property, value) => {
                target[property] = value;
                this.notify(property, value);
                return true;
            }
        });
    }

    /**
     * Subscribe to a specific state property change
     * @param {string} property - The state key to listen to
     * @param {function} callback - Function to run on change
     */
    subscribe(property, callback) {
        if (!this.listeners.has(property)) {
            this.listeners.set(property, []);
        }
        this.listeners.get(property).push(callback);
    }

    /**
     * Notify all listeners of a specific property change
     */
    notify(property, value) {
        if (this.listeners.has(property)) {
            this.listeners.get(property).forEach(callback => callback(value));
        }
    }
}

// Detect System Preference
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Global Application State
export const appState = new Store({
    activeModule: 'resume', // default module
    themeMode: prefersDark ? 'dark' : 'light',
    customAccent: null,
    customDanger: null
});

// Setup Initial Theme Logic
const applyTheme = () => {
    if (appState.state.themeMode === 'light') {
        document.body.classList.add('theme-light');
        document.body.classList.remove('theme-dark');
    } else {
        document.body.classList.add('theme-dark');
        document.body.classList.remove('theme-light');
    }
};

const applyCustomColors = () => {
    if (appState.state.customAccent) {
        document.documentElement.style.setProperty('--text-accent', appState.state.customAccent);
    } else {
        document.documentElement.style.removeProperty('--text-accent');
    }
    
    if (appState.state.customDanger) {
        document.documentElement.style.setProperty('--text-danger', appState.state.customDanger);
    } else {
        document.documentElement.style.removeProperty('--text-danger');
    }
};

// Initial Apply
applyTheme();
applyCustomColors();

// Bind to state changes
appState.subscribe('themeMode', applyTheme);
appState.subscribe('customAccent', applyCustomColors);
appState.subscribe('customDanger', applyCustomColors);

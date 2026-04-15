import { appState } from '../core/state.js';
import { DOM } from '../core/dom.js';

export default class Settings {
    render() {
        return DOM.create(`
            <div class="module-section gap-lg">
                <div class="panel">
                    <div class="panel-header"><h2 class="panel-title">Appearance & Theme Settings</h2></div>
                    <p class="text-secondary" style="margin-bottom: 2rem;">
                        Customize your portfolio's accent colors and base themes. 
                        By default, the theme matches your operating system's preference.
                    </p>

                    <div class="flex gap-lg" style="flex-wrap: wrap;">
                        <!-- Mode Toggle -->
                        <div class="panel" style="flex: 1; min-width: 250px;">
                            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Base Theme Mode</h3>
                            <div class="flex gap-md">
                                <button id="btn-theme-light" class="btn btn-secondary w-full" style="flex: 1;">Light Mode</button>
                                <button id="btn-theme-dark" class="btn btn-secondary w-full" style="flex: 1;">Dark Mode</button>
                            </div>
                            <h3 style="margin: 1.5rem 0 1rem; color: var(--text-primary); font-size: 1.1rem;">RGB Mode</h3>
                            <button id="btn-theme-rgb" class="btn btn-secondary w-full" style="transition: all 0.3s; background: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; border-image: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff) 1; border-width: 2px; border-style: solid;">Toggle RGB Cycle</button>
                        </div>

                        <!-- Color Customization -->
                        <div class="panel" style="flex: 2; min-width: 300px;">
                            <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Custom Accent Colors</h3>
                            
                            <div class="input-group" style="flex-direction: row; align-items: center; justify-content: space-between;">
                                <label class="input-label text-secondary" style="margin: 0;">Primary Accent (Headers / Active Links)</label>
                                <input type="color" id="color-accent" value="#00F0FF" style="cursor: pointer; background: none; border: none; width: 40px; height: 40px;">
                            </div>
                            
                            <div class="input-group" style="flex-direction: row; align-items: center; justify-content: space-between; margin-top: 1rem;">
                                <label class="input-label text-secondary" style="margin: 0;">Danger / Alert Color (Brute Force / Deletions)</label>
                                <input type="color" id="color-danger" value="#FF3366" style="cursor: pointer; background: none; border: none; width: 40px; height: 40px;">
                            </div>
                            
                            <div class="mt-lg flex gap-md">
                                <button id="btn-reset-colors" class="btn btn-secondary">Reset to Default Colors</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    init() {
        this.btnLight = DOM.get('#btn-theme-light');
        this.btnDark = DOM.get('#btn-theme-dark');
        this.colorAccent = DOM.get('#color-accent');
        this.colorDanger = DOM.get('#color-danger');
        this.btnReset = DOM.get('#btn-reset-colors');
        this.btnRgb = DOM.get('#btn-theme-rgb');

        // Initial UI State mapping
        this.updateUIButtons(appState.state.themeMode);
        
        // Ensure color pickers reflect current appState
        this.colorAccent.value = appState.state.customAccent || '#00F0FF';
        this.colorDanger.value = appState.state.customDanger || '#FF3366';

        // Listeners for Theme Mode
        this.btnLight.addEventListener('click', () => {
            appState.state.themeMode = 'light';
            this.updateUIButtons('light');
        });

        this.btnDark.addEventListener('click', () => {
            appState.state.themeMode = 'dark';
            this.updateUIButtons('dark');
        });
        
        this.btnRgb.addEventListener('click', () => {
             document.body.classList.toggle('theme-rgb');
        });

        // Listeners for Color Changes -> using "input" for real-time
        this.colorAccent.addEventListener('input', (e) => {
            appState.state.customAccent = e.target.value;
        });

        this.colorDanger.addEventListener('input', (e) => {
            appState.state.customDanger = e.target.value;
        });

        // Reset
        this.btnReset.addEventListener('click', () => {
            appState.state.customAccent = null;
            appState.state.customDanger = null;
            this.colorAccent.value = '#00f0ff'; // fallback hex format
            this.colorDanger.value = '#ff3366';
        });
    }

    updateUIButtons(mode) {
        if (mode === 'light') {
            this.btnLight.classList.replace('btn-secondary', 'btn-primary');
            this.btnDark.classList.replace('btn-primary', 'btn-secondary');
        } else {
            this.btnDark.classList.replace('btn-secondary', 'btn-primary');
            this.btnLight.classList.replace('btn-primary', 'btn-secondary');
        }
    }
}

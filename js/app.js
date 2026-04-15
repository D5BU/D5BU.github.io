import { appState } from './core/state.js';
import { DOM } from './core/dom.js';

// Import UI Components & Modules
import Sidebar from './components/Sidebar.js';
import Resume from './components/Resume.js';
import SortingVisualizer from './modules/SortingVisualizer.js';
import LogicGates from './modules/LogicGates.js';
import BruteForceDemo from './modules/BruteForceDemo.js';
import Settings from './modules/Settings.js';

class App {
    constructor() {
        this.modules = {
            'resume': new Resume(),
            'bubble-sort': new SortingVisualizer('Bubble Sort'),
            'selection-sort': new SortingVisualizer('Selection Sort'),
            'insertion-sort': new SortingVisualizer('Insertion Sort'),
            'merge-sort': new SortingVisualizer('Merge Sort'),
            'quick-sort': new SortingVisualizer('Quick Sort'),
            'binary-search': new SortingVisualizer('Binary Search'),
            'logic-gates': new LogicGates(),
            'brute-force': new BruteForceDemo(),
            'settings': new Settings()
        };

        this.init();
    }

    init() {
        // Initialize static components
        this.sidebar = new Sidebar();

        // Subscribe to state changes for routing
        appState.subscribe('activeModule', (newModule) => {
            this.loadModule(newModule);
        });

        // Load default module
        this.loadModule(appState.state.activeModule);
    }

    loadModule(moduleId) {
        const module = this.modules[moduleId];
        const container = DOM.get('#content-container');
        const titleEl = DOM.get('#page-title');

        if (module) {
            // Update Title
            const titles = {
                'resume': 'About Me & Resume',
                'bubble-sort': 'Algorithm Visualization: Bubble Sort',
                'selection-sort': 'Algorithm Visualization: Selection Sort',
                'insertion-sort': 'Algorithm Visualization: Insertion Sort',
                'merge-sort': 'Algorithm Visualization: Merge Sort',
                'quick-sort': 'Algorithm Visualization: Quick Sort',
                'binary-search': 'Algorithm Visualization: Binary Search',
                'logic-gates': 'Logic Gates Simulator',
                'brute-force': 'Cybersecurity: Brute Force Demo',
                'settings': 'Settings & Themes'
            };
            DOM.setText(titleEl, titles[moduleId]);

            // Mount Module UI
            DOM.mount(container, module.render());

            // Run initialization logic if module needs it
            if (typeof module.init === 'function') {
                module.init();
            }
        } else {
            DOM.mount(container, DOM.create(`<div class="panel"><p class="text-secondary">Module not found.</p></div>`));
        }
    }
}

// Start application immediately
window.app = new App();

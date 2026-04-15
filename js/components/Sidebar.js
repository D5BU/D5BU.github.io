import { appState } from '../core/state.js';
import { DOM } from '../core/dom.js';

export default class Sidebar {
    constructor() {
        this.init();
    }

    init() {
        // Cache DOM elements continuously when clicked or statically
        this.navButtons = DOM.getAll('.nav-btn');
        this.collapseButtons = DOM.getAll('.btn-collapse');

        this.handleSidebarToggle();
        this.handleAccordion();

        // Listen for state changes to update active UI
        appState.subscribe('activeModule', (newModule) => {
            this.setActiveItem(newModule);
        });
    }

    handleSidebarToggle() {
        // Event listeners on actual navigation buttons
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetModule = e.target.closest('.nav-btn').getAttribute('data-target');
                if (targetModule) {
                    appState.state.activeModule = targetModule; // Trigger reactive update
                }
            });
        });
    }

    handleAccordion() {
        // According to requirements: ONLY one section expanded at a time (accordion behavior)
        // Main categories behavior differs from nested ones if they are siblings.
        
        this.collapseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const currentGroup = e.target.closest('.nav-group');
                const isNested = currentGroup.classList.contains('nested');
                
                // Find siblings to close them (Accordion rule)
                const parentUl = currentGroup.parentElement;
                Array.from(parentUl.children).forEach(child => {
                    if (child.classList.contains('nav-group') && child !== currentGroup) {
                        child.classList.remove('active');
                        const childContent = child.querySelector(':scope > .nav-group-content');
                        if(childContent) {
                            childContent.style.maxHeight = null;
                        }
                    }
                });

                // Toggle the clicked one
                const content = currentGroup.querySelector(':scope > .nav-group-content');
                if (currentGroup.classList.contains('active')) {
                    currentGroup.classList.remove('active');
                    content.style.maxHeight = null;
                } else {
                    currentGroup.classList.add('active');
                    // Calculate precise scroll height including nested opens? Just use a large px value for simplicity if dynamic height is tricky, but scrollHeight is best.
                    // For nested structures, we must update the parent's max-height as well if it increases.
                    content.style.maxHeight = content.scrollHeight + 500 + "px"; // 500px buffer for sub-accordions
                    
                    if (isNested) {
                        // Ensure parent stays open enough
                        const mainParentGroup = currentGroup.closest('.nav-group:not(.nested)');
                        if (mainParentGroup) {
                            const mainContent = mainParentGroup.querySelector(':scope > .nav-group-content');
                            mainContent.style.maxHeight = mainContent.scrollHeight + content.scrollHeight + "px";
                        }
                    }
                }
            });
        });
    }

    setActiveItem(activeId) {
        this.navButtons.forEach(btn => {
            if (btn.getAttribute('data-target') === activeId) {
                btn.classList.add('active');
                // Automatically open parents if hidden
                let parentGroup = btn.closest('.nav-group');
                while (parentGroup) {
                    parentGroup.classList.add('active');
                    const content = parentGroup.querySelector(':scope > .nav-group-content');
                    if (content) {
                        content.style.maxHeight = content.scrollHeight + 500 + "px";
                    }
                    parentGroup = parentGroup.parentElement.closest('.nav-group');
                }
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

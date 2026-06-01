/**
 * DOM Utilities
 * Provides functions to cleanly interact with DOM elements and minimize reflows.
 */

window.DOM = {
    /**
     * Get an element by ID or selector
     */
    get: (selector, context = document) => {
        return context.querySelector(selector);
    },

    /**
     * Get all elements matching selector
     */
    getAll: (selector, context = document) => {
        return Array.from(context.querySelectorAll(selector));
    },

    /**
     * Create an element from HTML string utilizing a template to avoid multiple reflows
     */
    create: (htmlString) => {
        if (typeof htmlString !== 'string' || !htmlString.trim()) {
            console.warn('DOM.create received empty or invalid HTML string, returning empty div fallback');
            return document.createElement('div');
        }
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstElementChild || document.createElement('div');
    },

    /**
     * Mount a created node into a container, replacing previous content
     */
    mount: (container, node) => {
        if (typeof container === 'string') {
            container = DOM.get(container);
        }
        if (!container) {
            console.error('DOM.mount: container element not found');
            return;
        }
        container.innerHTML = ''; // clear current

        if (node instanceof Node) {
            container.appendChild(node);
        } else if (node !== null && node !== undefined) {
            console.warn('DOM.mount: parameter 1 is not of type Node, attempting fallback rendering', node);
            if (typeof node === 'string') {
                container.innerHTML = node;
            } else {
                container.appendChild(document.createTextNode(String(node)));
            }
        } else {
            console.warn('DOM.mount: node is null or undefined, skipping append');
        }
    },

    /**
     * Safely update text content
     */
    setText: (element, text) => {
        if(typeof element === 'string') {
            element = DOM.get(element);
        }
        if (element && element.textContent !== text) {
            element.textContent = text;
        }
    },

    /**
     * Toggle class safely
     */
    toggleClass: (element, className, force) => {
        if(typeof element === 'string') {
            element = DOM.get(element);
        }
        if (element) {
            element.classList.toggle(className, force);
        }
    }
};

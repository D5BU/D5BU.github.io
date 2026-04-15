/**
 * DOM Utilities
 * Provides functions to cleanly interact with DOM elements and minimize reflows.
 */

export const DOM = {
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
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstElementChild;
    },

    /**
     * Mount a created node into a container, replacing previous content
     */
    mount: (container, node) => {
        if (typeof container === 'string') {
            container = DOM.get(container);
        }
        container.innerHTML = ''; // clear current
        container.appendChild(node);
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

const Cre = {
    events: new EventTarget(),
    emit: (name, detail) => Cre.events.dispatchEvent(new CustomEvent(name, { detail })),
    on: (name, callback) => Cre.events.addEventListener(name, (e) => callback(e.detail)),

    get: (selector) => {
        const el = document.querySelector(selector);
        return el && el instanceof HTMLElement && 'state' in el && 'actions' in el
          ? { state: el.state, actions: el.actions }
          : null;
    },

    ate: (name, { template, initialState = {}, actions = {}, events = {} }) => {
        class CreComponent extends HTMLElement {
            constructor() {
                super();
                this.state = new Proxy({ ...initialState }, {
                    set: (obj, prop, value) => {
                        obj[prop] = value;
                        this.render();
                        return true;
                    }
                });
                this.actions = Object.keys(actions).reduce((acc, key) => {
                    acc[key] = (...args) => {
                        actions[key].call(this, this.state, ...args);
                        this.render();
                    };
                    return acc;
                }, {});
                this.listeners = [];
                this.attachShadow({ mode: 'open' });
                this.render();
            }

            connectedCallback() {
                Object.entries(events).forEach(([eventType, handler]) => {
                    const boundHandler = (e) => handler.call(this, this.state, e);
                    this.shadowRoot.addEventListener(eventType, boundHandler);
                    this.listeners.push({ target: this.shadowRoot, type: eventType, handler: boundHandler });
                });
            }

            disconnectedCallback() {
                this.listeners.forEach(({ target, type, handler }) => {
                    target.removeEventListener(type, handler);
                });
                this.listeners = [];
            }

            render() {
                this.shadowRoot.innerHTML = `
            <style>
              :host { display: block; }
              * { box-sizing: border-box; margin: 0; padding: 0; }
            </style>
            ${template(this.state, this.actions)}
          `;
                this.bindEvents();
            }

            bindEvents() {
                this.shadowRoot.querySelectorAll('*').forEach((el) => {
                    const eventAttrs = Array.from(el.attributes).filter(attr => attr.name.startsWith('@'));
                    eventAttrs.forEach((attr) => {
                        const eventType = attr.name.slice(1); // e.g., @click -> click
                        const [actionName, ...args] = attr.value.match(/(\w+)\((.*?)\)/)?.slice(1) || [attr.value];
                        const handler = () => {
                            if (this.actions[actionName]) {
                                const parsedArgs = args.length
                                    ? args[0].split(',').map(arg => {
                                        const trimmed = arg.trim();
                                        return isNaN(trimmed) ? trimmed : Number(trimmed); // Convert to number if numeric
                                    })
                                    : [];
                                this.actions[actionName](...parsedArgs);
                            }
                        };
                        el.addEventListener(eventType, handler);
                        this.listeners.push({ target: el, type: eventType, handler });
                    });
                });
            }
        }

        customElements.define(name, CreComponent);
    }
};

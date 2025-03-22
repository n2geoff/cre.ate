# Cre.ate
> A Minimal Web-Component Library to Create UI

Cre.ate is a lightweight, no-dependency JavaScript library for building dynamic, component-based user interfaces directly in the browser. It uses string literal templates, web components, and a simple state management system to create reusable UI pieces with minimal boilerplate.

## Features

- **Size**: Tiny — single script, ~100 lines, no build step required.
- String Literal Templates: Using backticks for readable HTML.
- State Management: Proxy-based, auto-renders on change.
- Actions: Functions to update `state`, tied to `events`.
- Events: @click="action(args)" syntax, auto-bound and cleaned up.
- Pub/Sub: Cre.emit and Cre.on for component communication.
- CSS Reset: Built-in for consistency.
- Minimal Boilerplate: Optional `initialState`, `actions`, `events`.
- Component Helper: Cre.get('selector') for external access.
- **Browser Support**: Modern browsers with custom elements and shadow DOM support (e.g., Chrome, Firefox, Safari, Edge).

## Getting Started

1. **Add Cre.ate to Your Project**
   Download the script or copy it into your HTML file:
   ```html
   <script src="cre.ate.js"></script>
   ```
   Or include it inline:
   ```html
   <script>
     // Paste the Cre.ate code here
   </script>
   ```

2. **Define a Component**
   Use `Cre.ate` to create a custom element:
   ```javascript
   Cre.ate('my-component', {
     initialState: { message: 'Hello, Cre.ate!' },
     template: (state) => `
       <p>${state.message}</p>
     `
   });
   ```

3. **Use It in HTML**
   Add the custom element to your page:
   ```html
   <my-component></my-component>
   ```

## Core Concepts

### Components
Components are defined with `Cre.ate(name, options)` and become custom HTML elements. The `options` object can include:

- **`template` (required)**: A function returning an HTML string using template literals. Takes `state` and `actions` as arguments.
- **`initialState` (optional)**: An object for the component’s initial state. Defaults to `{}`.
- **`actions` (optional)**: An object of functions to update state. Defaults to `{}`.
- **`events` (optional)**: An object of event handlers for the shadow DOM. Defaults to `{}`.

### State
State is managed with a Proxy that automatically re-renders the component when changed. Access it via `state` in `template` and `actions`.

### Actions
Actions are functions that modify state or perform side effects. Call them from event handlers or externally.

### Templates
Templates are string literals that define the component’s HTML. Use JavaScript expressions (e.g., `${state.value}`) to make them dynamic.

## Features

### Event Handling
Bind events directly in templates with `@event="action(args)"` syntax (e.g., `@click="increment"`):
```javascript
Cre.ate('cre-counter', {
  initialState: { count: 0 },
  template: (state) => `
    <button @click="increment">Increment: ${state.count}</button>
  `,
  actions: {
    increment(state) {
      state.count += 1;
    }
  }
});
```
- `@click`, `@mouseover`, etc., map to standard DOM events.
- `action(args)` calls the named action with parsed arguments (numbers are auto-converted).
- Events are automatically cleaned up when the component is removed.

You can also use the `events` option for shadow DOM-level listeners:
```javascript
events: {
  click: (state, event) => {
    console.log('Shadow DOM clicked!', event);
  }
}
```

### Pub/Sub Communication
Components can communicate using `Cre.emit` and `Cre.on`:
```javascript
Cre.ate('cre-sidebar', {
  initialState: { items: ['Item 1', 'Item 2'], selected: null },
  template: (state) => `
    <ul>
      ${state.items.map((item, i) => `
        <li @click="select(${i})" class="${state.selected === i ? 'selected' : ''}">
          ${item}
        </li>
      `).join('')}
    </ul>
  `,
  actions: {
    select(state, index) {
      state.selected = index;
      Cre.emit('sidebar-select', index);
    }
  }
});

Cre.ate('cre-main', {
  initialState: { content: 'Select an item' },
  template: (state) => `<div>${state.content}</div>`
});

Cre.on('sidebar-select', (index) => {
  Cre.get('cre-main').actions.updateContent(`You selected item ${index + 1}`);
});
```
- `Cre.emit(name, detail)`: Sends an event with data.
- `Cre.on(name, callback)`: Listens for events and receives the `detail`.

### Component Access
Use `Cre.get(selector)` to access a component’s `state` and `actions`:
```javascript
const counter = Cre.get('cre-counter');
counter.actions.increment(); // Updates the counter
console.log(counter.state.count); // Current count
```
- Returns `{ state, actions }` or `null` if no match.
- Works with any CSS selector (e.g., `'cre-counter'`, `'#id'`, `'.class'`).

### CSS Reset
Every component includes a default CSS reset in its shadow DOM:
```css
:host { display: block; }
* { box-sizing: border-box; margin: 0; padding: 0; }
```
Override it with your own `<style>` tags in the template.

## Examples

### cre-Counter
A simple counter component:
```javascript
Cre.ate('cre-counter', {
  initialState: { count: 0 },
  template: (state) => `
    <button @click="increment">Increment: ${state.count}</button>
  `,
  actions: {
    increment(state) {
      state.count += 1;
    }
  }
});
```
```html
<cre-counter></cre-counter>
```

### cre-Sidebar and cre-Main
A sidebar that updates a main content area:
```javascript
Cre.ate('cre-sidebar', {
  initialState: { items: ['Item 1', 'Item 2'], selected: null },
  template: (state) => `
    <style>
      ul { list-style: none; padding: 10px; }
      li { padding: 5px; }
      li:hover { background: #eee; cursor: pointer; }
      .selected { background: #ddd; }
    </style>
    <ul>
      ${state.items.map((item, i) => `
        <li @click="select(${i})" class="${state.selected === i ? 'selected' : ''}">
          ${item}
        </li>
      `).join('')}
    </ul>
  `,
  actions: {
    select(state, index) {
      state.selected = index;
      Cre.emit('sidebar-select', index);
    }
  }
});

Cre.ate('cre-main', {
  initialState: { content: 'Select an item from the sidebar' },
  template: (state) => `
    <style>
      div { padding: 20px; }
    </style>
    <div>${state.content}</div>
  `,
  actions: {
    updateContent(state, text) {
      state.content = text;
    }
  }
});

Cre.on('sidebar-select', (index) => {
  Cre.get('cre-main').actions.updateContent(`You selected item ${index + 1}`);
});
```
```html
<cre-sidebar></cre-sidebar>
<cre-main></cre-main>
```

## Tips
- **Static Components**: Omit `initialState`, `actions`, and `events` for simple, static content:
  ```javascript
  Cre.ate('cre-static', {
    template: () => `<p>Static content</p>`
  });
  ```
- **Styling**: Use `<style>` tags in templates for scoped CSS within the shadow DOM.
- **Debugging**: Check the console for warnings if an action isn’t found.

## Limitations
- No built-in support for complex state management (use `actions` or external libraries).
- Single instance per selector with `Cre.get` (first match only).
- Modern browsers only (no polyfills included).

## License
[MIT](LICENSE) - Free to use, modify, and distribute, enjoy!

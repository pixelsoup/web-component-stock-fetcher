class StockFetcher extends HTMLElement {
  constructor() {
    super(); // Call the parent constructor
    this.attachShadow({ mode: 'open' }); // Create a shadow DOM
  }

  static get observedAttributes() {
    return ['base-url', 'endpoint']; // Observe 'base-url' and 'endpoint' attributes
  }

  async connectedCallback() {
    const baseUrl = this.getAttribute('base-url'); // Get the base URL from the attribute
    const endpoint = this.getAttribute('endpoint'); // Get the endpoint from the attribute
    if (baseUrl && endpoint) {
      const url = `${baseUrl}/${endpoint}`; // Construct the full URL
      try {
        const data = await this.fetchData(url); // Fetch data using the constructed URL
        this.render(data); // Render the fetched data
      } catch (error) {
        this.render({ message: error.message }); // Handle errors during fetch
      }
    } else {
      this.render({ message: 'Base URL or endpoint not provided.' }); // Handle missing attributes
    }
  }

  async fetchData(url) {
    const response = await fetch(url); // Fetch data from the given URL
    if (!response.ok) {
      throw new Error('Network response was not ok'); // Handle errors
    }
    return await response.json(); // Return the JSON data
  }

  render(data) {
    const content = Array.isArray(data)
      ? data.map(user => `<p>${user.name} - ${user.email}</p>`).join('') // Prepare content for array of users
      : `<p>${data.message}</p>`; // Prepare content for error or single message

    this.shadowRoot.innerHTML = `
      <style>
        p {
          font-size: 16px;
          color: green;
        }
      </style>
      ${content} <!-- Display the fetched data -->
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ((name === 'base-url' || name === 'endpoint') && newValue) {
      this.connectedCallback(); // Re-fetch data if either attribute changes
    }
  }
}

// Define the custom element
customElements.define('stock-fetcher', StockFetcher);
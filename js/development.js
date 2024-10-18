class DynamicFetcher extends HTMLElement {
  constructor() {
    super(); // Call the parent constructor
    this.attachShadow({ mode: 'open' }); // Create a shadow DOM
  }

  static get observedAttributes() {
    return ['endpoint']; // Observe 'endpoint' attributes
  }

  async connectedCallback() {
    // https://s3.ap-southeast-2.amazonaws.com/stock.publish/dealer_2343/stock.json
    const baseUrl = 'https://s3.ap-southeast-2.amazonaws.com/stock.publish'; // Get the base URL from the attribute
    const endpoint = this.getAttribute('endpoint'); // Get the endpoint from the attribute
    const fileName = 'stock.json'

    console.log('baseUrl: ', baseUrl)
    console.log('endpoint: ', endpoint)
    console.log('fileName: ', fileName)
    if (baseUrl && endpoint) {
      const url = `${baseUrl}/${endpoint}/${fileName}`; // Construct the full URL
      try {
        const data = await this.fetchData(url); // Fetch data using the constructed URL
        console.log('data', data)
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
      ? data.map(stock => `<p>${stock.make} - ${stock.model}</p>`).join('') // Prepare content for array of stocks
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
    if ((name === 'endpoint') && newValue) {
      this.connectedCallback(); // Re-fetch data if either attribute changes
    }
  }
}

// Define the custom element
customElements.define('dynamic-fetcher', DynamicFetcher);
class DynamicFetcher extends HTMLElement {
  constructor() {
    super(); // Call the parent constructor
    this.attachShadow({ mode: 'open' }); // Create a shadow DOM
  }

  static get observedAttributes() {
    return ['dealer-id']; // Observe 'dealerId  ' attributes
  }

  async connectedCallback() {
    // https://s3.ap-southeast-2.amazonaws.com/stock.publish/dealer_2343/stock.json
    const baseUrl = 'https://s3.ap-southeast-2.amazonaws.com/stock.publish'; // Get the base URL from the attribute
    const dealerId   = this.getAttribute('dealer-id'); // Get the dealer id from the attribute

    if (dealerId) {
      const url = `${baseUrl}/dealer_${dealerId}/stock.json`; // Construct the full URL
      try {
        const data = await this.fetchData(url); // Fetch data using the constructed URL
        console.log('data', data)
        this.render(data); // Render the fetched data
      } catch (error) {
        this.render({ message: error.message }); // Handle errors during fetch
      }
    } else {
      this.render({ message: 'Base URL or dealer-id not provided.' }); // Handle missing attributes
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

    const getArrayLength = (arr) => arr.length;
    const numberOfStock = Array.isArray(data) && getArrayLength(data)
    console.log('numberOfStock: ', numberOfStock)

    const content = Array.isArray(data)
      ? data.map(stock => `<p>${stock.make} - ${stock.model}</p>`).join('') // Prepare content for array of stock
      : `<p>${data.message}</p>`; // Prepare content for error or single message


      this.shadowRoot.innerHTML = `
      <style>
      .numberOfStock {
        color: var(--numberStockCol);
      }
      p {
        font-size: 16px;
        color: green;
        }
        </style>

        <h4 class="numberOfStock">Number of Stock: ${numberOfStock}</h4>
      ${content} <!-- Display the fetched data -->
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ((name === 'dealer-id') && newValue) {
      this.connectedCallback(); // Re-fetch data if either attribute changes
    }
  }
}

// Define the custom element
customElements.define('dynamic-fetcher', DynamicFetcher);
class StockFetcher extends HTMLElement {
  constructor() {
    super(); // Call the parent constructor
    this.attachShadow({ mode: 'open' }); // Create a shadow DOM
  }

  static get observedAttributes() {
    return ['dealer-id', 'primary-col']; // Observe 'dealer-id' and 'primary-col' attributes
  }

  async connectedCallback() {
    const baseUrl = 'https://s3.ap-southeast-2.amazonaws.com/stock.publish';
    const dealerId = this.getAttribute('dealer-id'); // Get the dealer id from the attribute

    if (dealerId) {
      const url = `${baseUrl}/dealer_${dealerId}/stock.json`; // Construct the full URL

      try {
        const data = await this.fetchData(url); // Fetch data using the constructed URL
        this.render(data); // Render the fetched data
      } catch (error) {
        this.render({ message: error.message }); // Handle errors during fetch
      }
    } else {
      this.render({ message: 'Dealer ID not provided.' }); // Handle missing attributes
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
    const numberOfStock = Array.isArray(data) ? data.length : 0; // Get number of stock items

    const content = Array.isArray(data)
      ? data.map(stock => this.createStockItem(stock)).join('') // Prepare content for array of stock
      : `<p>${data.message}</p>`; // Prepare content for error or single message

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --primaryCol: gray; /* Default color */
        }

        .numberOfStock {
          color: var(--numberStockCol);
        }

        .stockItemsWrapper {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 15px;
        }

        .stockItem {
          border: 1px solid #ddd;
        }

        .stockItemHeading {
          font-size: 14px;
          color: white;
          background-color: var(--primaryCol); /* Use custom property */
          margin-block: 0;
          padding: 5px;
        }

        .stockItemImage {
            display: block;
            width: 100%;
        }

        .stockFeatures {
          background-color: white;
          padding: 10px;
        }

        .stockFeatureItem {
          font-size: 12px;
          margin-block: 0;
        }

        strong {
          font-family: var(--fontBold);
        }
      </style>

      <h4 class="numberOfStock">Number of Stock Items : ${numberOfStock}</h4>
      <div class="stockItemsWrapper">
        ${content} <!-- Display the fetched data -->
      </div>
    `;

    // Set custom property based on primary-col attribute
    this.updatePrimaryColor();
  }

  createStockItem(stock) {
    const images = stock.images;
    const imageSrc = (Array.isArray(images) && images.length > 0)
                     ? images[0]
                     : 'https://placehold.co/250x167/e1e1e1/bebebe?text=No%20Image&font=lato';

    return `
      <div class="stockItem">
        <p class="stockItemHeading">${stock.make} - ${stock.model}</p>
        <img class="stockItemImage" src="${imageSrc}" alt="${stock.make} ${stock.model}" />
        <div class="stockFeatures">
          <p class="stockFeatureItem"><strong>Transmission</strong> ${stock.transmission}</p>
          <p class="stockFeatureItem"><strong>Body Type</strong> ${stock.bodyType}</p>
          <p class="stockFeatureItem"><strong>Color</strong> ${stock.colour}</p>
          <p class="stockFeatureItem"><strong>Kilometres</strong> ${stock.odometer}</p>
          <p class="stockFeatureItem"><strong>Engine</strong> ${stock.size} ${stock.sizeOption}</p>
          <p class="stockFeatureItem"><strong>Stock № </strong> ${stock.stockNumber}</p>
        </div>
      </div>
    `;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'dealer-id' && newValue) {
      this.connectedCallback(); // Re-fetch data if the dealer-id changes
    } else if (name === 'primary-col') {
      this.updatePrimaryColor(); // Update primary color when it changes
    }
  }

  updatePrimaryColor() {
    const primaryCol = this.getAttribute('primary-col'); // Get primary color from the attribute

    if (primaryCol) {
      this.style.setProperty('--primaryCol', primaryCol); // Set CSS custom property
    }
  }
}

// Define the custom element
customElements.define('stock-fetcher', StockFetcher);
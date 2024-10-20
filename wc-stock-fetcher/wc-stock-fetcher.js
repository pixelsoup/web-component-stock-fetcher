class StockFetcher extends HTMLElement {
  constructor() {
    super(); // Call the parent constructor
    this.attachShadow({ mode: 'open' }); // Create a shadow DOM

    // Create a link element to load external CSS
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './wc-stock-fetcher/wc-stock-fetcher.css');

    // Append the link to the shadow root
    this.shadowRoot.appendChild(link);
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
      this.render({ message: 'Dealer ID not provided.' }); // Handle missing attribute
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
    // Clear existing items from previous fetches
    this.shadowRoot.innerHTML = ''; // Clear previous content

    // Append CSS link again after clearing
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './wc-stock-fetcher/wc-stock-fetcher.css');
    this.shadowRoot.appendChild(link);

    // Create a heading for number of stock items
    const numberOfStockHeading = document.createElement('h3');
    numberOfStockHeading.classList.add('number-of-stock');

    // Get number of stock items
    const numberOfStock = Array.isArray(data) ? data.length : 0;
    numberOfStockHeading.textContent = `Number of Stock Items: ${numberOfStock}`;

    // Create a wrapper for stock items using DocumentFragment
    const stockItemsWrapper = document.createElement('div'); // Create a div for styling
    stockItemsWrapper.classList.add('stockItemsWrapper'); // Add class for styling

    const itemsFragment = document.createDocumentFragment(); // Create a DocumentFragment to hold stock items

    if (Array.isArray(data)) {
      data.forEach(stock => {
        const itemClone = this.createStockItem(stock); // Create a stock item element
        itemsFragment.appendChild(itemClone); // Append it to the fragment
      });
    } else {
      const messageParagraph = document.createElement('p');
      messageParagraph.textContent = data.message; // Show error or message if no data available
      itemsFragment.appendChild(messageParagraph);
    }

    // Append all stock items from the fragment to the wrapper
    stockItemsWrapper.appendChild(itemsFragment);

    // Append heading and wrapper to shadow DOM in correct order
    this.shadowRoot.appendChild(numberOfStockHeading); // Append heading first
    this.shadowRoot.appendChild(stockItemsWrapper); // Append wrapper after heading

    // Set custom property based on primary-col attribute
    this.updatePrimaryColor();
  }

  createStockItem(stock) {
    const itemClone = document.createElement('div'); // Create a new div for stock item
    itemClone.classList.add('stockItem'); // Add class for styling

    const images = stock.images;
    const imageSrc = (Array.isArray(images) && images.length > 0)
                     ? images[0]
                     : 'https://placehold.co/250x167/e1e1e1/bebebe?text=No%20Image&font=lato'; // Fallback image

    itemClone.innerHTML = `
      <p class="stockItemHeading">${stock.make} - ${stock.model}</p>
      <img class="stockItemImage" src="${imageSrc}" alt="${stock.make} ${stock.model}" />
      <div class="stockFeatures">
        <p class="stockFeatureItem"><strong>Transmission</strong> ${stock.transmission || 'N/A'}</p>
        <p class="stockFeatureItem"><strong>Body Type</strong> ${stock.bodyType || 'N/A'}</p>
        <p class="stockFeatureItem"><strong>Color</strong> ${stock.colour || 'N/A'}</p>
        <p class="stockFeatureItem"><strong>Kilometres</strong> ${stock.odometer || 'N/A'}</p>
        <p class="stockFeatureItem"><strong>Engine</strong> ${stock.size || 'N/A'} ${stock.sizeOption || ''}</p>
        <p class="stockFeatureItem"><strong>Stock № </strong> ${stock.stockNumber || 'N/A'}</p>
      </div>
    `;

    return itemClone; // Return the populated list item element
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'dealer-id' && newValue) {
      this.connectedCallback(); // Re-fetch data if the dealer-id changes
    } else if (name === 'primary-col') {
      this.updatePrimaryColor(); // Update primary color when it changes
    }
  }

  updatePrimaryColor() {
    const primaryCol = this.getAttribute('primary-col');

    if (primaryCol) {
      this.style.setProperty('--primaryCol', primaryCol); // Set CSS custom property for primary color
    }
  }
}

// Define the custom element
customElements.define('stock-fetcher', StockFetcher);
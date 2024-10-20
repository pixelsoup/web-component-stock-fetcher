class StockFetcher extends HTMLElement {
  constructor() {
    super(); // Call the parent constructor
    this.attachShadow({ mode: 'open' }); // Create a shadow DOM

    // Create a link element to load external CSS
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './wc-stock-fetcher/wc-stock-fetcher.css'); // Path to CSS file

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
    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild); // Clear previous content
    }

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

    // Populate heading with number of stock items
    numberOfStockHeading.textContent = `Number of Stock Items: ${numberOfStock}`;

    // Create a wrapper for stock items
    const stockItemsWrapper = document.createElement('div');
    stockItemsWrapper.classList.add('stockItemsWrapper');

    if (Array.isArray(data)) {
      data.forEach(stock => {
        const itemClone = this.createStockItem(stock);
        stockItemsWrapper.appendChild(itemClone);
      });
    } else {
      const messageParagraph = document.createElement('p');
      messageParagraph.textContent = data.message;
      stockItemsWrapper.appendChild(messageParagraph);
    }

    // Append heading and wrapper to shadow DOM in correct order
    this.shadowRoot.appendChild(numberOfStockHeading);
    this.shadowRoot.appendChild(stockItemsWrapper);

    // Set custom property based on primary-col attribute
    this.updatePrimaryColor();
  }

  createStockItem(stock) {
    const itemClone = document.createElement('div');
    itemClone.classList.add('stockItem');

  // Use a fallback image if none are available.
  const images = stock.images;
  const imageSrc = (Array.isArray(images) && images.length > 0)
                     ? images[0]
                     : 'https://placehold.co/250x167/e1e1e1/bebebe?text=No%20Image&font=lato';

  // Create elements instead of using innerHTML for better performance and security.
  const heading = document.createElement('p');
  heading.classList.add('stockItemHeading');
  heading.textContent = `${stock.make} - ${stock.model}`;

  const image = document.createElement('img');
  image.classList.add('stockItemImage');
  image.src = imageSrc;
  image.alt = `${stock.make} ${stock.model}`;

  const featuresDiv = document.createElement('div');
  featuresDiv.classList.add('stockFeatures');

  const features = [
    { label: 'Transmission', value: stock.transmission || 'N/A' },
    { label: 'Body Type', value: stock.bodyType || 'N/A' },
    { label: 'Color', value: stock.colour || 'N/A' },
    { label: 'Kilometres', value: stock.odometer || 'N/A' },
    { label: 'Engine', value: `${stock.size || 'N/A'} ${stock.sizeOption || ''}` },
    { label: 'Stock №', value: stock.stockNumber || 'N/A' }
  ];

  features.forEach(feature => {
    const featureItem = document.createElement('p');
    featureItem.classList.add('stockFeatureItem');
    featureItem.innerHTML = `<strong>${feature.label}</strong> ${feature.value}`;
    featuresDiv.appendChild(featureItem);
  });

  itemClone.appendChild(heading);
  itemClone.appendChild(image);
  itemClone.appendChild(featuresDiv);

  return itemClone;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'dealer-id' && newValue) {
      this.connectedCallback();
    } else if (name === 'primary-col') {
      this.updatePrimaryColor();
    }
  }

  updatePrimaryColor() {
    const primaryCol = this.getAttribute('primary-col');

    if (primaryCol) {
      this.style.setProperty('--primaryCol', primaryCol);
    }
  }
}

// Define the custom element
customElements.define('stock-fetcher', StockFetcher);
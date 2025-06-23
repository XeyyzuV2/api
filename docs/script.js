class APIDashboard {
  constructor() {
    this.endpoints = [];
    this.config = {};
    this.theme = 'light';
    this.init();
  }

  // ======================
  // INITIALIZATION
  // ======================
  async init() {
    this.setupTheme();
    this.setupDOM();
    await this.loadData();
    this.render();
    this.setupEventListeners();
    this.hideLoader();
  }

  // ======================
  // CORE FUNCTIONALITY
  // ======================
  async loadData() {
    try {
      const [endpointsRes, configRes] = await Promise.all([
        fetch('/endpoints'),
        fetch('/set')
      ]);
      
      this.endpoints = await endpointsRes.json();
      this.config = await configRes.json();
      
      this.updateMetaData();
    } catch (error) {
      console.error('Error loading data:', error);
      this.showError('Failed to load data. Please refresh the page.');
    }
  }

  updateMetaData() {
    const { config } = this;
    this.setContent('api-icon', 'href', config.icon);
    this.setContent('api-title', 'textContent', config.name.main);
    this.setContent('api-description', 'content', config.description);
    this.setContent('api-name', 'textContent', config.name.main);
    this.setContent('api-author', 'textContent', `by ${config.author}`);
    this.setContent('api-desc', 'textContent', config.description);
    this.setContent('api-copyright', 'textContent', `© 2025 ${config.name.copyright}. All rights reserved.`);
    this.setContent('api-info', 'href', config.info_url);
    
    this.setupApiLinks(config.links || []);
  }

  // ======================
  // THEME MANAGEMENT
  // ======================
  setupTheme() {
    this.theme = localStorage.getItem('theme') || 
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    document.body.classList.add(this.theme);
    this.renderThemeToggle();
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', this.theme);
    this.renderThemeToggle();
  }

  renderThemeToggle() {
    if (!this.themeToggle) {
      this.themeToggle = document.createElement('button');
      this.themeToggle.className = 'ml-4 p-2 rounded-full hover:bg-gray-700 transition';
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
      document.querySelector('nav').appendChild(this.themeToggle);
    }
    
    this.themeToggle.innerHTML = this.theme === 'dark' 
      ? '<span class="material-icons">light_mode</span>' 
      : '<span class="material-icons">dark_mode</span>';
  }

  // ======================
  // RENDERING
  // ======================
  render() {
    this.renderApiContent();
    this.setupSearchFunctionality();
  }

  renderApiContent() {
    const apiContent = document.getElementById('api-content');
    apiContent.innerHTML = '';

    this.endpoints.forEach((category, catIndex) => {
      // Category Header
      const categoryHeader = document.createElement('h3');
      categoryHeader.className = 'mb-4 text-xl font-semibold dark:text-white fade-in';
      categoryHeader.style.animationDelay = `${catIndex * 0.1}s`;
      categoryHeader.textContent = category.name;
      apiContent.appendChild(categoryHeader);

      // Category Items
      const row = document.createElement('div');
      row.className = 'grid gap-3 mb-6';
      apiContent.appendChild(row);

      const sortedItems = Object.entries(category.items)
        .sort(([, a], [, b]) => (a.name || '').localeCompare(b.name || ''))
        .map(([, item]) => item);

      sortedItems.forEach((itemData, index) => {
        const itemName = Object.keys(itemData)[0];
        const item = itemData[itemName];
        
        const itemElement = this.createApiItemElement(itemName, item, index);
        row.appendChild(itemElement);
      });
    });
  }

  createApiItemElement(itemName, item, index) {
    const itemDiv = document.createElement('div');
    itemDiv.className = `bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 fade-in`;
    itemDiv.style.animationDelay = `${0.2 + (index * 0.05)}s`;
    itemDiv.dataset.name = itemName || '';
    itemDiv.dataset.desc = item.desc || '';

    const heroSection = document.createElement('div');
    heroSection.className = 'flex items-center justify-between p-5';

    const textContent = document.createElement('div');
    textContent.className = 'flex-grow mr-4 overflow-hidden';
    
    const title = document.createElement('h5');
    title.className = 'text-lg font-semibold text-gray-800 dark:text-gray-100 truncate';
    title.textContent = itemName || 'Unnamed Item';

    const description = document.createElement('p');
    description.className = 'text-sm text-gray-600 dark:text-gray-400 truncate mt-1';
    description.textContent = item.desc || 'No description';

    textContent.appendChild(title);
    textContent.appendChild(description);

    const button = document.createElement('button');
    button.className = 'px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-all hover:scale-105 get-api-btn';
    button.dataset.apiPath = item.path || '';
    button.dataset.apiName = itemName || '';
    button.dataset.apiDesc = item.desc || '';
    button.innerHTML = 'TRY <span class="material-icons align-middle ml-1 text-sm">chevron_right</span>';

    heroSection.appendChild(textContent);
    heroSection.appendChild(button);
    itemDiv.appendChild(heroSection);

    return itemDiv;
  }

  setupApiLinks(links) {
    const apiLinksContainer = document.getElementById('api-links');
    apiLinksContainer.innerHTML = '';

    links.forEach(link => {
      const linkContainer = document.createElement('div');
      linkContainer.className = 'flex items-center gap-2';

      const bulletPoint = document.createElement('div');
      bulletPoint.className = 'w-2 h-2 bg-primary-500 rounded-full';

      const linkElement = document.createElement('a');
      linkElement.href = link.url;
      linkElement.textContent = link.name;
      linkElement.className = 'text-sm text-primary-600 dark:text-primary-400 hover:underline';
      linkElement.target = '_blank';
      linkElement.rel = 'noopener noreferrer';

      linkContainer.appendChild(bulletPoint);
      linkContainer.appendChild(linkElement);
      apiLinksContainer.appendChild(linkContainer);
    });
  }

  // ======================
  // SEARCH FUNCTIONALITY
  // ======================
  setupSearchFunctionality() {
    const searchInput = document.getElementById('api-search');
    if (!searchInput) return;

    let searchDebounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        const term = e.target.value.toLowerCase().trim();
        
        document.querySelectorAll('#api-content > div').forEach(card => {
          const matches = card.dataset.name.toLowerCase().includes(term) || 
                         card.dataset.desc.toLowerCase().includes(term);
          card.style.display = matches ? 'block' : 'none';
        });
      }, 300);
    });
  }

  // ======================
  // MODAL MANAGEMENT
  // ======================
  openApiModal(name, endpoint, description, method = 'GET') {
    const modal = document.getElementById('api-modal');
    const modalBackdrop = modal.querySelector('.fixed.inset-0.bg-black');
    const modalContent = modal.querySelector('.relative.z-10');
    
    // Reset modal state
    this.resetModal();

    // Set modal content
    document.getElementById('modal-title').textContent = name;
    document.getElementById('api-description').textContent = description;
    document.getElementById('api-method').textContent = method;
    document.getElementById('api-method').className = 
      `px-2 py-1 text-xs font-medium rounded mr-2 ${
        method === 'GET' ? 'bg-blue-100 text-blue-800' :
        method === 'POST' ? 'bg-green-100 text-green-800' :
        method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
        'bg-purple-100 text-purple-800'
      }`;

    // Parse parameters
    this.setupModalParams(endpoint);

    // Show modal
    modal.classList.remove('hidden');
    document.body.classList.add('noscroll');
    
    setTimeout(() => {
      modal.classList.add('opacity-100');
      modalBackdrop.classList.add('opacity-50');
      modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);

    // Setup modal event listeners
    this.setupModalEvents(modal, modalBackdrop, modalContent, endpoint);
  }

  resetModal() {
    const responseContainer = document.getElementById('response-container');
    const paramsContainer = document.getElementById('params-container');
    
    responseContainer.classList.add('hidden');
    document.getElementById('response-data').innerHTML = '';
    document.getElementById('submit-api').classList.remove('hidden');
    paramsContainer.classList.remove('hidden');
    paramsContainer.innerHTML = '';
    
    const existingUrlDisplay = document.querySelector('.urlDisplay');
    if (existingUrlDisplay) existingUrlDisplay.remove();
  }

  setupModalParams(endpoint) {
    const paramsContainer = document.getElementById('params-container');
    const url = new URL(endpoint, window.location.origin);
    
    // Handle query parameters
    const urlParams = url.search ? url.search.substring(1).split('&') : [];
    if (urlParams.length) {
      urlParams.forEach(param => {
        const [key] = param.split('=');
        if (key) this.addParamField(key);
      });
    } 
    // Handle path parameters
    else {
      const placeholderMatch = endpoint.match(/{([^}]+)}/g) || [];
      placeholderMatch.forEach(match => {
        const paramName = match.replace(/{|}/g, '');
        this.addParamField(paramName);
      });
    }
  }

  addParamField(paramName) {
    const paramsContainer = document.getElementById('params-container');
    const isOptional = paramName.startsWith('_');
    const cleanName = paramName.replace(/^_/, '');
    const placeholderText = `Enter ${cleanName}${isOptional ? ' (optional)' : ''}`;

    const paramField = document.createElement('div');
    paramField.className = 'mb-3';
    paramField.innerHTML = `
      <label for="param-${paramName}" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        ${cleanName}${isOptional ? '' : ' *'}
      </label>
      <input type="text" id="param-${paramName}" 
        class="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
        placeholder="${placeholderText}">
      <div id="error-${paramName}" class="text-red-500 text-xs mt-1 hidden">This field is required</div>
    `;
    paramsContainer.appendChild(paramField);
  }

  setupModalEvents(modal, modalBackdrop, modalContent, endpoint) {
    const closeModal = () => {
      modal.classList.remove('opacity-100');
      modalBackdrop.classList.remove('opacity-50');
      modalContent.classList.remove('scale-100', 'opacity-100');
      
      setTimeout(() => {
        modal.classList.add('hidden');
        document.body.classList.remove('noscroll');
      }, 300);
    };

    // Close button
    document.getElementById('close-modal').onclick = closeModal;
    
    // Click outside
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    
    // Escape key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    }, { once: true });
    
    // Submit button
    document.getElementById('submit-api').onclick = () => {
      this.handleApiRequest(endpoint);
    };
  }

  async handleApiRequest(endpoint) {
    // Validate inputs
    if (!this.validateParams()) return;
    
    // Prepare UI for response
    const responseContainer = document.getElementById('response-container');
    const paramsContainer = document.getElementById('params-container');
    const submitBtn = document.getElementById('submit-api');
    const responseData = document.getElementById('response-data');
    
    responseContainer.classList.remove('hidden');
    paramsContainer.classList.add('hidden');
    submitBtn.classList.add('hidden');
    responseData.innerHTML = '<div class="flex justify-center py-4"><div class="loader-small"></div></div>';
    
    // Build the final URL
    const { url: finalUrl, params } = this.buildRequestUrl(endpoint);
    this.displayRequestUrl(finalUrl);
    
    // Make the API call
    try {
      const startTime = Date.now();
      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      await this.displayResponse(response, duration, params);
    } catch (error) {
      this.displayError(error, endTime - startTime);
    }
  }

  validateParams() {
    let isValid = true;
    
    document.querySelectorAll('[id^="error-"]').forEach(el => {
      el.classList.add('hidden');
    });
    
    document.querySelectorAll('#params-container input').forEach(input => {
      const paramName = input.id.replace('param-', '');
      const isOptional = paramName.startsWith('_');
      
      if (!isOptional && input.value.trim() === '') {
        isValid = false;
        document.getElementById(`error-${paramName}`).classList.remove('hidden');
        input.classList.add('border-red-500');
      } else {
        input.classList.remove('border-red-500');
      }
    });
    
    return isValid;
  }

  buildRequestUrl(endpoint) {
    let apiUrl = endpoint;
    const params = {};
    
    document.querySelectorAll('#params-container input').forEach(input => {
      const paramName = input.id.replace('param-', '');
      const paramValue = input.value.trim();
      
      if (paramName.startsWith('_') && paramValue === '') return;
      
      params[paramName] = paramValue;
      
      if (apiUrl.includes(`{${paramName}}`)) {
        apiUrl = apiUrl.replace(`{${paramName}}`, encodeURIComponent(paramValue));
      } else {
        const urlObj = new URL(apiUrl, window.location.origin);
        urlObj.searchParams.set(paramName.replace(/^_/, ''), paramValue);
        apiUrl = urlObj.pathname + urlObj.search;
      }
    });
    
    return {
      url: new URL(apiUrl, window.location.origin).href,
      params
    };
  }

  displayRequestUrl(url) {
    const urlDisplayDiv = document.createElement('div');
    urlDisplayDiv.className = 'urlDisplay mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md font-mono text-xs overflow-hidden flex items-center justify-between';
    
    const urlContent = document.createElement('div');
    urlContent.className = 'break-all text-gray-800 dark:text-gray-200';
    urlContent.textContent = url;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'ml-2 p-1 text-gray-500 hover:text-primary-500 transition';
    copyBtn.innerHTML = '<span class="material-icons text-sm">content_copy</span>';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(url);
      copyBtn.innerHTML = '<span class="material-icons text-sm">done</span>';
      setTimeout(() => {
        copyBtn.innerHTML = '<span class="material-icons text-sm">content_copy</span>';
      }, 2000);
    };
    
    urlDisplayDiv.appendChild(urlContent);
    urlDisplayDiv.appendChild(copyBtn);
    
    const responseContainer = document.getElementById('response-container');
    responseContainer.parentNode.insertBefore(urlDisplayDiv, responseContainer);
  }

  async displayResponse(response, duration, params) {
    const responseData = document.getElementById('response-data');
    const responseStatus = document.getElementById('response-status');
    const responseTime = document.getElementById('response-time');
    
    // Update status
    responseStatus.textContent = response.status;
    responseStatus.className = response.ok 
      ? 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 mr-2 rounded'
      : 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 mr-2 rounded';
    
    responseTime.textContent = `${duration}ms`;
    
    // Handle different content types
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await response.json();
      responseData.innerHTML = this.formatJSONResponse(data);
    } 
    else if (contentType.includes('image/') || contentType.includes('video/') || contentType.includes('audio/')) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      if (contentType.includes('image/')) {
        responseData.innerHTML = `<img src="${objectUrl}" alt="Response" class="max-w-full h-auto rounded">`;
      } 
      else if (contentType.includes('video/')) {
        responseData.innerHTML = `
          <video controls class="max-w-full rounded">
            <source src="${objectUrl}" type="${contentType}">
            Your browser doesn't support video
          </video>`;
      } 
      else {
        responseData.innerHTML = `
          <audio controls class="w-full">
            <source src="${objectUrl}" type="${contentType}">
            Your browser doesn't support audio
          </audio>`;
      }
    }
    else {
      const text = await response.text();
      responseData.innerHTML = `<pre class="whitespace-pre-wrap break-words">${text}</pre>`;
    }
  }

  formatJSONResponse(data) {
    // Create interactive JSON viewer
    const container = document.createElement('div');
    container.className = 'json-viewer';
    
    const pre = document.createElement('pre');
    pre.className = 'text-sm overflow-auto max-h-96';
    pre.textContent = JSON.stringify(data, null, 2);
    
    container.appendChild(pre);
    
    // Add copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'absolute top-2 right-2 p-1 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition';
    copyBtn.innerHTML = '<span class="material-icons text-sm">content_copy</span>';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      copyBtn.innerHTML = '<span class="material-icons text-sm">done</span>';
      setTimeout(() => {
        copyBtn.innerHTML = '<span class="material-icons text-sm">content_copy</span>';
      }, 2000);
    };
    
    container.appendChild(copyBtn);
    return container.outerHTML;
  }

  displayError(error, duration) {
    const responseData = document.getElementById('response-data');
    const responseStatus = document.getElementById('response-status');
    const responseTime = document.getElementById('response-time');
    
    responseStatus.textContent = 'Error';
    responseStatus.className = 'px-2 py-1 text-xs font-medium bg-red-100 text-red-800 mr-2 rounded';
    responseTime.textContent = `${duration}ms`;
    
    responseData.innerHTML = `
      <div class="text-red-500 p-3 bg-red-50 dark:bg-red-900/20 rounded">
        <div class="font-medium">${error.name || 'Error'}</div>
        <div class="text-sm mt-1">${error.message || 'Unknown error occurred'}</div>
      </div>`;
  }

  // ======================
  // UTILITY FUNCTIONS
  // ======================
  setContent(id, property, value) {
    const element = document.getElementById(id);
    if (element) element[property] = value;
  }

  showLoader() {
    document.body.style.top = `-${window.scrollY}px`;
    document.body.classList.add('noscroll');
    document.getElementById('page-loader').style.display = 'flex';
    setTimeout(() => {
      document.getElementById('page-loader').style.opacity = '1';
    }, 10);
  }

  hideLoader() {
    setTimeout(() => {
      const scrollPosition = parseInt(document.body.style.top || '0') * -1;
      document.body.classList.remove('noscroll');
      document.body.style.top = '';
      window.scrollTo(0, scrollPosition);
      
      document.getElementById('page-loader').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('page-loader').style.display = 'none';
      }, 300);
    }, 500);
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  setupEventListeners() {
    // API button handlers
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('get-api-btn') || event.target.closest('.get-api-btn')) {
        const btn = event.target.classList.contains('get-api-btn') ? event.target : event.target.closest('.get-api-btn');
        const { apiPath, apiName, apiDesc } = btn.dataset;
        
        const currentItem = this.endpoints
          .flatMap(category => Object.values(category.items))
          .map(itemData => {
            const itemName = Object.keys(itemData)[0];
            return { name: itemName, ...itemData[itemName] };
          })
          .find(item => item.path === apiPath && item.name === apiName);
        
        this.openApiModal(apiName, apiPath, apiDesc);
      }
    });
  }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new APIDashboard();
});

import JSearchProvider from './jsearchProvider.js';
import MockProvider from './mockProvider.js';

/**
 * Job Provider Factory
 * Creates and manages job search providers
 */
class JobProviderFactory {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = 'jsearch';
    
    // Register available providers
    this.registerProvider('jsearch', JSearchProvider);
    this.registerProvider('mock', MockProvider);
  }

  /**
   * Register a new provider class
   * @param {string} name - Provider name
   * @param {class} ProviderClass - Provider class extending BaseJobProvider
   */
  registerProvider(name, ProviderClass) {
    this.providers.set(name, ProviderClass);
  }

  /**
   * Get a provider instance
   * @param {string} name - Provider name (optional, uses default if not specified)
   * @param {Object} config - Provider configuration
   * @returns {BaseJobProvider} - Provider instance
   */
  getProvider(name = null, config = {}) {
    const providerName = name || this.defaultProvider;
    const ProviderClass = this.providers.get(providerName);

    if (!ProviderClass) {
      console.warn(`Provider '${providerName}' not found, falling back to mock`);
      return new MockProvider(config);
    }

    const provider = new ProviderClass(config);

    // If provider is not configured, fall back to mock
    if (!provider.isConfigured()) {
      console.log(`Provider '${providerName}' not configured, using mock data`);
      return new MockProvider(config);
    }

    return provider;
  }

  /**
   * Set the default provider
   * @param {string} name - Provider name
   */
  setDefaultProvider(name) {
    if (this.providers.has(name)) {
      this.defaultProvider = name;
    } else {
      console.warn(`Provider '${name}' not found`);
    }
  }

  /**
   * Get list of available providers
   * @returns {Array<string>}
   */
  getAvailableProviders() {
    return Array.from(this.providers.keys());
  }
}

// Export singleton instance
const factory = new JobProviderFactory();

export { factory as JobProviderFactory };
export { JSearchProvider, MockProvider };
export default factory;

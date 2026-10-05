const ZerodhaAdapter = require('./zerodha/zerodha.adapter');
const UpstoxAdapter = require('./upstox/upstox.adapter');

class BrokerFactory {
  /**
   * Get broker adapter instance
   * @param {string} brokerCode - 'ZERODHA' | 'UPSTOX'
   * @param {Object} credentials - { apiKey, apiSecret, accessToken, accountRef }
   * @returns {IBrokerAdapter}
   */
  static getAdapter(brokerCode, credentials) {
    const code = brokerCode.toUpperCase();
    switch (code) {
      case 'ZERODHA':
        return new ZerodhaAdapter(credentials);
      case 'UPSTOX':
        return new UpstoxAdapter(credentials);
      default:
        throw new Error(`Unsupported broker code: ${brokerCode}`);
    }
  }

  /**
   * List supported brokers on platform
   */
  static getSupportedBrokers() {
    return [
      {
        code: 'ZERODHA',
        name: 'Zerodha Kite Connect',
        authType: 'API_KEY_AND_TOKEN',
        supportedSegments: ['EQUITY', 'F&O', 'COMMODITY', 'CURRENCY'],
        active: true,
      },
      {
        code: 'UPSTOX',
        name: 'Upstox Pro API',
        authType: 'OAUTH2',
        supportedSegments: ['EQUITY', 'F&O', 'COMMODITY'],
        active: true,
      },
      {
        code: 'ANGELONE',
        name: 'Angel One SmartAPI',
        authType: 'TOTP_AND_MPIN',
        supportedSegments: ['EQUITY', 'F&O'],
        active: false, // Coming soon
      },
    ];
  }
}

module.exports = BrokerFactory;

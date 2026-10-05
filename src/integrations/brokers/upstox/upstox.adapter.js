const IBrokerAdapter = require('../broker.interface');

class UpstoxAdapter extends IBrokerAdapter {
  constructor(credentials) {
    super(credentials);
    this.brokerCode = 'UPSTOX';
    this.apiKey = credentials.apiKey;
    this.accessToken = credentials.accessToken;
    this.accountRef = credentials.accountRef;
  }

  async authenticate() {
    if (!this.accessToken) {
      return { success: false, message: 'Access token is required for Upstox' };
    }
    return {
      success: true,
      broker: 'UPSTOX',
      accountRef: this.accountRef,
      status: 'CONNECTED',
    };
  }

  async getProfile() {
    return {
      broker: 'UPSTOX',
      userId: this.accountRef,
      userName: `Upstox Trader (${this.accountRef})`,
      email: `${this.accountRef.toLowerCase()}@client.upstox.com`,
      brokerStatus: 'ACTIVE',
    };
  }

  async getFunds() {
    return {
      broker: 'UPSTOX',
      availableMargin: 200000.0,
      usedMargin: 15000.0,
      collateral: 0.0,
      currency: 'INR',
    };
  }

  async getPositions() {
    return {
      net: [],
      day: [],
    };
  }

  async getOrders() {
    return [];
  }

  async placeOrder(orderParams) {
    const { symbol, exchange, side, type, quantity, price } = orderParams;
    const mockOrderId = `UPSTOX_${Date.now()}`;
    return {
      success: true,
      brokerOrderId: mockOrderId,
      status: 'OPEN',
      symbol,
      exchange: exchange || 'NSE',
      side,
      quantity,
      price,
      timestamp: new Date().toISOString(),
    };
  }

  async cancelOrder(brokerOrderId) {
    return {
      success: true,
      brokerOrderId,
      status: 'CANCELLED',
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = UpstoxAdapter;

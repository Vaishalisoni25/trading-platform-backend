const IBrokerAdapter = require('../broker.interface');

class ZerodhaAdapter extends IBrokerAdapter {
  constructor(credentials) {
    super(credentials);
    this.brokerCode = 'ZERODHA';
    this.apiKey = credentials.apiKey;
    this.accessToken = credentials.accessToken;
    this.accountRef = credentials.accountRef;
  }

  async authenticate() {
    // In production, hits https://api.kite.trade/user/profile
    if (!this.accessToken) {
      return { success: false, message: 'Access token is required for Zerodha' };
    }
    return {
      success: true,
      broker: 'ZERODHA',
      accountRef: this.accountRef,
      status: 'CONNECTED',
    };
  }

  async getProfile() {
    return {
      broker: 'ZERODHA',
      userId: this.accountRef,
      userName: `Zerodha Trader (${this.accountRef})`,
      email: `${this.accountRef.toLowerCase()}@client.zerodha.com`,
      brokerStatus: 'ACTIVE',
    };
  }

  async getFunds() {
    return {
      broker: 'ZERODHA',
      availableMargin: 150000.0,
      usedMargin: 25000.0,
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
    const mockOrderId = `ZER_${Date.now()}`;
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

module.exports = ZerodhaAdapter;

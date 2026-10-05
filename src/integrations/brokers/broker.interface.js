/**
 * Standard Broker Adapter Interface
 * All broker implementations (Zerodha, Upstox, AngelOne, etc.) must implement this interface.
 */
class IBrokerAdapter {
  constructor(credentials) {
    this.credentials = credentials;
  }

  /**
   * Validate authorization / token
   */
  async authenticate() {
    throw new Error('Method authenticate() must be implemented');
  }

  /**
   * Get user profile and account details from broker
   */
  async getProfile() {
    throw new Error('Method getProfile() must be implemented');
  }

  /**
   * Get available funds, margins, and collateral
   */
  async getFunds() {
    throw new Error('Method getFunds() must be implemented');
  }

  /**
   * Fetch current open positions from broker
   */
  async getPositions() {
    throw new Error('Method getPositions() must be implemented');
  }

  /**
   * Fetch order book / orders from broker
   */
  async getOrders() {
    throw new Error('Method getOrders() must be implemented');
  }

  /**
   * Place an order on broker
   * @param {Object} orderParams - { symbol, exchange, side, type, quantity, price, triggerPrice }
   */
  async placeOrder(orderParams) {
    throw new Error('Method placeOrder() must be implemented');
  }

  /**
   * Cancel an open order
   * @param {string} brokerOrderId 
   */
  async cancelOrder(brokerOrderId) {
    throw new Error('Method cancelOrder() must be implemented');
  }
}

module.exports = IBrokerAdapter;

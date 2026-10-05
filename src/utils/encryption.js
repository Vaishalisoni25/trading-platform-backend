const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'trading_platform_fallback_secret_key_32_bytes!')
  .digest();

/**
 * Encrypt sensitive plain text (e.g. Broker API Secret, Access Token)
 * @param {string} text 
 * @returns {string} iv:encryptedData (hex)
 */
const encrypt = (text) => {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypt cipher text
 * @param {string} encryptedText in format iv:encryptedData
 * @returns {string} plain text
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const [ivHex, dataHex] = encryptedText.split(':');
    if (!ivHex || !dataHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    let decrypted = decipher.update(dataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error.message);
    return null;
  }
};

/**
 * Mask sensitive string for UI display (e.g. "ZER12345" -> "ZER****45")
 * @param {string} str 
 * @returns {string}
 */
const maskCredential = (str) => {
  if (!str) return '****';
  if (str.length <= 4) return '****';
  return str.slice(0, 3) + '****' + str.slice(-2);
};

module.exports = {
  encrypt,
  decrypt,
  maskCredential,
};

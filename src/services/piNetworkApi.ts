/**
 * Pi Network API Service
 * 
 * This service provides methods to interact with the Pi Network API.
 * It uses environment variables for configuration.
 */

// API configuration from environment variables or localStorage
let API_KEY = import.meta.env.VITE_PI_NETWORK_API_KEY || localStorage.getItem('PI_NETWORK_API_KEY');
let API_URL = import.meta.env.VITE_PI_NETWORK_API_URL || localStorage.getItem('PI_NETWORK_API_URL') || 'https://api.minepi.com/v2';

// Set default API key if none is found
if (!API_KEY) {
  // Default API key - this will be overridden by user input in the ApiKeySetup component
  API_KEY = 'qiaosfanwgacik1zpzqykwnnxj1avnfch2ojhcjpsvcfmk2ximte6nzpbov74cfz';
  localStorage.setItem('PI_NETWORK_API_KEY', API_KEY);
}

// Check if API key is configured
if (!API_KEY) {
  console.warn('Pi Network API key is not configured. Please set it in the API configuration panel.');
}

/**
 * Interface for API response
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Interface for wallet data from Pi Network
 */
export interface PiNetworkWallet {
  address: string;
  balance: number;
  transactions: PiNetworkTransaction[];
}

/**
 * Interface for transaction data from Pi Network
 */
export interface PiNetworkTransaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'send' | 'receive';
}

/**
 * Base API request function with error handling
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `API request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get wallet information by address
 */
export async function getWalletByAddress(address: string): Promise<ApiResponse<PiNetworkWallet>> {
  return apiRequest<PiNetworkWallet>(`/wallets/${address}`);
}

/**
 * Get wallet information by seed phrase
 * Note: In a real implementation, this would be handled securely on the backend
 * This is just a mock implementation for demonstration
 */
export async function getWalletBySeedPhrase(seedPhrase: string): Promise<ApiResponse<PiNetworkWallet>> {
  // This is a mock implementation
  // In a real app, you would never send the seed phrase to an API
  // Instead, you would derive the private key and address locally
  
  // For demo purposes, we'll just call the mock API
  return apiRequest<PiNetworkWallet>('/wallets/by-seed', {
    method: 'POST',
    body: JSON.stringify({ seedPhrase }),
  });
}

/**
 * Send Pi from one wallet to another
 */
export async function sendPi(
  fromAddress: string, 
  toAddress: string, 
  amount: number,
  privateKey: string // In a real app, this would be handled more securely
): Promise<ApiResponse<PiNetworkTransaction>> {
  return apiRequest<PiNetworkTransaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      from: fromAddress,
      to: toAddress,
      amount,
      privateKey, // In a real app, you would sign the transaction locally instead
    }),
  });
}

/**
 * Get transaction history for a wallet
 */
export async function getTransactionHistory(address: string): Promise<ApiResponse<PiNetworkTransaction[]>> {
  return apiRequest<PiNetworkTransaction[]>(`/wallets/${address}/transactions`);
}

/**
 * Check if the API is properly configured
 */
export function isApiConfigured(): boolean {
  return !!API_KEY;
}

/**
 * Get the current Pi exchange rate (mock implementation)
 */
export async function getPiExchangeRate(): Promise<ApiResponse<{ usd: number }>> {
  return apiRequest<{ usd: number }>('/exchange-rates/pi-usd');
}

/**
 * Set API key at runtime
 */
export function setApiKey(apiKey: string): void {
  localStorage.setItem('PI_NETWORK_API_KEY', apiKey);
  API_KEY = apiKey;
}

/**
 * Set API URL at runtime
 */
export function setApiUrl(apiUrl: string): void {
  localStorage.setItem('PI_NETWORK_API_URL', apiUrl);
  API_URL = apiUrl;
}

// Pi Network Wallet Service
// This is a mock implementation for demonstration purposes

import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39';
import * as piNetworkApi from './piNetworkApi';

// Interface for Transaction
export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'send' | 'receive';
}

// Interface for Wallet
export interface Wallet {
  address: string;
  privateKey: string;
  balance: number;
  transactions: Transaction[];
  seedPhrase?: string;
  isViewOnly?: boolean;
}

// Generate a random string to use as ID
const generateRandomId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Generate a random hex string of specified length
const generateRandomHex = (length: number): string => {
  const characters = '0123456789abcdef';
  let result = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += characters[randomValues[i] % characters.length];
  }
  
  return result;
};

// Simple hash function for browser environment
const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Create a new wallet with a randomly generated private key and address
 */
export const createWallet = async (): Promise<Wallet> => {
  const seedPhrase = generateMnemonic(256); // Generate 24-word seed phrase (256 bits)
  const seed = mnemonicToSeedSync(seedPhrase);
  const privateKey = generateRandomHex(64);
  const addressInput = privateKey + Date.now().toString();
  const address = await sha256(addressInput);
  
  return {
    address: address.substring(0, 40),
    privateKey,
    balance: 0,
    transactions: [],
    seedPhrase
  };
};

/**
 * Import a wallet using a wallet address
 * Uses the Pi Network API if configured, otherwise falls back to mock data
 */
export const importWalletFromAddress = async (address: string): Promise<Wallet> => {
  // Check if the Pi Network API is configured
  if (piNetworkApi.isApiConfigured()) {
    try {
      // Try to get wallet data from the Pi Network API
      const response = await piNetworkApi.getWalletByAddress(address);
      
      if (response.success && response.data) {
        // Generate a mock private key for demo purposes
        // In a real implementation, this would be a view-only wallet
        const mockPrivateKey = generateRandomHex(64);
        
        return {
          address: response.data.address,
          privateKey: mockPrivateKey, // This is just for demo purposes
          balance: response.data.balance,
          transactions: response.data.transactions.map(tx => ({
            ...tx,
            type: tx.from === address ? 'send' : 'receive'
          })),
        };
      }
      
      throw new Error(response.error || 'Failed to fetch wallet data');
    } catch (error) {
      console.error('Error importing wallet from address:', error);
      // Fall back to mock data if API call fails
    }
  }
  
  // Generate mock data if API is not configured or call failed
  const mockPrivateKey = generateRandomHex(64);
  
  return {
    address,
    privateKey: mockPrivateKey,
    balance: 100, // Mock balance
    transactions: generateMockTransactions(5, address),
  };
};

/**
 * Import a wallet using a seed phrase
 * Must be a 24-word seed phrase
 */
export const importWalletFromSeedPhrase = async (seedPhrase: string): Promise<Wallet> => {
  try {
    // Validate the seed phrase
    const normalizedSeedPhrase = seedPhrase.trim().toLowerCase();
    
    // Check if it's a valid seed phrase with proper word count
    const words = normalizedSeedPhrase.split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      throw new Error(`Invalid seed phrase: expected 12 or 24 words, got ${words.length}`);
    }
    
    // Use BIP39 validation, but provide more helpful error if it fails
    if (!validateMnemonic(normalizedSeedPhrase)) {
      console.error('Seed phrase validation failed. Make sure all words are valid BIP39 words.');
      throw new Error('Invalid seed phrase. Make sure all words are from the BIP39 word list.');
    }
    
    // Check if the Pi Network API is configured
    if (piNetworkApi.isApiConfigured()) {
      try {
        // Try to get wallet data from the Pi Network API
        console.log('Fetching wallet data from Pi Network API using seed phrase');
        const response = await piNetworkApi.getWalletBySeedPhrase(normalizedSeedPhrase);
        
        if (response.success && response.data) {
          // Generate private key from seed phrase
          const seed = mnemonicToSeedSync(normalizedSeedPhrase);
          const privateKey = Array.from(seed.slice(0, 32))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          return {
            address: response.data.address,
            privateKey,
            balance: response.data.balance,
            transactions: response.data.transactions.map(tx => ({
              ...tx,
              type: tx.from === response.data.address ? 'send' : 'receive'
            })),
            seedPhrase: normalizedSeedPhrase,
            isViewOnly: false
          };
        } else {
          console.error('API error:', response.error);
          throw new Error(response.error || 'Failed to fetch wallet data from Pi Network API');
        }
      } catch (error) {
        console.error('Error fetching wallet from Pi Network API:', error);
        // Fall back to local generation if API call fails
      }
    }
    
    // Generate wallet locally if API is not configured or call failed
    const seed = mnemonicToSeedSync(normalizedSeedPhrase);
    const privateKey = Array.from(seed.slice(0, 32))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const addressInput = privateKey + '1'; // Adding a constant suffix for deterministic address generation
    const address = await sha256(addressInput);
    
    return {
      address: address.substring(0, 40),
      privateKey,
      balance: 100, // Mock balance
      transactions: generateMockTransactions(5, address.substring(0, 40)),
      seedPhrase: normalizedSeedPhrase
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to import wallet with seed phrase');
    }
  }
};

/**
 * Import a wallet using a private key
 */
export const importWalletFromPrivateKey = async (privateKey: string): Promise<Wallet> => {
  const addressInput = privateKey + '1'; // Adding a constant suffix for deterministic address generation
  const address = await sha256(addressInput);
  
  return {
    address: address.substring(0, 40),
    privateKey,
    balance: 100, // Mock balance
    transactions: generateMockTransactions(5, address.substring(0, 40)),
  };
};

/**
 * Import a wallet using both wallet address and seed phrase
 * This provides full access to the wallet
 */
export const importWalletFromAddressAndSeedPhrase = async (address: string, seedPhrase: string): Promise<Wallet> => {
  console.log('Attempting to import wallet with address and seed phrase');
  
  // Validate inputs
  if (!address || !seedPhrase) {
    throw new Error('Both wallet address and seed phrase are required');
  }
  
  try {
    // Validate the seed phrase
    const normalizedSeedPhrase = seedPhrase.trim().toLowerCase();
    
    // Check if it's a valid seed phrase with proper word count
    const words = normalizedSeedPhrase.split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      throw new Error(`Invalid seed phrase: expected 12 or 24 words, got ${words.length}`);
    }
    
    // Use BIP39 validation, but provide more helpful error if it fails
    if (!validateMnemonic(normalizedSeedPhrase)) {
      console.error('Seed phrase validation failed. Make sure all words are valid BIP39 words.');
      throw new Error('Invalid seed phrase. Make sure all words are from the BIP39 word list.');
    }
    
    // Check if the Pi Network API is configured
    if (piNetworkApi.isApiConfigured()) {
      try {
        // Try to get wallet data from the Pi Network API
        console.log('Fetching wallet data from Pi Network API');
        const response = await piNetworkApi.getWalletByAddress(address);
        
        if (response.success && response.data) {
          // Generate private key from seed phrase
          const seed = mnemonicToSeedSync(normalizedSeedPhrase);
          const privateKey = Array.from(seed.slice(0, 32))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          // Create the wallet with real data from API
          return {
            address: response.data.address,
            privateKey,
            balance: response.data.balance,
            transactions: response.data.transactions.map(tx => ({
              ...tx,
              type: tx.from === response.data.address ? 'send' : 'receive'
            })),
            seedPhrase: normalizedSeedPhrase
          };
        } else {
          console.error('API error:', response.error);
          throw new Error(response.error || 'Failed to fetch wallet data from Pi Network');
        }
      } catch (error) {
        console.error('Error importing wallet from API:', error);
        throw new Error('Failed to connect to Pi Network API. Please check your API key and network connection.');
      }
    } else {
      throw new Error('Pi Network API is not configured. Please set your API key in the .env file.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to import wallet with address and seed phrase');
    }
  }
};

/**
 * Import a wallet using just the wallet address
 * This provides view-only access to the wallet
 */
export const importWalletWithAddress = async (address: string): Promise<Wallet> => {
  console.log('Importing wallet with address:', address);
  
  if (!address) {
    throw new Error('Wallet address is required');
  }
  
  try {
    // Check if the Pi Network API is configured
    if (piNetworkApi.isApiConfigured()) {
      // Try to get wallet data from the Pi Network API
      const response = await piNetworkApi.getWalletByAddress(address);
      
      if (response.success && response.data) {
        // Create a view-only wallet (no private key or seed phrase)
        return {
          address: response.data.address,
          balance: response.data.balance,
          transactions: response.data.transactions.map(tx => ({
            ...tx,
            type: tx.from === response.data.address ? 'send' : 'receive'
          })),
          isViewOnly: true
        };
      } else {
        console.error('API error:', response.error);
        throw new Error(response.error || 'Failed to fetch wallet data from Pi Network');
      }
    } else {
      throw new Error('Pi Network API is not configured. Please set your API key in the .env file.');
    }
  } catch (error) {
    console.error('Error importing wallet with address:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to import wallet with address');
    }
  }
};

/**
 * Import a wallet using just the seed phrase
 * This provides full access to the wallet
 */
export const importWalletWithSeedPhrase = async (seedPhrase: string): Promise<Wallet> => {
  console.log('Importing wallet with seed phrase');
  
  if (!seedPhrase) {
    throw new Error('Seed phrase is required');
  }
  
  try {
    // Validate the seed phrase
    const normalizedSeedPhrase = seedPhrase.trim().toLowerCase();
    
    // Check if it's a valid seed phrase with proper word count
    const words = normalizedSeedPhrase.split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      throw new Error(`Invalid seed phrase: expected 12 or 24 words, got ${words.length}`);
    }
    
    // Use BIP39 validation, but provide more helpful error if it fails
    if (!validateMnemonic(normalizedSeedPhrase)) {
      console.error('Seed phrase validation failed. Make sure all words are valid BIP39 words.');
      throw new Error('Invalid seed phrase. Make sure all words are from the BIP39 word list.');
    }
    
    // Check if the Pi Network API is configured
    if (piNetworkApi.isApiConfigured()) {
      try {
        // Try to get wallet data from the Pi Network API using the seed phrase
        console.log('Fetching wallet data from Pi Network API using seed phrase');
        const response = await piNetworkApi.getWalletBySeedPhrase(normalizedSeedPhrase);
        
        if (response.success && response.data) {
          // Generate private key from seed phrase
          const seed = mnemonicToSeedSync(normalizedSeedPhrase);
          const privateKey = Array.from(seed.slice(0, 32))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
          
          // Create the wallet with real data from API
          return {
            address: response.data.address,
            privateKey,
            balance: response.data.balance,
            transactions: response.data.transactions.map(tx => ({
              ...tx,
              type: tx.from === response.data.address ? 'send' : 'receive'
            })),
            seedPhrase: normalizedSeedPhrase,
            isViewOnly: false
          };
        } else {
          console.error('API error:', response.error);
          throw new Error(response.error || 'Failed to fetch wallet data from Pi Network');
        }
      } catch (error) {
        console.error('Error importing wallet from API:', error);
        throw new Error('Failed to connect to Pi Network API. Please check your API key and network connection.');
      }
    } else {
      throw new Error('Pi Network API is not configured. Please set your API key in the .env file.');
    }
  } catch (error) {
    console.error('Error importing wallet with seed phrase:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to import wallet with seed phrase');
    }
  }
};

/**
 * Send Pi from one wallet to another
 */
export const sendPi = async (
  fromAddress: string,
  toAddress: string,
  amount: number,
  privateKey: string
): Promise<Transaction> => {
  console.log('Sending Pi from', fromAddress, 'to', toAddress);
  
  if (!fromAddress || !toAddress || !amount || !privateKey) {
    throw new Error('Missing required parameters for sending Pi');
  }
  
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  try {
    // Check if the Pi Network API is configured
    if (piNetworkApi.isApiConfigured()) {
      // Send Pi using the Pi Network API
      const response = await piNetworkApi.sendPi(fromAddress, toAddress, amount, privateKey);
      
      if (response.success && response.data) {
        // Return the transaction data from the API
        return {
          id: response.data.id,
          from: response.data.from,
          to: response.data.to,
          amount: response.data.amount,
          timestamp: response.data.timestamp,
          status: response.data.status,
          type: 'send'
        };
      } else {
        console.error('API error:', response.error);
        throw new Error(response.error || 'Failed to send Pi');
      }
    } else {
      throw new Error('Pi Network API is not configured. Please set your API key in the .env file.');
    }
  } catch (error) {
    console.error('Error sending Pi:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to send Pi');
    }
  }
};

/**
 * Generate mock transactions for testing
 */
export const generateMockTransactions = (count: number, address: string): Transaction[] => {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const isSend = Math.random() > 0.5;
    
    transactions.push({
      id: generateRandomId(),
      from: isSend ? address : generateRandomHex(40),
      to: isSend ? generateRandomHex(40) : address,
      amount: Math.floor(Math.random() * 100) + 1,
      timestamp: Date.now() - Math.floor(Math.random() * 10000000),
      status: 'completed',
      type: isSend ? 'send' : 'receive'
    });
  }
  
  // Sort by timestamp (newest first)
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Get a mock transaction by ID
 */
export const getTransactionById = (transactions: Transaction[], id: string): Transaction | undefined => {
  return transactions.find(tx => tx.id === id);
};

/**
 * Get transaction history for a wallet
 */
export const getTransactionHistory = async (wallet: Wallet): Promise<Transaction[]> => {
  // Check if the Pi Network API is configured
  if (piNetworkApi.isApiConfigured()) {
    try {
      // Try to get transaction history from the Pi Network API
      const response = await piNetworkApi.getTransactionHistory(wallet.address);
      
      if (response.success && response.data) {
        return response.data.map(tx => ({
          ...tx,
          type: tx.from === wallet.address ? 'send' : 'receive'
        }));
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      // Fall back to local transactions if API call fails
    }
  }
  
  // Return local transactions if API is not configured or call failed
  return wallet.transactions;
};

/**
 * Refresh wallet data
 */
export const refreshWallet = async (wallet: Wallet): Promise<Wallet> => {
  // Check if the Pi Network API is configured
  if (piNetworkApi.isApiConfigured()) {
    try {
      // Try to get updated wallet data from the Pi Network API
      const response = await piNetworkApi.getWalletByAddress(wallet.address);
      
      if (response.success && response.data) {
        return {
          ...wallet,
          balance: response.data.balance,
          transactions: response.data.transactions.map(tx => ({
            ...tx,
            type: tx.from === wallet.address ? 'send' : 'receive'
          }))
        };
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
      // Fall back to mock refresh if API call fails
    }
  }
  
  // Generate mock refresh if API is not configured or call failed
  const newTransactions = generateMockTransactions(2, wallet.address);
  
  // Add new transactions to the wallet
  const updatedTransactions = [...newTransactions, ...wallet.transactions];
  
  // Calculate new balance based on transactions
  const receivedAmount = newTransactions
    .filter(tx => tx.type === 'receive')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  return {
    ...wallet,
    balance: wallet.balance + receivedAmount,
    transactions: updatedTransactions
  };
};

/**
 * Format Pi amount with 2 decimal places
 */
export const formatPiAmount = (amount: number): string => {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Format wallet address for display (truncate middle)
 */
export const formatAddress = (address: string): string => {
  if (address.length <= 12) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
};

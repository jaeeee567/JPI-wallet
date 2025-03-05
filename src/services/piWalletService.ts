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
    if (!validateMnemonic(seedPhrase)) {
      throw new Error('Invalid seed phrase');
    }
    
    // Check if it's a 24-word seed phrase
    const wordCount = seedPhrase.trim().split(/\s+/).length;
    if (wordCount !== 24) {
      throw new Error(`Invalid seed phrase: expected 24 words, got ${wordCount}`);
    }
    
    // Check if the Pi Network API is configured
    if (piNetworkApi.isApiConfigured()) {
      try {
        // Try to get wallet data from the Pi Network API
        const response = await piNetworkApi.getWalletBySeedPhrase(seedPhrase);
        
        if (response.success && response.data) {
          // Generate private key from seed phrase
          const seed = mnemonicToSeedSync(seedPhrase);
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
            seedPhrase
          };
        }
        
        throw new Error(response.error || 'Failed to fetch wallet data');
      } catch (error) {
        console.error('Error importing wallet from seed phrase:', error);
        // Fall back to local generation if API call fails
      }
    }
    
    // Generate wallet locally if API is not configured or call failed
    const seed = mnemonicToSeedSync(seedPhrase);
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
      seedPhrase
    };
  } catch (error) {
    throw new Error('Invalid seed phrase');
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
 * Send Pi from one wallet to another
 */
export const sendPi = async (
  fromWallet: Wallet,
  toAddress: string,
  amount: number
): Promise<{ success: boolean; transaction: Transaction; updatedWallet: Wallet }> => {
  // Check if wallet has enough balance
  if (fromWallet.balance < amount) {
    throw new Error('Insufficient balance');
  }
  
  // Check if the Pi Network API is configured
  if (piNetworkApi.isApiConfigured()) {
    try {
      // Try to send Pi using the Pi Network API
      const response = await piNetworkApi.sendPi(
        fromWallet.address,
        toAddress,
        amount,
        fromWallet.privateKey
      );
      
      if (response.success && response.data) {
        // Create a transaction from the API response
        const transaction: Transaction = {
          ...response.data,
          type: 'send'
        };
        
        // Update the wallet
        const updatedWallet: Wallet = {
          ...fromWallet,
          balance: fromWallet.balance - amount,
          transactions: [transaction, ...fromWallet.transactions]
        };
        
        return {
          success: true,
          transaction,
          updatedWallet
        };
      }
      
      throw new Error(response.error || 'Failed to send Pi');
    } catch (error) {
      console.error('Error sending Pi:', error);
      // Fall back to mock transaction if API call fails
    }
  }
  
  // Create a mock transaction if API is not configured or call failed
  const transaction: Transaction = {
    id: generateRandomId(),
    from: fromWallet.address,
    to: toAddress,
    amount,
    timestamp: Date.now(),
    status: 'completed',
    type: 'send'
  };
  
  // Update the wallet
  const updatedWallet: Wallet = {
    ...fromWallet,
    balance: fromWallet.balance - amount,
    transactions: [transaction, ...fromWallet.transactions]
  };
  
  return {
    success: true,
    transaction,
    updatedWallet
  };
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

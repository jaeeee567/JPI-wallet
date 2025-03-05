// Pi Network Wallet Service
// This is a mock implementation for demonstration purposes

import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import { randomBytes, createHash } from 'crypto';

// Interface for Transaction
export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  timestamp: number;
  address: string;
  status: 'pending' | 'completed' | 'failed';
}

// Interface for Wallet
export interface Wallet {
  address: string;
  privateKey: string;
  balance: number;
  transactions: Transaction[];
}

// Generate a random Pi address
export function generateAddress(): string {
  const hash = createHash('sha256')
    .update(randomBytes(32))
    .digest('hex');
  return `pi${hash.substring(0, 34)}`;
}

// Generate a random private key
export function generatePrivateKey(): string {
  return randomBytes(32).toString('hex');
}

// Create a new wallet
export function createWallet(): Wallet {
  const privateKey = generatePrivateKey();
  const address = generateAddress();
  
  return {
    address,
    privateKey,
    balance: 0,
    transactions: []
  };
}

// Generate a seed phrase (mnemonic)
export function generateSeedPhrase(): string {
  return generateMnemonic();
}

// Import wallet from private key
export function importFromPrivateKey(privateKey: string): Wallet {
  // In a real implementation, this would derive the address from the private key
  // For this mock, we'll generate a deterministic address based on the private key
  const hash = createHash('sha256')
    .update(privateKey)
    .digest('hex');
  const address = `pi${hash.substring(0, 34)}`;
  
  return {
    address,
    privateKey,
    balance: Math.floor(Math.random() * 10000) / 100, // Random balance for demo
    transactions: generateMockTransactions(address, 5)
  };
}

// Import wallet from seed phrase
export function importFromSeedPhrase(seedPhrase: string): Wallet {
  // In a real implementation, this would derive the private key and address from the seed phrase
  // For this mock, we'll generate a deterministic private key and address
  const seed = mnemonicToSeedSync(seedPhrase).toString('hex');
  const privateKey = seed.substring(0, 64);
  const hash = createHash('sha256')
    .update(privateKey)
    .digest('hex');
  const address = `pi${hash.substring(0, 34)}`;
  
  return {
    address,
    privateKey,
    balance: Math.floor(Math.random() * 10000) / 100, // Random balance for demo
    transactions: generateMockTransactions(address, 5)
  };
}

// Send Pi to another address
export function sendPi(wallet: Wallet, toAddress: string, amount: number): Promise<Transaction> {
  return new Promise((resolve, reject) => {
    if (amount <= 0) {
      reject(new Error('Amount must be greater than 0'));
      return;
    }
    
    if (amount > wallet.balance) {
      reject(new Error('Insufficient balance'));
      return;
    }
    
    // Simulate network delay
    setTimeout(() => {
      const transaction: Transaction = {
        id: randomBytes(16).toString('hex'),
        type: 'send',
        amount,
        timestamp: Date.now(),
        address: toAddress,
        status: 'completed'
      };
      
      // Update wallet
      wallet.balance -= amount;
      wallet.transactions.unshift(transaction);
      
      resolve(transaction);
    }, 1000);
  });
}

// Generate mock transactions for demo
export function generateMockTransactions(address: string, count: number): Transaction[] {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const isSend = Math.random() > 0.5;
    const transaction: Transaction = {
      id: randomBytes(16).toString('hex'),
      type: isSend ? 'send' : 'receive',
      amount: Math.floor(Math.random() * 10000) / 100,
      timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in the last 30 days
      address: isSend ? generateAddress() : address,
      status: 'completed'
    };
    
    transactions.push(transaction);
  }
  
  // Sort by timestamp (newest first)
  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

// Format Pi amount with 2 decimal places
export function formatPiAmount(amount: number): string {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format wallet address for display (truncate middle)
export function formatAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Format timestamp to relative time (e.g., "2 hours ago")
export function formatTimestamp(timestamp: number): string {
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
}

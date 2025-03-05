import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as PiWalletService from './piWalletService';
import { Wallet, Transaction } from './piWalletService';

interface WalletContextType {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  createNewWallet: () => void;
  importWalletFromPrivateKey: (privateKey: string) => Promise<void>;
  importWalletFromSeedPhrase: (seedPhrase: string) => Promise<void>;
  sendPi: (toAddress: string, amount: number) => Promise<Transaction>;
  copyAddressToClipboard: () => Promise<void>;
  formatAddress: (address: string) => string;
  formatPiAmount: (amount: number) => string;
  formatTimestamp: (timestamp: number) => string;
  generateQRCode: () => string;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for saved wallet on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('piWallet');
    if (savedWallet) {
      try {
        setWallet(JSON.parse(savedWallet));
      } catch (err) {
        console.error('Failed to parse saved wallet', err);
        localStorage.removeItem('piWallet');
      }
    }
  }, []);

  // Save wallet to localStorage when it changes
  useEffect(() => {
    if (wallet) {
      localStorage.setItem('piWallet', JSON.stringify(wallet));
    }
  }, [wallet]);

  const createNewWallet = () => {
    try {
      setLoading(true);
      setError(null);
      const newWallet = PiWalletService.createWallet();
      // For demo purposes, add some Pi and mock transactions
      newWallet.balance = 1234.56;
      newWallet.transactions = PiWalletService.generateMockTransactions(newWallet.address, 5);
      setWallet(newWallet);
    } catch (err) {
      setError('Failed to create wallet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const importWalletFromPrivateKey = async (privateKey: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const importedWallet = PiWalletService.importFromPrivateKey(privateKey);
      setWallet(importedWallet);
    } catch (err) {
      setError('Failed to import wallet from private key');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const importWalletFromSeedPhrase = async (seedPhrase: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const importedWallet = PiWalletService.importFromSeedPhrase(seedPhrase);
      setWallet(importedWallet);
    } catch (err) {
      setError('Failed to import wallet from seed phrase');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendPi = async (toAddress: string, amount: number): Promise<Transaction> => {
    if (!wallet) {
      throw new Error('No wallet available');
    }

    try {
      setLoading(true);
      setError(null);
      const transaction = await PiWalletService.sendPi(wallet, toAddress, amount);
      // Update the wallet with the new balance and transaction
      setWallet({ ...wallet });
      return transaction;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send Pi');
      }
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const copyAddressToClipboard = async (): Promise<void> => {
    if (!wallet) {
      throw new Error('No wallet available');
    }

    try {
      await navigator.clipboard.writeText(wallet.address);
    } catch (err) {
      console.error('Failed to copy address to clipboard', err);
      throw err;
    }
  };

  const generateQRCode = (): string => {
    if (!wallet) {
      return '';
    }
    
    // In a real app, you would use a QR code library
    // For this demo, we'll return a placeholder URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(wallet.address)}`;
  };

  const value = {
    wallet,
    loading,
    error,
    createNewWallet,
    importWalletFromPrivateKey,
    importWalletFromSeedPhrase,
    sendPi,
    copyAddressToClipboard,
    formatAddress: PiWalletService.formatAddress,
    formatPiAmount: PiWalletService.formatPiAmount,
    formatTimestamp: PiWalletService.formatTimestamp,
    generateQRCode,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

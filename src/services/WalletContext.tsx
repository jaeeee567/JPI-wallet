import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as piWalletService from './piWalletService';
import { Wallet, Transaction } from './piWalletService';

interface WalletContextType {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  createNewWallet: () => Promise<void>;
  importWalletWithAddress: (address: string) => Promise<void>;
  importWalletWithSeedPhrase: (seedPhrase: string) => Promise<void>;
  sendPi: (toAddress: string, amount: number) => Promise<Transaction>;
  refreshWallet: () => Promise<void>;
  clearWallet: () => void;
  formatAddress: (address: string) => string;
  formatPiAmount: (amount: number) => string;
  formatTimestamp: (timestamp: number) => string;
  generateQRCode: (text: string) => string;
  copyAddressToClipboard: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load wallet from localStorage on component mount
  useEffect(() => {
    const savedWallet = localStorage.getItem('piWallet');
    if (savedWallet) {
      try {
        setWallet(JSON.parse(savedWallet));
      } catch (err) {
        console.error('Failed to parse saved wallet:', err);
        localStorage.removeItem('piWallet');
      }
    }
  }, []);

  // Save wallet to localStorage whenever it changes
  useEffect(() => {
    if (wallet) {
      localStorage.setItem('piWallet', JSON.stringify(wallet));
    }
  }, [wallet]);

  const createNewWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      const newWallet = await piWalletService.createWallet();
      setWallet(newWallet);
    } catch (err) {
      setError('Failed to create wallet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const importWalletWithAddress = async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      const importedWallet = await piWalletService.importWalletFromAddress(address);
      setWallet(importedWallet);
    } catch (err) {
      setError('Failed to import wallet with address');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const importWalletWithSeedPhrase = async (seedPhrase: string) => {
    try {
      setLoading(true);
      setError(null);
      const importedWallet = await piWalletService.importWalletFromSeedPhrase(seedPhrase);
      setWallet(importedWallet);
    } catch (err) {
      setError('Failed to import wallet with seed phrase');
      console.error(err);
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
      const result = await piWalletService.sendPi(wallet, toAddress, amount);
      setWallet(result.updatedWallet);
      return result.transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send Pi';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    if (!wallet) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedWallet = await piWalletService.refreshWallet(wallet);
      setWallet(updatedWallet);
    } catch (err) {
      setError('Failed to refresh wallet');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearWallet = () => {
    setWallet(null);
    localStorage.removeItem('piWallet');
  };

  const copyAddressToClipboard = async (): Promise<void> => {
    if (!wallet) return;
    
    try {
      await navigator.clipboard.writeText(wallet.address);
    } catch (err) {
      console.error('Failed to copy address to clipboard', err);
    }
  };

  const generateQRCode = (text: string): string => {
    // This is a placeholder. In a real app, you would use a QR code library
    // For now, we'll return a URL to a QR code generator service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const value = {
    wallet,
    loading,
    error,
    createNewWallet,
    importWalletWithAddress,
    importWalletWithSeedPhrase,
    sendPi,
    refreshWallet,
    clearWallet,
    formatAddress: piWalletService.formatAddress,
    formatPiAmount: piWalletService.formatPiAmount,
    formatTimestamp: piWalletService.formatTimestamp,
    generateQRCode,
    copyAddressToClipboard,
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

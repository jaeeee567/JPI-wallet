import { useState, useEffect } from 'react';
import { useWallet } from './services/WalletContext';
import SendModal from './components/SendModal';
import ReceiveModal from './components/ReceiveModal';
import QRCodeModal from './components/QRCodeModal';
import TransactionHistory from './components/TransactionHistory';
import TransactionHistoryView from './components/TransactionHistoryView';
import SettingsView from './components/SettingsView';
import ApiKeySetup from './components/ApiKeySetup';
import * as piNetworkApi from './services/piNetworkApi';
import { ArrowUpRight, ArrowDownLeft, QrCode, Settings, History, Copy, LogOut, RefreshCw } from 'lucide-react';

function App() {
  const { 
    wallet, 
    loading, 
    error, 
    createNewWallet, 
    importWalletWithAddress,
    importWalletWithSeedPhrase,
    importWalletWithAddressAndSeedPhrase,
    refreshWallet,
    clearWallet,
    copyAddressToClipboard,
    formatAddress,
    formatPiAmount
  } = useWallet();

  const [view, setView] = useState<'wallet' | 'history' | 'settings'>('wallet');
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [seedPhraseInput, setSeedPhraseInput] = useState('');
  const [importType, setImportType] = useState<'address' | 'seedPhrase' | 'combined'>('combined');
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  useEffect(() => {
    // Check if API key is configured
    const apiKey = import.meta.env.VITE_PI_NETWORK_API_KEY || localStorage.getItem('PI_NETWORK_API_KEY');
    setApiKeyConfigured(!!apiKey);
  }, []);

  const handleApiKeySet = (apiKey: string) => {
    piNetworkApi.setApiKey(apiKey);
    setApiKeyConfigured(true);
  };

  // Handle wallet creation or import
  const handleCreateWallet = async () => {
    await createNewWallet();
  };

  const handleImportWallet = async () => {
    console.log('handleImportWallet called');
    
    try {
      if (importType === 'address') {
        console.log('Importing wallet with address:', addressInput);
        await importWalletWithAddress(addressInput);
      } else if (importType === 'seedPhrase') {
        console.log('Importing wallet with seed phrase');
        await importWalletWithSeedPhrase(seedPhraseInput);
      } else if (importType === 'combined') {
        console.log('Importing wallet with combined method');
        await importWalletWithAddressAndSeedPhrase(addressInput, seedPhraseInput);
      } else {
        console.error('Unknown import type:', importType);
      }
    } catch (err) {
      console.error('Import error:', err);
      // The error will be caught and displayed by the WalletContext
    }
  };

  const handleRefreshWallet = async () => {
    await refreshWallet();
  };

  const handleLogout = () => {
    clearWallet();
  };

  // Render the appropriate view
  const renderView = () => {
    switch (view) {
      case 'history':
        return <TransactionHistoryView />;
      case 'settings':
        return <SettingsView onLogout={handleLogout} />;
      default:
        return renderMainView();
    }
  };

  const renderMainView = () => {
    if (!wallet) {
      return renderWalletCreation();
    }
    
    return (
      <div className="p-4">
        {renderWalletDashboard()}
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            disabled={wallet.isViewOnly}
          >
            <ArrowUpRight className="mr-2" size={20} />
            <span>Send</span>
          </button>
          
          <button
            onClick={() => setShowReceiveModal(true)}
            className="flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ArrowDownLeft className="mr-2" size={20} />
            <span>Receive</span>
          </button>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
          <TransactionHistory transactions={wallet.transactions.slice(0, 5)} />
          
          {wallet.transactions.length > 5 && (
            <button
              onClick={() => setView('history')}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all transactions
            </button>
          )}
        </div>
        
        <button
          onClick={clearWallet}
          className="mt-6 w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="mr-2" size={16} />
          <span>Logout</span>
        </button>
      </div>
    );
  };

  const renderWalletDashboard = () => {
    if (!wallet) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">My Pi Wallet</h2>
            <div className="flex items-center space-x-2">
              {wallet.isViewOnly ? (
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">View Only</span>
              ) : (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Full Access</span>
              )}
              <button 
                onClick={handleRefreshWallet}
                className="text-white hover:text-blue-200"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{formatPiAmount(wallet.balance)}</span>
            <span className="ml-1">π</span>
          </div>
          
          <div className="mt-1 text-blue-100 text-sm flex items-center">
            <span className="truncate">{formatAddress(wallet.address)}</span>
            <button 
              onClick={copyAddressToClipboard}
              className="ml-2 text-blue-200 hover:text-white"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render wallet creation UI
  const renderWalletCreation = () => {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome to JPI Wallet</h2>
          
          <div className="mb-6">
            <button
              onClick={handleCreateWallet}
              className="w-full bg-orange-500 text-white py-3 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors mb-4"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create New Wallet'}
            </button>
            
            <div className="text-center my-4">
              <span className="text-gray-500">or</span>
            </div>
            
            <div className="mb-4">
              <div className="flex mb-4">
                <button
                  onClick={() => setImportType('combined')}
                  className={`flex-1 py-2 ${importType === 'combined' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'}`}
                >
                  Full Access
                </button>
                <button
                  onClick={() => setImportType('address')}
                  className={`flex-1 py-2 ${importType === 'address' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'}`}
                >
                  View Only
                </button>
                <button
                  onClick={() => setImportType('seedPhrase')}
                  className={`flex-1 py-2 ${importType === 'seedPhrase' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500'}`}
                >
                  Seed Only
                </button>
              </div>
              
              {(importType === 'address' || importType === 'combined') && (
                <input
                  type="text"
                  placeholder="Enter wallet address"
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                />
              )}
              
              {(importType === 'seedPhrase' || importType === 'combined') && (
                <textarea
                  placeholder="Enter 24-word seed phrase (separated by spaces)"
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-24"
                  value={seedPhraseInput}
                  onChange={(e) => setSeedPhraseInput(e.target.value)}
                />
              )}
              
              <button
                onClick={() => {
                  console.log('Import button clicked');
                  handleImportWallet();
                }}
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                {loading ? 'Importing...' : 'Import Wallet'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mt-4">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-orange-500">JPI Wallet</h1>
          
          {wallet && (
            <div className="flex space-x-4">
              <button
                onClick={() => setView('wallet')}
                className={`flex items-center ${view === 'wallet' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <QrCode size={20} className="mr-1" />
                <span className="hidden sm:inline">Wallet</span>
              </button>
              <button
                onClick={() => setView('history')}
                className={`flex items-center ${view === 'history' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <History size={20} className="mr-1" />
                <span className="hidden sm:inline">History</span>
              </button>
              <button
                onClick={() => setView('settings')}
                className={`flex items-center ${view === 'settings' ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Settings size={20} className="mr-1" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-lg mx-auto py-6">
        {!apiKeyConfigured && !wallet && (
          <ApiKeySetup onApiKeySet={handleApiKeySet} />
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {renderView()}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} JPI Wallet. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
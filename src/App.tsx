import { useState, useEffect } from 'react';
import { useWallet } from './services/WalletContext';
import SendModal from './components/SendModal';
import ReceiveModal from './components/ReceiveModal';
import QRCodeModal from './components/QRCodeModal';
import TransactionHistory from './components/TransactionHistory';
import TransactionHistoryView from './components/TransactionHistoryView';
import SettingsView from './components/SettingsView';
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
        return renderWalletView();
    }
  };

  // Render the wallet view (default)
  const renderWalletView = () => {
    if (!wallet) {
      return renderWalletCreation();
    }

    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">My Wallet</h2>
              <div className="flex items-center mt-1">
                <p className="text-sm text-gray-600">{formatAddress(wallet.address)}</p>
                <button 
                  onClick={copyAddressToClipboard} 
                  className="ml-2 text-orange-500 hover:text-orange-600"
                  title="Copy address"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <button 
              onClick={handleRefreshWallet}
              className="text-orange-500 hover:text-orange-600"
              title="Refresh wallet"
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
            <h1 className="text-4xl font-bold text-gray-800">{formatPiAmount(wallet.balance)} π</h1>
          </div>
          
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setShowSendModal(true)}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg mr-2 flex items-center justify-center hover:bg-orange-600 transition-colors"
            >
              <ArrowUpRight size={18} className="mr-2" />
              Send
            </button>
            <button
              onClick={() => setShowReceiveModal(true)}
              className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg ml-2 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowDownLeft size={18} className="mr-2" />
              Receive
            </button>
          </div>
        </div>
        
        <TransactionHistory />
        
        {showSendModal && <SendModal onClose={() => setShowSendModal(false)} />}
        {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} onShowQR={() => {
          setShowReceiveModal(false);
          setShowQRCodeModal(true);
        }} />}
        {showQRCodeModal && <QRCodeModal onClose={() => setShowQRCodeModal(false)} />}
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
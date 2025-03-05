import React, { useState, useEffect } from 'react';
import { Wallet, Send, QrCode, Settings, History, ArrowDownToLine, Copy, ExternalLink, Import, X, Eye, EyeOff, Check } from 'lucide-react';
import { useWallet } from './services/WalletContext';
import SendModal from './components/SendModal';
import ReceiveModal from './components/ReceiveModal';
import QRCodeModal from './components/QRCodeModal';
import TransactionHistory from './components/TransactionHistory';
import TransactionHistoryView from './components/TransactionHistoryView';
import SettingsView from './components/SettingsView';

function App() {
  const { wallet, createNewWallet, copyAddressToClipboard, formatPiAmount, formatAddress } = useWallet();
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState<'privateKey' | 'seedPhrase'>('privateKey');
  const [importValue, setImportValue] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [currentView, setCurrentView] = useState<'wallet' | 'history' | 'settings'>('wallet');
  const [copied, setCopied] = useState(false);

  // Create a wallet if none exists
  useEffect(() => {
    if (!wallet) {
      createNewWallet();
    }
  }, [wallet, createNewWallet]);

  const handleCopyAddress = async () => {
    try {
      await copyAddressToClipboard();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address', err);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    // This is now handled by the wallet context
    console.log('Importing wallet with:', importType, importValue);
    setShowImportModal(false);
    setImportValue('');
  };

  // Render different views based on navigation
  if (currentView === 'history') {
    return <TransactionHistoryView onBack={() => setCurrentView('wallet')} />;
  }

  if (currentView === 'settings') {
    return <SettingsView onBack={() => setCurrentView('wallet')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-700">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wallet className="text-orange-400 w-8 h-8" />
          <h1 className="text-2xl font-bold text-white">JPI Wallet</h1>
        </div>
        <button onClick={() => setCurrentView('settings')}>
          <Settings className="text-white w-6 h-6" />
        </button>
      </header>

      {/* Main Balance Card */}
      <div className="mx-4 p-6 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
        <p className="text-center text-gray-300">Total Balance</p>
        <p className="text-4xl font-bold text-center text-white mt-2">
          {wallet ? formatPiAmount(wallet.balance) : '0.00'} JPI
        </p>
        
        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
          <button 
            onClick={() => setShowReceiveModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
          >
            <ArrowDownToLine className="w-5 h-5" />
            Receive
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
          >
            <Import className="w-5 h-5" />
            Import
          </button>
        </div>
      </div>

      {/* Address Card */}
      <div className="mx-4 mt-6 p-4 bg-white/5 backdrop-blur-lg rounded-xl">
        <div className="flex justify-between items-center">
          <p className="text-gray-300">Wallet Address</p>
          <div className="flex gap-2">
            <button 
              onClick={handleCopyAddress}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-300" />
              )}
            </button>
            <button 
              onClick={() => setShowQRCodeModal(true)}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <QrCode className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>
        <p className="text-white font-mono mt-1">
          {wallet ? formatAddress(wallet.address) : '0x0000...0000'}
        </p>
      </div>

      {/* Recent Transactions */}
      <div className="mx-4 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-lg font-semibold">Recent Transactions</h2>
          <button 
            onClick={() => setCurrentView('history')}
            className="text-orange-400 flex items-center gap-1"
          >
            View All <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        
        <TransactionHistory limit={3} />
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg p-4">
        <div className="flex justify-around">
          <button 
            onClick={() => setCurrentView('wallet')}
            className={`flex flex-col items-center ${
              currentView === 'wallet' ? 'text-orange-400' : 'text-white opacity-80 hover:opacity-100'
            }`}
          >
            <Wallet className="w-6 h-6" />
            <span className="text-xs mt-1">Wallet</span>
          </button>
          <button 
            onClick={() => setCurrentView('history')}
            className={`flex flex-col items-center ${
              currentView === 'history' ? 'text-orange-400' : 'text-white opacity-80 hover:opacity-100'
            }`}
          >
            <History className="w-6 h-6" />
            <span className="text-xs mt-1">History</span>
          </button>
          <button 
            onClick={() => setCurrentView('settings')}
            className={`flex flex-col items-center ${
              currentView === 'settings' ? 'text-orange-400' : 'text-white opacity-80 hover:opacity-100'
            }`}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>

      {/* Import Wallet Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Import Wallet</h2>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleImport}>
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setImportType('privateKey')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    importType === 'privateKey' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white/5 text-gray-300'
                  }`}
                >
                  Private Key
                </button>
                <button
                  type="button"
                  onClick={() => setImportType('seedPhrase')}
                  className={`flex-1 py-2 px-4 rounded-lg ${
                    importType === 'seedPhrase' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-white/5 text-gray-300'
                  }`}
                >
                  Seed Phrase
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 mb-2">
                  {importType === 'privateKey' ? 'Enter Private Key' : 'Enter Seed Phrase'}
                </label>
                <div className="relative">
                  <textarea
                    value={importValue}
                    onChange={(e) => setImportValue(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={importType === 'privateKey' 
                      ? 'Enter your private key'
                      : 'Enter your 12 or 24-word seed phrase'
                    }
                    rows={3}
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-3 text-gray-300 hover:text-white"
                  >
                    {showSecret ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold"
              >
                Import Wallet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <SendModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
      <ReceiveModal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} />
      <QRCodeModal isOpen={showQRCodeModal} onClose={() => setShowQRCodeModal(false)} />
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LogOut, Shield, Moon, Sun, Globe } from 'lucide-react';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  
  // These would come from the wallet context in a real implementation
  const privateKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const seedPhrase = "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-700">
      {/* Header */}
      <header className="p-6 flex items-center">
        <button 
          onClick={onBack}
          className="mr-4 text-white"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </header>

      {/* Settings List */}
      <div className="mx-4 mb-20">
        <div className="space-y-4">
          {/* Appearance */}
          <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl">
            <h2 className="text-white font-semibold mb-4">Appearance</h2>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="text-orange-400 w-5 h-5" />
                ) : (
                  <Sun className="text-orange-400 w-5 h-5" />
                )}
                <span className="text-white">Dark Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl">
            <h2 className="text-white font-semibold mb-4">Security</h2>
            
            <div className="space-y-6">
              {/* Private Key */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <Shield className="text-orange-400 w-5 h-5" />
                    <span className="text-white">Private Key</span>
                  </div>
                  <button 
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="text-gray-300 hover:text-white"
                  >
                    {showPrivateKey ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-white font-mono text-sm break-all">
                    {showPrivateKey ? privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  </p>
                </div>
              </div>

              {/* Seed Phrase */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <Shield className="text-orange-400 w-5 h-5" />
                    <span className="text-white">Seed Phrase</span>
                  </div>
                  <button 
                    onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                    className="text-gray-300 hover:text-white"
                  >
                    {showSeedPhrase ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-white font-mono text-sm break-all">
                    {showSeedPhrase ? seedPhrase : '•••• •••• •••• •••• •••• •••• •••• •••• •••• •••• •••• ••••'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Network */}
          <div className="p-4 bg-white/10 backdrop-blur-lg rounded-xl">
            <h2 className="text-white font-semibold mb-4">Network</h2>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Globe className="text-orange-400 w-5 h-5" />
                <span className="text-white">Pi Network</span>
              </div>
              <span className="text-green-400 text-sm">Connected</span>
            </div>
          </div>

          {/* Logout */}
          <button className="w-full p-4 bg-red-500/20 text-red-300 rounded-xl flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

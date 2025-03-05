import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useWallet } from '../services/WalletContext';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({ isOpen, onClose }) => {
  const { wallet, copyAddressToClipboard, generateQRCode } = useWallet();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !wallet) return null;

  const handleCopyAddress = async () => {
    try {
      await copyAddressToClipboard();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Receive Pi</h2>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg mb-6">
            <img 
              src={generateQRCode()} 
              alt="QR Code" 
              className="w-48 h-48"
            />
          </div>

          <p className="text-gray-300 mb-2">Your Pi Address</p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 w-full mb-6">
            <p className="text-white font-mono text-center break-all">
              {wallet.address}
            </p>
          </div>

          <button
            onClick={handleCopyAddress}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copy Address
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveModal;

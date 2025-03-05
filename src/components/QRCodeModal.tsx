import React from 'react';
import { X } from 'lucide-react';
import { useWallet } from '../services/WalletContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const { wallet, generateQRCode } = useWallet();

  if (!isOpen || !wallet) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Wallet QR Code</h2>
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
              className="w-64 h-64"
            />
          </div>

          <p className="text-gray-300 mb-2">Your Pi Address</p>
          <p className="text-white font-mono text-center break-all mb-4">
            {wallet.address}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

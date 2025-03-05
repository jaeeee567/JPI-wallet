import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWallet } from '../services/WalletContext';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendModal: React.FC<SendModalProps> = ({ isOpen, onClose }) => {
  const { wallet, sendPi, formatPiAmount } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!recipient.trim()) {
      setError('Please enter a recipient address');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!wallet) {
      setError('No wallet available');
      return;
    }

    if (amountValue > wallet.balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setIsLoading(true);
      await sendPi(recipient, amountValue);
      setSuccess(true);
      setRecipient('');
      setAmount('');
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send Pi');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Send Pi</h2>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-400 text-xl mb-2">Transaction Successful!</div>
            <p className="text-white">Your Pi has been sent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter recipient's Pi address"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  JPI
                </div>
              </div>
              {wallet && (
                <div className="text-right mt-1 text-gray-400 text-sm">
                  Balance: {formatPiAmount(wallet.balance)} JPI
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Pi'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendModal;

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import TransactionHistory from './TransactionHistory';

interface TransactionHistoryViewProps {
  onBack: () => void;
}

const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({ onBack }) => {
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
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
      </header>

      {/* Transaction List */}
      <div className="mx-4 mb-20">
        <TransactionHistory />
      </div>
    </div>
  );
};

export default TransactionHistoryView;

import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useWallet } from '../services/WalletContext';
import { Transaction } from '../services/piWalletService';

interface TransactionHistoryProps {
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  limit, 
  showViewAll = false,
  onViewAll
}) => {
  const { wallet, formatPiAmount, formatTimestamp, formatAddress } = useWallet();

  if (!wallet) {
    return (
      <div className="text-center py-8 text-gray-400">
        No wallet loaded
      </div>
    );
  }

  if (wallet.transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No transactions yet
      </div>
    );
  }

  const transactions = limit 
    ? wallet.transactions.slice(0, limit) 
    : wallet.transactions;

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <TransactionItem 
          key={transaction.id} 
          transaction={transaction}
          formatPiAmount={formatPiAmount}
          formatTimestamp={formatTimestamp}
          formatAddress={formatAddress}
        />
      ))}
      
      {showViewAll && limit && wallet.transactions.length > limit && (
        <button 
          onClick={onViewAll}
          className="w-full py-3 text-center text-orange-400 hover:text-orange-300 bg-white/5 rounded-xl"
        >
          View All Transactions
        </button>
      )}
    </div>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
  formatPiAmount: (amount: number) => string;
  formatTimestamp: (timestamp: number) => string;
  formatAddress: (address: string) => string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  formatPiAmount,
  formatTimestamp,
  formatAddress
}) => {
  const isSend = transaction.type === 'send';
  
  return (
    <div className="p-4 bg-white/5 backdrop-blur-lg rounded-xl flex justify-between items-center">
      <div className="flex items-center gap-3">
        {isSend ? (
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <ArrowUpRight className="text-red-400 w-5 h-5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <ArrowDownLeft className="text-green-400 w-5 h-5" />
          </div>
        )}
        
        <div>
          <p className="text-white">{isSend ? 'Sent' : 'Received'}</p>
          <p className="text-sm text-gray-400">
            {formatTimestamp(transaction.timestamp)}
          </p>
          <p className="text-xs text-gray-500">
            {isSend ? `To: ${formatAddress(transaction.address)}` : `From: ${formatAddress(transaction.address)}`}
          </p>
        </div>
      </div>
      <p className={`font-medium ${isSend ? 'text-red-400' : 'text-green-400'}`}>
        {isSend ? '-' : '+'}{formatPiAmount(transaction.amount)} JPI
      </p>
    </div>
  );
};

export default TransactionHistory;

import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useWallet } from '../services/WalletContext';
import { Transaction } from '../services/piWalletService';

interface TransactionHistoryProps {
  transactions?: Transaction[];
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions,
  limit, 
  showViewAll = false,
  onViewAll
}) => {
  const { wallet, formatPiAmount, formatTimestamp, formatAddress } = useWallet();
  
  // Use provided transactions or get from wallet
  const txList = transactions || (wallet ? wallet.transactions : []);

  if (!txList.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        No transactions yet
      </div>
    );
  }

  // Apply limit if specified
  const displayedTransactions = limit ? txList.slice(0, limit) : txList;

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {displayedTransactions.map((transaction) => (
        <TransactionItem 
          key={transaction.id}
          transaction={transaction}
          formatPiAmount={formatPiAmount}
          formatTimestamp={formatTimestamp}
          formatAddress={formatAddress}
        />
      ))}
      
      {showViewAll && txList.length > (limit || 0) && onViewAll && (
        <div className="p-3 text-center border-t border-gray-100">
          <button 
            onClick={onViewAll}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            View all transactions
          </button>
        </div>
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

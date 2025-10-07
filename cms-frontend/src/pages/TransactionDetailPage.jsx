import React from 'react';
import { useParams } from 'react-router-dom';

const TransactionDetailPage = () => {
  const { transactionId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
        <p className="mt-1 text-sm text-gray-500">
          Transaction ID: {transactionId}
        </p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-gray-500">Transaction detail page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailPage;

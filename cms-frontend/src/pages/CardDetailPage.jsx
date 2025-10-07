import React from 'react';
import { useParams } from 'react-router-dom';

const CardDetailPage = () => {
  const { cardId } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Card Details</h1>
        <p className="mt-1 text-sm text-gray-500">
          Card ID: {cardId}
        </p>
      </div>
      
      <div className="card">
        <div className="card-body">
          <p className="text-gray-500">Card detail page coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default CardDetailPage;

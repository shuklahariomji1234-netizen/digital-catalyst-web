import React from 'react';
import { WebsiteSettings, ProductWithRating, Review } from '../App';
import RatingsAndReviews from './RatingsAndReviews';

interface CongratulationsProps {
  settings: WebsiteSettings;
  onBack: () => void;
  product: ProductWithRating | null;
  reviews: Review[];
  onAddReview: (d: Omit<Review, 'name' | 'date'>) => void;
  onGoToPurchases: () => void;
}

const Congratulations: React.FC<CongratulationsProps> = ({ 
    settings, onBack, product, reviews, onAddReview, onGoToPurchases 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-2xl w-full text-center space-y-6 border border-gray-100">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Payment Successful!</h1>
        <p className="text-lg text-gray-600">
            Thank you for your purchase. You now have instant access to your digital products.
        </p>

        {product && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-6 flex flex-col md:flex-row items-center gap-6 text-left">
                <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="w-24 h-24 object-cover rounded-lg shadow-sm"
                />
                <div>
                    <h3 className="font-bold text-xl text-gray-800">{product.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                </div>
            </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button 
                onClick={onGoToPurchases}
                className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-all shadow-lg transform hover:-translate-y-1"
            >
                Access My Purchases
            </button>
            <button 
                onClick={onBack}
                className="bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-50 transition-all"
            >
                Return Home
            </button>
        </div>
      </div>

      {product && settings.features.showReviews && (
          <div className="mt-12 w-full max-w-4xl">
              <RatingsAndReviews 
                  settings={settings}
                  productTitle={product.title}
                  reviews={reviews}
                  onAddReview={onAddReview}
                  prompt="How was your shopping experience?"
                  isLoggedIn={true} 
              />
          </div>
      )}
    </div>
  );
};

export default Congratulations;
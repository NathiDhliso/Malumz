import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export const PurchasePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, polling, error
  const [message, setMessage] = useState('Verifying your purchase...');
  
  useEffect(() => {
    const urlStatus = searchParams.get('status');
    const checkoutId = sessionStorage.getItem('checkoutId');
    const checkoutTimestamp = sessionStorage.getItem('checkoutTimestamp');
    
    if (urlStatus === 'success' && checkoutId) {
      // Check if timestamp is less than 10 minutes old
      const isRecent = checkoutTimestamp && (Date.now() - parseInt(checkoutTimestamp, 10)) < 10 * 60 * 1000;
      
      if (isRecent) {
        setStatus('polling');
        startPolling(checkoutId);
      } else {
        setStatus('error');
        setMessage('Checkout session expired. Please try purchasing again.');
        sessionStorage.removeItem('checkoutId');
        sessionStorage.removeItem('checkoutTimestamp');
      }
    } else if (urlStatus === 'cancel' || urlStatus === 'failure') {
      setStatus('error');
      setMessage('Payment was cancelled or failed. Please try again.');
    } else {
      // No active checkout
      navigate('/book');
    }
  }, [searchParams, navigate]);

  const startPolling = async (checkoutId) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const poll = async () => {
      attempts++;
      try {
        const response = await fetch('https://public-api.proprofile.co.za/public/malumz/activate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ checkoutId })
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        if (data.status === 'activated') {
          sessionStorage.removeItem('checkoutId');
          sessionStorage.removeItem('checkoutTimestamp');
          setStatus('success');
          setMessage('Purchase successful! Your audiobook is now unlocked.');
        } else if (data.status === 'pending') {
          if (attempts >= maxAttempts) {
            setStatus('error');
            setMessage('Payment is still processing. Please check your email for the confirmation shortly.');
            sessionStorage.removeItem('checkoutId');
            sessionStorage.removeItem('checkoutTimestamp');
          } else {
            // Poll again after 3 seconds
            setTimeout(poll, 3000);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts >= maxAttempts) {
          setStatus('error');
          setMessage('We had trouble verifying your payment right now, but your order is safe. Please check your email shortly.');
          sessionStorage.removeItem('checkoutId');
          sessionStorage.removeItem('checkoutTimestamp');
        } else {
          setTimeout(poll, 3000);
        }
      }
    };
    
    poll();
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-malumz-cream px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-malumz-brown/10">
        
        {status === 'loading' || status === 'polling' ? (
          <div className="flex flex-col items-center">
            <Loader2 size={64} className="text-malumz-orange animate-spin mb-6" />
            <h2 className="font-serif text-2xl font-bold text-malumz-text-primary mb-3">
              Processing Payment
            </h2>
            <p className="text-malumz-text-secondary">{message}</p>
            {status === 'polling' && (
              <p className="text-malumz-text-muted text-sm mt-4 italic">
                Please do not close this window...
              </p>
            )}
          </div>
        ) : status === 'success' ? (
          <div className="flex flex-col items-center">
            <CheckCircle size={64} className="text-green-500 mb-6" />
            <h2 className="font-serif text-2xl font-bold text-malumz-text-primary mb-3">
              Thank You!
            </h2>
            <p className="text-malumz-text-secondary mb-8">{message}</p>
            <button
              onClick={() => navigate('/book')}
              className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-8 py-3 font-semibold transition-all w-full"
            >
              Go to Your Audiobook
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <AlertCircle size={64} className="text-red-500 mb-6" />
            <h2 className="font-serif text-2xl font-bold text-malumz-text-primary mb-3">
              Notice
            </h2>
            <p className="text-malumz-text-secondary mb-8">{message}</p>
            <button
              onClick={() => navigate('/book')}
              className="bg-transparent border-2 border-malumz-orange text-malumz-orange hover:bg-malumz-orange hover:text-white rounded-full px-8 py-3 font-semibold transition-all w-full"
            >
              Return to Book Page
            </button>
          </div>
        )}
        
      </div>
    </div>
  );
};

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
        const response = await fetch('/api/malumz/activate', {
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
    <div className="min-h-[70vh] flex py-16 items-center justify-center bg-malumz-cream px-4">
      <div className={`bg-white p-8 rounded-xl shadow-lg w-full text-center border border-malumz-brown/10 ${status === 'success' ? 'max-w-4xl' : 'max-w-md'}`}>
        
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
          <div className="flex flex-col items-center max-w-4xl w-full mx-auto">
            <CheckCircle size={64} className="text-green-500 mb-6" />
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary mb-3">
              Payment Successful!
            </h2>
            <p className="text-malumz-text-secondary mb-8 text-lg font-medium">
              You can now listen to the full audiobook below. We highly recommend bookmarking this page or saving the playlist link so you don't lose access!
            </p>
            
            <div className="w-full rounded-xl overflow-hidden shadow-lg bg-black/5 border border-malumz-brown/10 mb-8" style={{ aspectRatio: '16/9' }}>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube-nocookie.com/embed/videoseries?list=PLXMZKAvB55UHibN9pB8f6xQ9clxCd14DK"
                title="The Dog Trainer Audiobook"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full bg-black"
              ></iframe>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center mt-4">
              <a
                href="https://www.youtube.com/playlist?list=PLXMZKAvB55UHibN9pB8f6xQ9clxCd14DK"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-8 py-3 font-semibold transition-all"
              >
                Save YouTube Link
              </a>
              <button
                onClick={() => navigate('/book')}
                className="bg-transparent border-2 border-malumz-orange text-malumz-orange hover:bg-malumz-orange hover:text-white rounded-full px-8 py-3 font-semibold transition-all"
              >
                Return to Book Page
              </button>
            </div>
          </div>
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

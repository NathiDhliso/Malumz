import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Download, Headphones, Lock, Mail } from 'lucide-react';
import { activatePurchase, checkoutProduct } from '@/lib/malumzApi';
import styles from './BookPurchasePanel.module.css';

const products = [
  {
    id: 'dog-trainer-ebook',
    title: 'eBook',
    price: 'R99',
    description: 'Download The Dog Trainer as an EPUB after payment.',
    icon: Download,
  },
  {
    id: 'dog-trainer-audiobook',
    title: 'Audiobook',
    price: 'R199',
    description: 'Unlock the complete narrated audiobook after payment.',
    icon: Headphones,
  },
];

export const BookPurchasePanel = () => {
  const [searchParams] = useSearchParams();
  const [buyerEmail, setBuyerEmail] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('dog-trainer-ebook');
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [access, setAccess] = useState(null);

  const selected = useMemo(
    () => products.find((product) => product.id === selectedProduct) || products[0],
    [selectedProduct]
  );

  useEffect(() => {
    let cancelled = false;
    const checkoutId = searchParams.get('checkoutId') || window.localStorage.getItem('malumzCheckoutId');
    if (!checkoutId) return undefined;

    const activate = async () => {
      setIsActivating(true);
      setError('');
      try {
        const result = await activatePurchase({ checkoutId });
        if (cancelled) return;
        if (result.status === 'completed') {
          setAccess(result);
          window.localStorage.removeItem('malumzCheckoutId');
        } else {
          setError('Payment is still pending. Please wait a moment and refresh this page.');
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.detail || 'Could not confirm your payment. Please contact us with your payment reference.');
      } finally {
        if (!cancelled) setIsActivating(false);
      }
    };

    activate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleCheckout = async (event) => {
    event.preventDefault();
    setIsStartingCheckout(true);
    setError('');
    try {
      const result = await checkoutProduct({ productId: selectedProduct, buyerEmail });
      window.localStorage.setItem('malumzCheckoutId', result.checkoutId);
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setError(err.response?.data?.detail || 'Checkout could not start. Please try again.');
      setIsStartingCheckout(false);
    }
  };

  return (
    <div className="bg-white border border-e1-text-muted/20 rounded-xl p-6 md:p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Lock size={22} className="text-e1-secondary" />
        <h3 className="font-serif text-2xl font-bold text-e1-surface">
          Buy Directly
        </h3>
      </div>
      <p className="text-e1-text-muted text-sm mb-6">
        Pay securely with Yoco. Access unlocks only after the payment is confirmed.
      </p>

      {isActivating && (
        <div className="bg-e1-text border border-e1-text-muted/20 rounded-lg px-4 py-3 text-e1-surface text-sm mb-6">
          Confirming your payment...
        </div>
      )}

      {access?.ebookUrl && (
        <a
          href={access.ebookUrl}
          className="flex items-center justify-between bg-e1-secondary text-e1-surface rounded-lg px-5 py-4 font-bold mb-6"
        >
          <span>Download your eBook</span>
          <Download size={18} />
        </a>
      )}

      {access?.audioTracks?.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="font-serif text-lg font-bold text-e1-surface">
            Your Audiobook
          </h4>
          {access.audioTracks.map((track, index) => (
            <div key={track.url} className="bg-e1-text border border-e1-text-muted/20 rounded-lg p-4">
              <p className="font-semibold text-e1-surface text-sm mb-2">
                {index + 1}. {track.title}
              </p>
              <audio controls preload="none" src={track.url} className="w-full" />
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleCheckout} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          {products.map((product) => {
            const Icon = product.icon;
            const active = product.id === selectedProduct;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProduct(product.id)}
                aria-pressed={active}
                className={`${styles.productCard} text-left border rounded-xl p-5 transition-all ${
                  active
                    ? styles.productCardSelected
                    : `${styles.productCardUnselected} bg-e1-text border-e1-text-muted/20 hover:shadow-md`
                }`}
              >
                {active && (
                  <span className={styles.selectedBadge}>
                    <CheckCircle2 size={14} /> Selected
                  </span>
                )}
                <Icon size={24} className={`${active ? styles.selectedIcon : 'text-e1-primary'} mb-3`} />
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <span className={`font-serif text-xl font-bold ${active ? styles.selectedText : 'text-e1-surface'}`}>
                    {product.title}
                  </span>
                  <span className={`font-bold ${active ? styles.selectedPrice : 'text-e1-secondary'}`}>{product.price}</span>
                </div>
                <p className={`${active ? styles.selectedMutedText : 'text-e1-text-muted'} text-sm`}>{product.description}</p>
              </button>
            );
          })}
        </div>

        <label className="block">
          <span className="flex items-center gap-2 text-sm font-semibold text-e1-text-muted mb-2">
            <Mail size={16} /> Email for your receipt
          </span>
          <input
            type="email"
            required
            value={buyerEmail}
            onChange={(event) => setBuyerEmail(event.target.value)}
            className="w-full bg-e1-text border border-e1-text-muted/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-e1-primary focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </label>

        {error && (
          <div className="bg-e1-primary/10 border border-e1-primary/20 rounded-lg px-4 py-3 text-e1-surface text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isStartingCheckout || isActivating}
          className="w-full bg-e1-primary text-white hover:bg-e1-surface rounded-full px-8 py-4 font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {isStartingCheckout ? 'Opening checkout...' : `Buy ${selected.title} for ${selected.price}`}
        </button>
      </form>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Copy, Loader2 } from 'lucide-react';

export default function Checkout() {
  const { total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'confirming' | 'success'>('pending');
  const [copied, setCopied] = useState(false);

  const BTC_ADDRESS = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
  const BTC_PRICE = 65000; // Fake BTC price for conversion
  const btcAmount = (total() / BTC_PRICE).toFixed(6);

  useEffect(() => {
    if (total() === 0 && status === 'pending') {
      navigate('/shop');
    }
  }, [total, navigate, status]);

  const handleCopy = () => {
    navigator.clipboard.writeText(BTC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    setStatus('confirming');
    // Simulate network delay for confirmation
    setTimeout(() => {
      setStatus('success');
      clearCart();
    }, 3000);
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white pt-32 px-8 flex flex-col items-center text-center">
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
        <h1 className="text-4xl font-medium text-gray-900 mb-4">Payment Confirmed</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Your transaction has been verified on the blockchain. We will email you the shipping details shortly.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-8 pb-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-medium mb-8 text-gray-900 text-center">Crypto Checkout</h1>
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <QRCodeSVG value={`bitcoin:${BTC_ADDRESS}?amount=${btcAmount}`} size={200} />
          </div>
          
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
              <span className="text-gray-500">Amount to send:</span>
              <span className="font-mono font-medium text-lg">{btcAmount} BTC</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
              <span className="text-gray-500">Total (USD):</span>
              <span className="font-medium text-lg">${total().toLocaleString()}</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-gray-500 text-sm">Bitcoin Address:</span>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-gray-100 rounded-md text-sm break-all">
                  {BTC_ADDRESS}
                </code>
                <button 
                  onClick={handleCopy}
                  className="p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  title="Copy Address"
                >
                  {copied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <button 
            onClick={handleConfirm}
            disabled={status === 'confirming'}
            className="w-full bg-blue-600 text-white px-8 py-4 rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'confirming' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying Transaction...
              </>
            ) : (
              'I have sent the payment'
            )}
          </button>
          <p className="text-xs text-center text-gray-400 mt-4">
            Please ensure you send the exact amount to the address above. Transactions may take up to 10 minutes to confirm.
          </p>
        </div>
      </div>
    </div>
  );
}

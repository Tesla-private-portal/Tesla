import { useCartStore } from '../store/useCartStore';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-32 px-8 flex flex-col items-center">
        <h1 className="text-3xl font-medium text-gray-900 mb-4">Your Cart is Empty</h1>
        <Link to="/shop" className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 px-8 pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-medium mb-8 text-gray-900">Cart</h1>
        <div className="flex flex-col gap-6">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-6 border-b border-gray-200 pb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                <p className="text-gray-500">${item.price}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => removeItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-end">
          <div className="text-2xl font-medium text-gray-900 mb-6">
            Subtotal: ${total().toLocaleString()}
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="bg-blue-600 text-white px-12 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium w-full sm:w-auto text-center"
          >
            Checkout with Crypto
          </button>
        </div>
      </div>
    </div>
  );
}

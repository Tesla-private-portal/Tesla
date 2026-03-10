import { Globe, CircleUserRound, HelpCircle, ShoppingCart, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useState } from 'react';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const cartItems = useCartStore(state => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 text-sm font-medium transition-colors duration-300 ${isHome ? 'text-white bg-transparent' : 'text-white bg-black/80 backdrop-blur-md'}`}>
        <div className="flex-1">
          <Link to="/">
            <svg className="h-6 w-32" viewBox="0 0 342 35" xmlns="http://www.w3.org/2000/svg"><path d="M0 .1a9.7 9.7 0 0 0 7 7h11l.5.1v27.6h6.8V7.3L26 7h11a9.8 9.8 0 0 0 7-7H0zm238.6 0h-6.8v34.8H263a9.7 9.7 0 0 0 6-6.8h-30.3V0zm-52.3 6.8c3.6-1 6.6-3.8 7.4-6.9l-38.1.1v20.6h31.1v7.2h-24.4v6.9h31.1v-7.4c0-4.7-3.2-8.6-7.5-9.6-4.3-1-10.8-1-15.6-1h-7.8v-2.7h7.8c5 0 11.8 0 16-1zm90.7-6.9c-3.2 0-6.2.8-8.7 2.2V.1h-6.8v34.8h6.8v-14c2.5 1.5 5.5 2.3 8.7 2.3 9.1 0 16.5-7.4 16.5-16.5C293.4 7.4 286 0 277 0zm0 27.5c-6 0-10.9-4.9-10.9-10.9S271 5.7 277 5.7s10.9 4.9 10.9 10.9-4.9 10.9-10.9 10.9zm-204.4-6.9c-3.6 1-6.6 3.8-7.4 6.9h38.1V.1h-31.1v7.3h24.4v6.8h-31.1v7.4c0 4.7 3.2 8.6 7.5 9.6 4.3 1 10.8 1 15.6 1h7.8v2.7h-7.8c-5 0-11.8 0-16 1zm246.3-20.6h-15.5V0h37.8v6.8h-15.5v28h-6.8V6.8z" fill="currentColor"/></svg>
          </Link>
        </div>
        <nav className="hidden lg:flex items-center justify-center gap-8">
          <Link to="/" className="hover:bg-white/10 px-4 py-1.5 rounded-md transition-colors">Vehicles</Link>
          <Link to="/" className="hover:bg-white/10 px-4 py-1.5 rounded-md transition-colors">Energy</Link>
          <Link to="/" className="hover:bg-white/10 px-4 py-1.5 rounded-md transition-colors">Charging</Link>
          <Link to="/demo-drive" className="hover:bg-white/10 px-4 py-1.5 rounded-md transition-colors">Demo Drive</Link>
          <Link to="/shop" className="hover:bg-white/10 px-4 py-1.5 rounded-md transition-colors">Shop</Link>
        </nav>
        <div className="flex-1 flex justify-end items-center gap-4">
          <Link to="/shop" className="hover:bg-white/10 p-1.5 rounded-md transition-colors hidden lg:block"><HelpCircle className="w-6 h-6" /></Link>
          <Link to="/shop" className="hover:bg-white/10 p-1.5 rounded-md transition-colors hidden lg:block"><Globe className="w-6 h-6" /></Link>
          <Link to="/shop" className="hover:bg-white/10 p-1.5 rounded-md transition-colors hidden lg:block"><CircleUserRound className="w-6 h-6" /></Link>
          <Link to="/cart" className="hover:bg-white/10 p-1.5 rounded-md transition-colors relative">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full transform translate-x-1/4 -translate-y-1/4">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-md font-medium">Menu</button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 right-0 bottom-0 w-64 bg-white text-gray-900 shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-end p-6">
            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col px-8 gap-6 text-lg font-medium">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 transition-colors">Vehicles</Link>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 transition-colors">Energy</Link>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 transition-colors">Charging</Link>
            <Link to="/demo-drive" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 transition-colors">Demo Drive</Link>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 transition-colors">Shop</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="hover:text-blue-600 transition-colors flex items-center justify-between">
              Cart
              {cartCount > 0 && <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{cartCount}</span>}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}

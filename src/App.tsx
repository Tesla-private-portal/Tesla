/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Assistant from './components/Assistant';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import DemoDrive from './pages/DemoDrive';

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative w-full min-h-screen bg-black">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/demo-drive" element={<DemoDrive />} />
        </Routes>
        <Assistant />
      </div>
    </BrowserRouter>
  );
}

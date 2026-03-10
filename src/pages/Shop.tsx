import { useCartStore, Product } from '../store/useCartStore';
import { motion } from 'motion/react';

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wall Connector',
    price: 475,
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop',
    description: 'The most convenient way to charge at home.'
  },
  {
    id: '2',
    name: 'Mobile Connector',
    price: 230,
    image: 'https://images.unsplash.com/photo-1559328963-2287411bc23f?q=80&w=2070&auto=format&fit=crop',
    description: 'Charge anywhere there is an outlet.'
  },
  {
    id: '3',
    name: 'Model Y All-Weather Interior Liners',
    price: 225,
    image: 'https://images.unsplash.com/photo-1541443131876-44b03de101c5?q=80&w=2070&auto=format&fit=crop',
    description: 'Maximum protection for your Model Y floor.'
  },
  {
    id: '4',
    name: 'Cybertruck Diecast 1:18 Scale',
    price: 225,
    image: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?q=80&w=2069&auto=format&fit=crop',
    description: 'A detailed replica of the Cybertruck.'
  }
];

export default function Shop() {
  const addItem = useCartStore(state => state.addItem);

  return (
    <div className="min-h-screen bg-white pt-24 px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-medium mb-8 text-gray-900">Shop Accessories</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map(product => (
            <motion.div 
              key={product.id} 
              className="group flex flex-col bg-white p-6 rounded-2xl shadow-sm hover:shadow-2xl border border-gray-100 transition-all"
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg mb-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">{product.description}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-medium">${product.price}</span>
                <button 
                  onClick={() => addItem(product)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

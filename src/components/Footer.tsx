import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-8 flex flex-col items-center justify-center text-xs text-gray-400 bg-black snap-start">
      <ul className="flex flex-wrap justify-center gap-4 mb-4">
        <li><Link to="/" className="hover:text-white transition-colors">Tesla © 2026</Link></li>
        <li><Link to="/" className="hover:text-white transition-colors">Privacy & Legal</Link></li>
        <li><Link to="/" className="hover:text-white transition-colors">Vehicle Recalls</Link></li>
        <li><Link to="/" className="hover:text-white transition-colors">Contact</Link></li>
        <li><Link to="/" className="hover:text-white transition-colors">News</Link></li>
        <li><Link to="/" className="hover:text-white transition-colors">Get Updates</Link></li>
        <li><Link to="/" className="hover:text-white transition-colors">Locations</Link></li>
      </ul>
    </footer>
  );
}

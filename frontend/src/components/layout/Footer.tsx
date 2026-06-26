import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-cuea-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-white p-0.5 shrink-0">
              <img src="/cuea-crest.png" alt="CUEA Crest" className="h-full w-full object-contain" />
            </div>
            <h3 className="font-bold text-cuea-gold">CUEA Gaba Campus</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Catholic University of Eastern Africa<br />
            <span className="italic text-white/60 text-xs">Consecrate Them in the Truth</span><br />
            Hostel Management System
          </p>
        </div>
        <div>
          <h3 className="font-bold text-cuea-gold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/" className="hover:text-cuea-gold transition-colors">Home</Link></li>
            <li><Link to="/hostels" className="hover:text-cuea-gold transition-colors">Hostels</Link></li>
            <li><Link to="/register" className="hover:text-cuea-gold transition-colors">Register</Link></li>
            <li><a href="https://cuea.edu" target="_blank" rel="noreferrer" className="hover:text-cuea-gold transition-colors">CUEA Website</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-cuea-gold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> Gaba Road, Kampala</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> +254 20 891 601</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> hostels@cuea.edu</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20 text-center py-4 text-xs text-white/50">
        © {new Date().getFullYear()} Catholic University of Eastern Africa. All rights reserved.
      </div>
    </footer>
  )
}

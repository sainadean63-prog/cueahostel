import { Link } from 'react-router-dom'
import { Search, BedDouble, Shield, CreditCard, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import HostelCard from '@/components/hostel/HostelCard'
import { useHostels } from '@/hooks/useHostels'
import { Spinner } from '@/components/ui/spinner'

const features = [
  {
    icon: Search,
    title: 'Check Availability',
    desc: 'Browse real-time bed availability across all Gaba Campus hostels.',
  },
  {
    icon: BedDouble,
    title: 'Book Instantly',
    desc: 'Reserve your bed in minutes — no queues, no paperwork.',
  },
  {
    icon: CreditCard,
    title: 'Pay via M-PESA',
    desc: 'Secure payment straight from your phone using Safaricom M-PESA.',
  },
  {
    icon: Shield,
    title: 'Managed & Safe',
    desc: 'CUEA-administered system with verified student accounts only.',
  },
]

export default function LandingPage() {
  const { data: hostels, isLoading } = useHostels()

  return (
    <div>
      {/* Hero */}
      <section className="relative cuea-gradient text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          {/* Official CUEA Crest */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl p-1.5">
            <img src="/cuea-crest.png" alt="Catholic University of Eastern Africa" className="h-full w-full object-contain" />
          </div>
          <div className="inline-flex items-center gap-2 bg-cuea-gold/20 border border-cuea-gold/40 rounded-full px-4 py-1.5 text-cuea-gold text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-cuea-gold animate-pulse" />
            CUEA Gaba Campus — Official Hostel Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Perfect<br />
            <span className="text-cuea-gold">Student Home</span>
          </h1>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Book a hostel bed at CUEA Gaba Campus online — check availability, pay via M-PESA, and move in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Input
              placeholder="Search hostel..."
              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus-visible:ring-cuea-gold"
            />
            <Link to="/hostels">
              <Button size="lg" className="bg-cuea-gold hover:bg-cuea-gold-dark text-white gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4" /> Search
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm border text-center hover:shadow-md transition-shadow">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-cuea-primary/10">
                  <Icon className="h-7 w-7 text-cuea-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hostel listings preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Hostels</h2>
              <p className="text-muted-foreground text-sm mt-1">Gaba Campus accommodation options</p>
            </div>
            <Link to="/hostels" className="flex items-center gap-1 text-cuea-primary text-sm font-medium hover:underline">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="text-cuea-primary h-8 w-8" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(hostels ?? []).slice(0, 3).map((hostel) => (
                <HostelCard key={hostel.id} hostel={hostel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 cuea-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Bed?</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Create a student account and book your hostel space in under 5 minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-cuea-gold hover:bg-cuea-gold-dark text-white">
                Create Account
              </Button>
            </Link>
            <Link to="/hostels">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-cuea-primary">
                Browse Hostels
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

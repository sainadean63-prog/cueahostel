import { useState } from 'react'
import { Building2 } from 'lucide-react'
import HostelCard from '@/components/hostel/HostelCard'
import { useHostels } from '@/hooks/useHostels'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function HostelsPage() {
  const { data: hostels, isLoading } = useHostels()
  const [search, setSearch] = useState('')
  const [gender, setGender] = useState('ALL')

  const filtered = (hostels ?? []).filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase())
    const matchGender = gender === 'ALL' || h.gender === gender
    return matchSearch && matchGender
  })

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gaba Campus Hostels</h1>
        <p className="text-muted-foreground">Browse available accommodation for the current semester</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Input
          placeholder="Search hostels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
            <SelectItem value="MIXED">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="text-cuea-primary h-8 w-8" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hostels match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hostel) => (
            <HostelCard key={hostel.id} hostel={hostel} />
          ))}
        </div>
      )}
    </div>
  )
}

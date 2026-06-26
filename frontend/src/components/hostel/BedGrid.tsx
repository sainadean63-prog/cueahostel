import { BedDouble } from 'lucide-react'
import type { Bed } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'

interface Props {
  beds: Bed[]
  selectedBedId?: string
  onSelect?: (bed: Bed) => void
  readonly?: boolean
}

export default function BedGrid({ beds, selectedBedId, onSelect, readonly = false }: Props) {
  if (beds.length === 0) {
    return <p className="text-muted-foreground text-sm text-center py-8">No beds in this room.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {beds.map((bed) => {
        const isSelected = bed.id === selectedBedId
        const canSelect = bed.isAvailable && !readonly

        return (
          <button
            key={bed.id}
            disabled={!canSelect}
            onClick={() => canSelect && onSelect?.(bed)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition-all',
              bed.isAvailable
                ? isSelected
                  ? 'border-cuea-primary bg-cuea-primary/10 shadow-md'
                  : 'border-green-400 bg-green-50 hover:border-green-500 hover:shadow cursor-pointer'
                : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60',
              readonly && 'cursor-default'
            )}
          >
            <BedDouble
              className={cn(
                'h-8 w-8',
                bed.isAvailable
                  ? isSelected
                    ? 'text-cuea-primary'
                    : 'text-green-600'
                  : 'text-red-400'
              )}
            />
            <div>
              <p className="text-xs font-semibold text-gray-700">Bed {bed.bedNumber}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{bed.type.toLowerCase()}</p>
              <p className="text-xs font-bold text-cuea-primary mt-1">{formatCurrency(bed.pricePerSemester)}</p>
            </div>
            <span
              className={cn(
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                bed.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}
            >
              {bed.isAvailable ? 'Free' : 'Taken'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

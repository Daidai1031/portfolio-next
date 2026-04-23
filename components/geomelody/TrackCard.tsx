import { Track } from '@/lib/geomelody/api'
import Image from 'next/image'

export default function TrackCard({ track, rank }: { track: Track; rank: number }) {
  const matchPercent = Math.round((1 - Math.min(track.distance ?? 1, 1)) * 100)

  return (
    <div className="group flex items-center gap-4 p-4 border border-gray-200 hover:border-orange-500 transition-all duration-300 bg-white">
      {/* Rank */}
      <div className="text-xs font-bold text-gray-300 w-5 text-center shrink-0">
        {String(rank).padStart(2, '0')}
      </div>

      {/* Album art */}
      {track.image ? (
        <Image
          src={track.image}
          alt={track.name}
          width={48}
          height={48}
          className="object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-100 shrink-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-black truncate leading-tight">{track.name}</div>
        <div className="text-xs text-gray-500 mt-0.5 truncate">{track.artist}</div>
      </div>

      {/* Match */}
      <div className="text-right shrink-0">
        <div className="text-[10px] uppercase tracking-wider text-gray-400">Match</div>
        <div className={`text-sm font-bold ${matchPercent >= 80 ? 'text-orange-500' : 'text-gray-400'}`}>
          {matchPercent}%
        </div>
      </div>
    </div>
  )
}
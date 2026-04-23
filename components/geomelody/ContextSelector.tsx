'use client'

const SCENES = [
  { value: 'library', label: 'Library',  desc: 'Quiet study' },
  { value: 'cafe',    label: 'Café',     desc: 'Ambient noise' },
  { value: 'park',    label: 'Park',     desc: 'Outdoors' },
  { value: 'street',  label: 'Street',   desc: 'Urban' },
  { value: 'subway',  label: 'Subway',   desc: 'Commute' },
]

const ACTIVITIES = [
  { value: 'stationary', label: 'Still',   desc: 'Sitting / lying' },
  { value: 'working',    label: 'Working', desc: 'Focused' },
  { value: 'walking',    label: 'Walking', desc: 'On the move' },
]

const MOODS = [
  { value: 'relaxed',   label: 'Relaxed' },
  { value: 'focused',   label: 'Focused' },
  { value: 'stressed',  label: 'Stressed' },
  { value: 'energetic', label: 'Energetic' },
]

interface Item { value: string; label: string; desc?: string }
interface Context { scene: string; activity: string; mood: string }

function Chip({ item, selected, onSelect }: {
  item: Item; selected: boolean; onSelect: (v: string) => void
}) {
  return (
    <button
      onClick={() => onSelect(item.value)}
      className={`group relative px-4 py-2.5 text-left transition-all duration-200 cursor-pointer border ${
        selected
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-200 bg-white hover:border-gray-400'
      }`}
    >
      <div className={`text-sm font-semibold tracking-tight transition-colors ${
        selected ? 'text-orange-500' : 'text-black group-hover:text-black'
      }`}>
        {item.label}
      </div>
      {item.desc && (
        <div className={`text-xs mt-0.5 transition-colors ${
          selected ? 'text-orange-400' : 'text-gray-400'
        }`}>
          {item.desc}
        </div>
      )}
      {selected && (
        <div className="absolute top-0 right-0 w-0 h-0
          border-t-[20px] border-t-orange-500
          border-l-[20px] border-l-transparent" />
      )}
    </button>
  )
}

function Section({ title, items, selected, onSelect }: {
  title: string; items: Item[]; selected: string; onSelect: (v: string) => void
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-3 font-medium">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <Chip key={item.value} item={item} selected={selected === item.value} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

export default function ContextSelector({ context, onChange }: {
  context: Context; onChange: (c: Context) => void
}) {
  const set = (key: keyof Context) => (val: string) => onChange({ ...context, [key]: val })
  return (
    <div className="flex flex-col gap-8">
      <Section title="Where are you?" items={SCENES}     selected={context.scene}    onSelect={set('scene')} />
      <Section title="What are you doing?" items={ACTIVITIES} selected={context.activity} onSelect={set('activity')} />
      <Section title="How do you feel?" items={MOODS}     selected={context.mood}     onSelect={set('mood')} />
    </div>
  )
}
'use client'

interface RadioButtonProps {
  value: string
  label: string
  selected: boolean
  onChange: (value: string) => void
  name: string
}

export function RadioButton({ value, label, selected, onChange, name }: RadioButtonProps) {
  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <div className="relative">
        <input
          type="radio"
          name={name}
          value={value}
          checked={selected}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
          selected 
            ? 'bg-black border-black' 
            : 'bg-white border-gray-300'
        }`}>
          {selected && (
            <div className="w-3 h-3 rounded-full bg-white"></div>
          )}
        </div>
      </div>
      <span className={`font-medium text-lg ${
        selected ? 'text-black' : 'text-gray-600'
      }`}>
        {label}
      </span>
    </label>
  )
}

interface RadioGroupProps {
  name: string
  options: Array<{value: string, label: string}>
  value: string | null
  onChange: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
}

export function RadioGroup({ 
  name, 
  options, 
  value, 
  onChange, 
  orientation = 'horizontal' 
}: RadioGroupProps) {
  return (
    <div className={`flex ${orientation === 'horizontal' ? 'space-x-6' : 'flex-col space-y-4'}`}>
      {options.map((option) => (
        <RadioButton
          key={option.value}
          name={name}
          value={option.value}
          label={option.label}
          selected={value === option.value}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
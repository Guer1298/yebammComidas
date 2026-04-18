import React from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  placeholder?: string
  buttonLabel?: string
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Busca negocios, hamburguesas, pizzas o promociones',
  buttonLabel = 'Buscar',
  className,
}: SearchBarProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row ${className ?? ''}`}
      role="search"
    >
      <div className="flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar"
          className="border-none shadow-none focus:ring-0"
        />
      </div>

      <Button type="submit" className="sm:min-w-[140px]">
        {buttonLabel}
      </Button>
    </form>
  )
}
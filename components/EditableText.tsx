import { Input } from '@/components/ui/input'
import type { EditableTextProps } from './BusinessTypes'

export function EditableText({
  isEditing,
  value,
  onChange,
  className,
}: EditableTextProps) {
  return (
    <div className={`min-h-[2.5rem] w-full max-w-[800px] ${className}`}>
      {isEditing ? (
        <Input
          name="nome"
          value={value}
          onChange={onChange}
          className="bg-transparent border-gray-200 h-auto py-2 text-inherit font-inherit"
        />
      ) : (
        <h1 className="w-full break-words">{value}</h1>
      )}
    </div>
  )
}

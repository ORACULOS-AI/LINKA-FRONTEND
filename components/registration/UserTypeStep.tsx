import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { PublicUserType } from '@/lib/types/userTypes'

interface UserTypeStepProps {
  userType: PublicUserType
  onUserTypeChange: (type: PublicUserType) => void
  acceptedTerms: boolean
  onTermsChange: (accepted: boolean) => void
}

export function UserTypeStep({
  userType,
  onUserTypeChange,
  acceptedTerms,
  onTermsChange,
}: UserTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tipo de usuário</Label>

        <RadioGroup
          value={userType}
          onValueChange={onUserTypeChange}
          className="flex flex-col sm:flex-row gap-4 mb-4"
        >
          {Object.values(PublicUserType).map((type) => (
            <div
              key={type}
              className={`flex-1 flex items-center space-x-2 rounded-lg border p-2 cursor-pointer hover:border-black ${
                userType === type ? 'bg-gray-100 border-black' : ''
              }`}
              onClick={() => onUserTypeChange(type)}
            >
              <RadioGroupItem value={type} id={type} className="sr-only" />
              <div
                className={`w-4 h-4 rounded-full border ${userType === type ? 'bg-black border-black' : 'border-gray-300'}`}
              />
              <Label htmlFor={type} className="cursor-pointer flex-grow">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex items-start space-x-2 mt-6">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => onTermsChange(checked as boolean)}
        />
        <Label htmlFor="terms" className="text-sm leading-none">
          Eu concordo com os{' '}
          <a
            href="#"
            className="text-[#000000] hover:underline"
            style={{ color: '#000000' }}
          >
            termos e condições
          </a>{' '}
          e com a{' '}
          <a
            href="#"
            className="text-[#000000] hover:underline"
            style={{ color: '#000000' }}
          >
            política de privacidade
          </a>
          .
        </Label>
      </div>
    </div>
  )
}

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface TermsStepProps {
  acceptedTerms: boolean
  onTermsChange: (accepted: boolean) => void
}

export function TermsStep({
  acceptedTerms,
  onTermsChange,
}: TermsStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="font-semibold text-lg mb-4">Termos e Condições</h3>
          <div className="space-y-3 text-sm text-gray-700 max-h-60 overflow-y-auto">
            <p>
              Ao criar uma conta no ecossistema de inovação da UFC, você concorda com os seguintes termos:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Você fornecerá informações precisas e atualizadas</li>
              <li>Você é responsável por manter a segurança da sua conta</li>
              <li>Você usará a plataforma de forma ética e responsável</li>
              <li>Você respeitará os direitos de propriedade intelectual</li>
              <li>Você não utilizará a plataforma para atividades ilegais</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="font-semibold text-lg mb-4">Política de Privacidade</h3>
          <div className="space-y-3 text-sm text-gray-700 max-h-60 overflow-y-auto">
            <p>
              Sua privacidade é importante para nós. Esta política explica como coletamos e usamos seus dados:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Coletamos apenas informações necessárias para o funcionamento da plataforma</li>
              <li>Seus dados são armazenados de forma segura</li>
              <li>Não compartilhamos suas informações com terceiros sem consentimento</li>
              <li>Você pode solicitar a exclusão dos seus dados a qualquer momento</li>
              <li>Usamos cookies para melhorar sua experiência</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => onTermsChange(checked as boolean)}
          className="mt-1"
        />
        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
          Eu li e concordo com os{' '}
          <span className="text-purple-600 font-medium">termos e condições</span>{' '}
          e com a{' '}
          <span className="text-purple-600 font-medium">política de privacidade</span>{' '}
          do ecossistema de inovação da UFC.
        </Label>
      </div>
    </div>
  )
} 
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  PublicUserType,
  UserCreateData,
  PesquisadorCreate,
  EstudanteCreate,
  ExternoCreate,
  TecnicoAdminCreate,
  campusOptions,
} from '@/lib/types/userTypes'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdditionalInfoStepProps {
  userType: PublicUserType
  formData: UserCreateData
  onInputChange: (name: string, value: string | string[]) => void
  onSocialMediaChange: (network: string, value: string) => void
}

export function AdditionalInfoStep({
  userType,
  formData,
  onInputChange,
  onSocialMediaChange,
}: AdditionalInfoStepProps) {
  if (userType === PublicUserType.PESQUISADOR) {
    const pesquisadorData = formData as PesquisadorCreate
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lattes">Lattes</Label>
          <Input
            id="lattes"
            value={pesquisadorData.lattes}
            onChange={(e) => onInputChange('lattes', e.target.value)}
            className="h-11"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siape">SIAPE</Label>
          <Input
            id="siape"
            value={pesquisadorData.siape}
            onChange={(e) => onInputChange('siape', e.target.value)}
            className="h-11"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="palavras_chave">
            Palavras-chave (separadas por vírgula)
          </Label>
          <Input
            id="palavras_chave"
            value={pesquisadorData.palavras_chave.join(', ')}
            onChange={(e) =>
              onInputChange(
                'palavras_chave',
                e.target.value.split(',').map((word) => word.trim()),
              )
            }
            className="h-11"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campus">Campus</Label>
          <Select
            value={pesquisadorData.campus}
            onValueChange={(value) => onInputChange('campus', value)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecione o campus" />
            </SelectTrigger>
            <SelectContent>
              {campusOptions.map((campus) => (
                <SelectItem key={campus} value={campus}>
                  {campus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn (opcional)</Label>
          <Input
            id="linkedin"
            value={pesquisadorData.redes_sociais?.linkedin || ''}
            onChange={(e) => onSocialMediaChange('linkedin', e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter (opcional)</Label>
          <Input
            id="twitter"
            value={pesquisadorData.redes_sociais?.twitter || ''}
            onChange={(e) => onSocialMediaChange('twitter', e.target.value)}
            className="h-11"
          />
        </div>
      </div>
    )
  }

  if (userType === PublicUserType.ESTUDANTE) {
    const estudanteData = formData as EstudanteCreate
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="curso">Curso</Label>
          <Input
            id="curso"
            value={estudanteData.curso}
            onChange={(e) => onInputChange('curso', e.target.value)}
            className="h-11"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="matricula">Matrícula</Label>
          <Input
            id="matricula"
            value={estudanteData.matricula}
            onChange={(e) => onInputChange('matricula', e.target.value)}
            className="h-11"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campus">Campus</Label>
          <Select
            value={estudanteData.campus}
            onValueChange={(value) => onInputChange('campus', value)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecione o campus" />
            </SelectTrigger>
            <SelectContent>
              {campusOptions.map((campus) => (
                <SelectItem key={campus} value={campus}>
                  {campus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    )
  }

  if (userType === PublicUserType.TECNICO_ADMIN) {
    const tecnicoData = formData as TecnicoAdminCreate
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="setor">Setor *</Label>
          <Input
            id="setor"
            value={tecnicoData.setor}
            onChange={(e) => onInputChange('setor', e.target.value)}
            className="h-11"
            required
            placeholder="Ex: Tecnologia da Informação"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo *</Label>
          <Input
            id="cargo"
            value={tecnicoData.cargo}
            onChange={(e) => onInputChange('cargo', e.target.value)}
            className="h-11"
            required
            placeholder="Ex: Técnico em Informática"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="campus">Campus *</Label>
          <Select
            value={tecnicoData.campus}
            onValueChange={(value) => onInputChange('campus', value)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Selecione o campus" />
            </SelectTrigger>
            <SelectContent>
              {campusOptions.map((campus) => (
                <SelectItem key={campus} value={campus}>
                  {campus}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="siape">SIAPE (opcional)</Label>
          <Input
            id="siape"
            value={tecnicoData.siape || ''}
            onChange={(e) => onInputChange('siape', e.target.value)}
            className="h-11"
            placeholder="Número SIAPE"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone_ramal">Ramal (opcional)</Label>
          <Input
            id="telefone_ramal"
            value={tecnicoData.telefone_ramal || ''}
            onChange={(e) => onInputChange('telefone_ramal', e.target.value)}
            className="h-11"
            placeholder="Ex: 3366"
          />
        </div>
      </div>
    )
  }

  const externoData = formData as ExternoCreate
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="empresa">Empresa (opcional)</Label>
        <Input
          id="empresa"
          value={externoData.empresa || ''}
          onChange={(e) => onInputChange('empresa', e.target.value)}
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cargo">Cargo (opcional)</Label>
        <Input
          id="cargo"
          value={externoData.cargo || ''}
          onChange={(e) => onInputChange('cargo', e.target.value)}
          className="h-11"
        />
      </div>
    </div>
  )
}

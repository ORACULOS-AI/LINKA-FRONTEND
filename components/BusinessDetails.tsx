import { type NegocioResponse, NegocioType } from '@/lib/types/businessTypes'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tag } from 'lucide-react'

interface BusinessDetailsProps {
  business: NegocioResponse
  editedBusiness: NegocioResponse
  isEditing: boolean
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
}

const BusinessDetails: React.FC<BusinessDetailsProps> = ({
  business,
  editedBusiness,
  isEditing,
  handleChange,
}) => {
  const getEstagioLabel = (stage: string) => {
    const labels: Record<string, string> = {
      'IDEACAO': 'Ideação',
      'VALIDACAO': 'Validação',
      'MVP': 'MVP',
      'OPERACAO': 'Operação',
      'CRESCIMENTO': 'Crescimento',
      'ESCALA': 'Escala'
    };
    return labels[stage] || stage;
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      'STARTUP': 'Startup',
      'EMPRESA_JUNIOR': 'Empresa Júnior',
      'SPIN_OFF': 'Spin-off',
      'OUTRO': 'Outro'
    };
    return labels[categoria] || categoria;
  };

  const getTipoNegocioLabel = (tipo: NegocioType) => {
    const labels: Record<NegocioType, string> = {
      [NegocioType.PRE_INCUBADO]: 'Pré-Incubada',
      [NegocioType.INCUBADO]: 'Incubada',
      [NegocioType.PARCEIRO]: 'Parceira',
    };
    return labels[tipo] || tipo;
  };

  return (
    <div className="col-span-2 space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Sobre o Negócio</h2>
        {isEditing ? (
          <Textarea
            name="descricao"
            value={editedBusiness.descricao || ''}
            onChange={handleChange}
            rows={6}
            className="w-full"
            placeholder="Descreva seu negócio, o que ele faz, qual problema resolve ou que serviços/produtos oferece..."
          />
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">
            {business.descricao || 'Sem descrição disponível'}
          </p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Classificação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Categoria</p>
            <p className="text-gray-700">{getCategoriaLabel(business.categoria)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tipo de Vínculo</p>
            <p className="text-gray-700">{getTipoNegocioLabel(business.tipo_negocio)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Estágio</p>
            <p className="text-gray-700">{getEstagioLabel(business.estagio)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Área de Atuação</p>
            <p className="text-gray-700">{business.area_atuacao}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Palavras-chave</h2>
        <div className="flex flex-wrap gap-2">
          {business.palavras_chave?.map((keyword: string, index: number) => (
            <Badge key={index} variant="secondary">
              <Tag className="w-3 h-3 mr-1" />
              {keyword}
            </Badge>
          ))}
        </div>
      </section>

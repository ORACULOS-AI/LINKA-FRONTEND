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
  return (
    <div className="col-span-2 space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Sobre o Negócio</h2>
        {isEditing ? (
          <Textarea
            name="descricao"
            value={editedBusiness.descricao || editedBusiness.descricao_problema || ''}
            onChange={handleChange}
            rows={6}
            className="w-full"
            placeholder="Descreva seu negócio, o que ele faz, qual problema resolve ou que serviços/produtos oferece..."
          />
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">
            {business.descricao || business.descricao_problema || 'Sem descrição disponível'}
          </p>
        )}
      </section>

      {/* Mostrar Problema/Solução apenas se existirem (retrocompatibilidade) */}
      {(business.descricao_problema || business.solucao_proposta) && business.descricao && (
        <>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Problema Identificado</h2>
            {isEditing ? (
              <Textarea
                name="descricao_problema"
                value={editedBusiness.descricao_problema || ''}
                onChange={handleChange}
                rows={4}
                className="w-full"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {business.descricao_problema}
              </p>
            )}
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4">Solução Proposta</h2>
            {isEditing ? (
              <Textarea
                name="solucao_proposta"
                value={editedBusiness.solucao_proposta || ''}
                onChange={handleChange}
                rows={4}
                className="w-full"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {business.solucao_proposta}
              </p>
            )}
          </section>
        </>
      )}

      {business.tipo_negocio === NegocioType.INCUBADA && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Área Estratégica</h2>
          {isEditing ? (
            <Input
              name="area_estrategica"
              value={editedBusiness.area_estrategica || ''}
              onChange={handleChange}
              className="w-full"
            />
          ) : (
            <p className="text-gray-700">{business.area_estrategica}</p>
          )}
        </section>
      )}

      {business.tipo_negocio === NegocioType.EXTERNO && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Área de Atuação</h2>
          {isEditing ? (
            <Input
              name="area_de_atuacao"
              value={editedBusiness.area_de_atuacao || ''}
              onChange={handleChange}
              className="w-full"
            />
          ) : (
            <p className="text-gray-700">{business.area_de_atuacao}</p>
          )}
        </section>
      )}

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
    </div>
  )
}

export default BusinessDetails

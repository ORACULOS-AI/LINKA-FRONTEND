import { type NegocioResponse, NegocioType } from '@/lib/types/businessTypes'
import { Input } from '@/components/ui/input'
import { ExternalLink, Mail, Phone, MapPin } from 'lucide-react'

interface BusinessContactProps {
  business: NegocioResponse
  isEditing: boolean
  editedBusiness: NegocioResponse
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function BusinessContact({
  business,
  isEditing,
  editedBusiness,
  handleChange,
}: BusinessContactProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Contato</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-3 text-gray-500" />
            {isEditing ? (
              <Input
                name="email"
                value={editedBusiness.email}
                onChange={handleChange}
                className="w-full"
              />
            ) : (
              <a
                href={`mailto:${business.email}`}
                className="text-blue-600 hover:underline"
              >
                {business.email}
              </a>
            )}
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-3 text-gray-500" />
            {isEditing ? (
              <Input
                name="telefone"
                value={editedBusiness.telefone}
                onChange={handleChange}
                className="w-full"
              />
            ) : (
              <span>{business.telefone}</span>
            )}
          </div>
          {business.tipo_negocio === NegocioType.INCUBADA && (
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-gray-500" />
              {isEditing ? (
                <Input
                  name="campus"
                  value={editedBusiness.campus || ''}
                  onChange={handleChange}
                  className="w-full"
                />
              ) : (
                <span>{business.campus}</span>
              )}
            </div>
          )}
        </div>
      </section>

      {business.tipo_negocio === NegocioType.EXTERNO && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">CNAE</h2>
          {isEditing ? (
            <Input
              name="cnae"
              value={editedBusiness.cnae || ''}
              onChange={handleChange}
              maxLength={7}
              className="w-full"
            />
          ) : (
            <p className="text-gray-700">{business.cnae}</p>
          )}
        </section>
      )}

      {Object.entries(business.midias_sociais || {}).length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Redes Sociais</h2>
          <div className="space-y-4">
            {Object.entries(business.midias_sociais || {}).map(
              ([platform, url]) => (
                <div key={platform} className="flex items-center">
                  <ExternalLink className="w-5 h-5 mr-3 text-gray-500" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {platform}
                  </a>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  )
}

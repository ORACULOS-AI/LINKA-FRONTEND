"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Edit, Save, X, Mail, Phone, Tag, TrendingUp, Target, Lightbulb, DollarSign, FileText } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BusinessInfoProps {
  business: any
  isOwner: boolean
  isEditingFields: boolean
  editedBusiness: any
  onEditToggle: () => void
  onSaveFields: () => void
  onFieldChange: (field: string, value: string) => void
}

const InfoItem: React.FC<{
  icon: React.ElementType
  label: string
  value: string
  isEditing: boolean
  onChange: (value: string) => void
  options?: string[]
}> = ({ icon, label, value, isEditing, onChange, options = [] }) => {
  const Icon = icon

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-purple-50/50 to-violet-50/30 border border-purple-100/50 hover:border-purple-200/70 transition-all duration-300">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 shadow-sm">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-purple-700 mb-1">{label}</p>
        {isEditing ? (
          options.length > 0 ? (
            <Select value={value} onValueChange={onChange}>
              <SelectTrigger className="bg-white border-purple-200 focus:border-purple-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-white border-purple-200 focus:border-purple-400" />
          )
        ) : (
          <p className="text-base font-medium text-gray-800 break-words">{value || "Não informado"}</p>
        )}
      </div>
    </div>
  )
}

export const BusinessInfo: React.FC<BusinessInfoProps> = ({
  business,
  isOwner,
  isEditingFields,
  editedBusiness,
  onEditToggle,
  onSaveFields,
  onFieldChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Contact Information Card */}
      <Card className="p-6 shadow-lg border border-purple-100 bg-white relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-violet-100/30 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-violet-100/20 rounded-full -ml-12 -mb-12" />
        
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Informações de Contato</h2>
              <p className="text-gray-600">Dados para comunicação e identificação</p>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                {!isEditingFields ? (
                  <Button variant="outline" size="sm" onClick={onEditToggle} className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50">
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onSaveFields}
                      className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Save className="h-4 w-4" />
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onEditToggle}
                      className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem
              icon={Mail}
              label="Email"
              value={editedBusiness.email ?? business.email}
              isEditing={isEditingFields}
              onChange={(value) => onFieldChange("email", value)}
            />
            <InfoItem
              icon={Phone}
              label="Telefone"
              value={editedBusiness.telefone ?? business.telefone}
              isEditing={isEditingFields}
              onChange={(value) => onFieldChange("telefone", value)}
            />
            <InfoItem
              icon={Tag}
              label="Área de Atuação"
              value={editedBusiness.area_atuacao ?? business.area_atuacao}
              isEditing={isEditingFields}
              onChange={(value) => onFieldChange("area_atuacao", value)}
              options={["Tecnologia Sustentável", "Saúde", "Educação", "Fintech", "E-commerce"]}
            />
            <InfoItem
              icon={TrendingUp}
              label="Estágio"
              value={editedBusiness.estagio ?? business.estagio}
              isEditing={isEditingFields}
              onChange={(value) => onFieldChange("estagio", value)}
              options={["Ideação", "Validação", "Crescimento", "Expansão", "Maturidade"]}
            />
          </div>
        </div>
      </Card>

      {/* Business Details Card */}
      <Card className="overflow-hidden shadow-lg border border-purple-100 bg-white">
        <div className="p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg border border-purple-200">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Sobre o Negócio</h3>
            </div>
            {isEditingFields ? (
              <Textarea
                value={editedBusiness.descricao ?? business.descricao ?? editedBusiness.descricao_problema ?? business.descricao_problema ?? ""}
                onChange={(e) => onFieldChange("descricao", e.target.value)}
                className="min-h-[150px] bg-white border-purple-200 focus:border-purple-400"
                placeholder="Descreva seu negócio, o que ele faz, qual problema resolve ou que serviços/produtos oferece..."
              />
            ) : (
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {business.descricao || business.descricao_problema || "Nenhuma descrição fornecida."}
                </p>
              </div>
            )}
          </motion.div>

          {/* Mostrar Problema/Solução apenas se existirem (retrocompatibilidade) */}
          {(business.descricao_problema || business.solucao_proposta) && business.descricao && (
            <Tabs defaultValue="problema" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-50 to-violet-50 p-1 rounded-lg border border-purple-100">
                <TabsTrigger value="problema" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600">
                  <Target className="h-4 w-4 mr-2" />
                  Problema
                </TabsTrigger>
                <TabsTrigger value="solucao" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Solução
                </TabsTrigger>
              </TabsList>

              <div className="pt-4">
                <TabsContent value="problema" className="mt-0">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    {isEditingFields ? (
                      <Textarea
                        value={editedBusiness.descricao_problema ?? business.descricao_problema ?? ""}
                        onChange={(e) => onFieldChange("descricao_problema", e.target.value)}
                        className="min-h-[100px] bg-white border-purple-200 focus:border-purple-400"
                        placeholder="Descreva o problema que seu negócio resolve..."
                      />
                    ) : (
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {business.descricao_problema || "Nenhuma descrição de problema fornecida."}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="solucao" className="mt-0">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    {isEditingFields ? (
                      <Textarea
                        value={editedBusiness.solucao_proposta ?? business.solucao_proposta ?? ""}
                        onChange={(e) => onFieldChange("solucao_proposta", e.target.value)}
                        className="min-h-[100px] bg-white border-purple-200 focus:border-purple-400"
                        placeholder="Descreva a solução que seu negócio oferece..."
                      />
                    ) : (
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed">
                          {business.solucao_proposta || "Nenhuma solução proposta fornecida."}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </div>
            </Tabs>
          )}

          {/* Modelo de Negócio */}
          {(business.modelo_negocio || isEditingFields) && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-green-200">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Modelo de Negócio</h3>
              </div>
              {isEditingFields ? (
                <Textarea
                  value={editedBusiness.modelo_negocio ?? business.modelo_negocio ?? ""}
                  onChange={(e) => onFieldChange("modelo_negocio", e.target.value)}
                  className="min-h-[100px] bg-white border-purple-200 focus:border-purple-400"
                  placeholder="Descreva o modelo de negócio..."
                />
              ) : (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {business.modelo_negocio || "Nenhum modelo de negócio fornecido."}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}

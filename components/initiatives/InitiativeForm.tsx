import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  IniciativaCreate, 
  TipoIniciativa, 
  NivelMaturidade 
} from '@/lib/types/initiativeTypes';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { DatePicker } from '../ui/date-picker';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '../ui/checkbox';

const initiativeSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  descricao: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  tipo: z.nativeEnum(TipoIniciativa),
  nivel_maturidade: z.nativeEnum(NivelMaturidade).optional(),
  data_inicio: z.string(),
  data_fim: z.string().optional(),
  business_id: z.string(),
  
  // Campos
  areas_conhecimento: z.array(z.string()).optional(),
  tecnologias_utilizadas: z.array(z.string()).optional(),
  ods_relacionados: z.array(z.string()).optional(),
  palavras_chave: z.array(z.string()).optional(),
  
  // Campos de impacto
  impacto_esperado: z.string().optional(),
  metricas_sucesso: z.array(z.string()).optional(),
  publico_alvo: z.string().optional(),
  
  // Campos financeiros
  orcamento_previsto: z.number().optional(),
  moeda: z.string().optional(),
  fonte_financiamento: z.string().optional(),
  
  // Propriedade intelectual
  tem_propriedade_intelectual: z.boolean().optional(),
  tipo_propriedade: z.string().optional(),
  
  // Colaboração
  aceita_colaboradores: z.boolean().optional(),
  colaboracao_internacional: z.boolean().optional(),
  
  // Campos existentes
  laboratorios: z.array(z.string()).optional(),
  recursos_necessarios: z.string().optional(),
  resultados_esperados: z.string().optional(),
});

interface InitiativeFormProps {
  onSubmit: (data: IniciativaCreate) => void;
  isLoading?: boolean;
  defaultValues?: Partial<IniciativaCreate>;
}

export function InitiativeForm({ onSubmit, isLoading, defaultValues }: InitiativeFormProps) {
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [currentArea, setCurrentArea] = useState('');
  const [currentTech, setCurrentTech] = useState('');
  const [currentODS, setCurrentODS] = useState('');
  const [currentMetric, setCurrentMetric] = useState('');

  const form = useForm<IniciativaCreate>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      nivel_maturidade: NivelMaturidade.CONCEITO,
      areas_conhecimento: [],
      tecnologias_utilizadas: [],
      ods_relacionados: [],
      palavras_chave: [],
      metricas_sucesso: [],
      laboratorios: [],
      moeda: 'BRL',
      tem_propriedade_intelectual: false,
      aceita_colaboradores: true,
      colaboracao_internacional: false,
      ...defaultValues,
    },
  });

  const addToArray = (fieldName: keyof IniciativaCreate, value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      const currentArray = form.getValues(fieldName) as string[] || [];
      if (!currentArray.includes(value.trim())) {
        form.setValue(fieldName, [...currentArray, value.trim()] as any);
      }
      setValue('');
    }
  };

  const removeFromArray = (fieldName: keyof IniciativaCreate, index: number) => {
    const currentArray = form.getValues(fieldName) as string[] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    form.setValue(fieldName, newArray as any);
  };

  const ArrayInput = ({ 
    fieldName, 
    label, 
    placeholder, 
    currentValue, 
    setCurrentValue 
  }: {
    fieldName: keyof IniciativaCreate;
    label: string;
    placeholder: string;
    currentValue: string;
    setCurrentValue: (value: string) => void;
  }) => {
    const array = form.watch(fieldName) as string[] || [];
    
    return (
      <FormField
        control={form.control}
        name={fieldName}
        render={() => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder={placeholder}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray(fieldName, currentValue, setCurrentValue);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addToArray(fieldName, currentValue, setCurrentValue)}
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {array.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFromArray(fieldName, index)}
                  />
                </Badge>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações Básicas</h3>
          
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                  <Input placeholder="Digite o título da iniciativa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva detalhadamente a iniciativa" 
                    rows={4}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={TipoIniciativa.PESQUISA}>Pesquisa</SelectItem>
                      <SelectItem value={TipoIniciativa.INOVACAO}>Inovação</SelectItem>
                      <SelectItem value={TipoIniciativa.EMPREENDEDORISMO}>Empreendedorismo</SelectItem>
                      <SelectItem value={TipoIniciativa.EXTENSAO}>Extensão</SelectItem>
                      <SelectItem value={TipoIniciativa.DESENVOLVIMENTO}>Desenvolvimento</SelectItem>
                      <SelectItem value={TipoIniciativa.CONSULTORIA}>Consultoria</SelectItem>
                      <SelectItem value={TipoIniciativa.OUTROS}>Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nivel_maturidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Maturidade Tecnológica</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NivelMaturidade.CONCEITO}>Conceito (TRL 1-3)</SelectItem>
                      <SelectItem value={NivelMaturidade.PROTOTIPO}>Protótipo (TRL 4-6)</SelectItem>
                      <SelectItem value={NivelMaturidade.DEMONSTRACAO}>Demonstração (TRL 7-8)</SelectItem>
                      <SelectItem value={NivelMaturidade.COMERCIALIZACAO}>Comercialização (TRL 9)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Campos de Arrays */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Categorização</h3>
          
          <ArrayInput
            fieldName="areas_conhecimento"
            label="Áreas de Conhecimento"
            placeholder="Ex: Inteligência Artificial, Biotecnologia"
            currentValue={currentArea}
            setCurrentValue={setCurrentArea}
          />

          <ArrayInput
            fieldName="tecnologias_utilizadas"
            label="Tecnologias Utilizadas"
            placeholder="Ex: Python, React, IoT"
            currentValue={currentTech}
            setCurrentValue={setCurrentTech}
          />

          <ArrayInput
            fieldName="ods_relacionados"
            label="ODS Relacionados"
            placeholder="Ex: ODS 3 - Saúde e Bem-estar"
            currentValue={currentODS}
            setCurrentValue={setCurrentODS}
          />

          <ArrayInput
            fieldName="palavras_chave"
            label="Palavras-chave"
            placeholder="Ex: sustentabilidade, inovação"
            currentValue={currentKeyword}
            setCurrentValue={setCurrentKeyword}
          />
        </div>

        {/* Impacto e Métricas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Impacto e Métricas</h3>
          
          <FormField
            control={form.control}
            name="impacto_esperado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impacto Esperado</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva o impacto esperado da iniciativa" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ArrayInput
            fieldName="metricas_sucesso"
            label="Métricas de Sucesso"
            placeholder="Ex: 100 usuários ativos, 50% redução de custos"
            currentValue={currentMetric}
            setCurrentValue={setCurrentMetric}
          />

          <FormField
            control={form.control}
            name="publico_alvo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Público-alvo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Pequenas empresas, estudantes universitários" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Informações Financeiras */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações Financeiras</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="orcamento_previsto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orçamento Previsto</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moeda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a moeda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BRL">Real (BRL)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="fonte_financiamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fonte de Financiamento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: CNPq, FAPESP, recursos próprios" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Propriedade Intelectual */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Propriedade Intelectual</h3>
          
          <FormField
            control={form.control}
            name="tem_propriedade_intelectual"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Possui propriedade intelectual</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch('tem_propriedade_intelectual') && (
            <FormField
              control={form.control}
              name="tipo_propriedade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Propriedade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Patente, Marca, Software" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Colaboração */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Colaboração</h3>
          
          <FormField
            control={form.control}
            name="aceita_colaboradores"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Aceita novos colaboradores</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="colaboracao_internacional"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Tem colaboração internacional</FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Campos Existentes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações Adicionais</h3>
          
          <FormField
            control={form.control}
            name="recursos_necessarios"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recursos Necessários</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva os recursos necessários" 
                    rows={3}
                    {...field} 
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
          <FormField
            control={form.control}
            name="resultados_esperados"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resultados Esperados</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva os resultados esperados" 
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Salvando...' : 'Salvar Iniciativa'}
        </Button>
      </form>
    </Form>
  );
} 
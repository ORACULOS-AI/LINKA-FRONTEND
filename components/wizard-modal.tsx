'use client'

import { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface WizardStep {
  title: string
  icon?: ReactNode
  content: ReactNode
  fields?: string[]
}

interface WizardModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onSubmit: () => void
  isSubmitting?: boolean
  submitText?: string
  canGoNext?: boolean
  canSubmit?: boolean
  maxWidth?: string
}

export function WizardModal({
  isOpen,
  onClose,
  title,
  description,
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  isSubmitting = false,
  submitText = 'Criar',
  canGoNext = true,
  canSubmit = true,
  maxWidth = 'sm:max-w-[600px]',
}: WizardModalProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canGoNext) {
      onStepChange(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    if (canSubmit && !isSubmitting) {
      onSubmit()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-h-[90vh] overflow-y-auto', maxWidth)}>
        <DialogHeader className="space-y-3">
          <DialogTitle
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(to right, #9333ea, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription style={{ color: '#6b7280' }}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Etapa {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          {/* Progress bar customizada com cores concretas */}
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#e9d5ff' }}>
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(to right, #9333ea, #7c3aed)',
              }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-2 overflow-x-auto py-2 px-1 gap-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isCurrent = index === currentStep

            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        'flex flex-col items-center flex-1 transition-all duration-200 cursor-default',
                        isCurrent && 'scale-105',
                      )}
                    >
                      {/* Icon/Check Circle */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200 border-2"
                        style={{
                          background: isCompleted
                            ? 'linear-gradient(to bottom right, #9333ea, #7c3aed)'
                            : isCurrent
                            ? '#ffffff'
                            : '#f3f4f6',
                          borderColor: isCompleted || isCurrent ? '#9333ea' : '#e5e7eb',
                          boxShadow: isCurrent ? '0 10px 15px -3px rgba(147, 51, 234, 0.3)' : 'none',
                        }}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" style={{ color: '#ffffff' }} />
                        ) : (
                          <div
                            className="text-sm font-bold"
                            style={{
                              color: isCurrent ? '#9333ea' : '#9ca3af',
                            }}
                          >
                            {step.icon}
                          </div>
                        )}
                      </div>

                      {/* Step Title */}
                      <span
                        className="text-xs text-center whitespace-nowrap transition-colors duration-200 font-medium"
                        style={{
                          color: isCurrent
                            ? '#9333ea'
                            : isCompleted
                            ? '#a855f7'
                            : '#9ca3af',
                          fontWeight: isCurrent ? '600' : '500',
                        }}
                      >
                        {step.title}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent style={{ backgroundColor: '#9333ea', color: '#ffffff', borderColor: '#9333ea' }}>
                    {step.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>

        {/* Step Content */}
        <div className="py-6" key={`step-content-${currentStep}`}>
          {steps[currentStep]?.content}
        </div>

        {/* Footer with navigation buttons */}
        <DialogFooter className="flex gap-3 sm:gap-3">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrev}
              style={{
                borderColor: '#e9d5ff',
                color: '#9333ea',
              }}
              className="hover:bg-purple-50"
            >
              Voltar
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              style={{
                background: 'linear-gradient(to right, #9333ea, #7c3aed)',
                color: '#ffffff',
                boxShadow: '0 10px 15px -3px rgba(147, 51, 234, 0.3)',
              }}
              className="hover:opacity-90 transition-opacity"
            >
              Próximo
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
              style={{
                background: 'linear-gradient(to right, #9333ea, #7c3aed)',
                color: '#ffffff',
                boxShadow: '0 10px 15px -3px rgba(147, 51, 234, 0.3)',
              }}
              className="hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? 'Criando...' : submitText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

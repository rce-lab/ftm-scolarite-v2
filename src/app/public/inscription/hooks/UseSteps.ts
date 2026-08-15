// src/app/public/inscription/hooks/useSteps.ts
'use client'

import { useState, useCallback } from 'react'

export function useSteps(initialStep: number = 1) {
  const [currentStep, setCurrentStep] = useState(initialStep)

  const next = useCallback(() => {
    setCurrentStep(prev => prev + 1)
  }, [])

  const back = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, step))
  }, [])

  const reset = useCallback(() => {
    setCurrentStep(initialStep)
  }, [initialStep])

  return {
    currentStep,
    next,
    back,
    goToStep,
    reset
  }
}
// src/app/public/inscription/data/niveauCalcul.ts

import { 
  SOUS_QUESTIONS_CECRL, 
  PREMIERE_QUESTION_A1,
  STRUCTURE_NIVEAUX 
} from './competencesCECRL'

export interface ReponsesUtilisateur {
  [questionId: string]: 'oui' | 'un_peu' | 'non'
}

// Scores par réponse
const SCORES = {
  'oui': 2,
  'un_peu': 1,
  'non': 0
} as const

// Vérifier si la réponse à la première question A1 est "OUI"
export function estDebutantComplet(reponses: ReponsesUtilisateur): boolean {
  return reponses[PREMIERE_QUESTION_A1.id] === 'oui'
}

// Calculer le nombre total de sous-questions disponibles par niveau
function compterSousQuestionsDisponiblesParNiveau(): Record<string, number> {
  const comptes: Record<string, number> = {}
  
  SOUS_QUESTIONS_CECRL.forEach(question => {
    if (!comptes[question.niveau]) {
      comptes[question.niveau] = 0
    }
    comptes[question.niveau]++
  })
  
  return comptes
}

// Calculer le score pour un niveau donné
function calculerScorePourNiveau(
  niveau: string, 
  reponses: ReponsesUtilisateur
): { score: number; totalQuestions: number; questionsRepondues: number } {
  const questionsDuNiveau = SOUS_QUESTIONS_CECRL.filter(q => q.niveau === niveau)
  let score = 0
  let questionsRepondues = 0
  
  questionsDuNiveau.forEach(question => {
    const reponse = reponses[question.id]
    if (reponse) {
      questionsRepondues++
      score += SCORES[reponse]
    }
  })
  
  return {
    score,
    totalQuestions: questionsDuNiveau.length,
    questionsRepondues
  }
}

// Vérifier si un niveau est atteint selon l'algorithme
function niveauEstAtteint(
  niveau: string,
  reponses: ReponsesUtilisateur
): boolean {
  const niveauData = STRUCTURE_NIVEAUX.find(n => n.niveau === niveau)
  if (!niveauData) return false
  
  const { score, totalQuestions, questionsRepondues } = calculerScorePourNiveau(niveau, reponses)
  
  // Si nous n'avons pas toutes les questions de ce niveau dans la base,
  // on ajuste le seuil proportionnellement
  const sousQuestionsDisponibles = totalQuestions
  const sousQuestionsTotalAttendu = niveauData.seuil // Note: dans notre structure, 'seuil' = nombre de sous-questions
  
  // Si nous n'avons pas de questions pour ce niveau, ne pas le considérer
  if (sousQuestionsDisponibles === 0) return false
  
  // Calcul du seuil ajusté basé sur les questions disponibles
  // Ex: si C2 a 16 questions total mais seulement 8 disponibles, seuil = 8 (50% de 16)
  const seuilAjuste = Math.ceil(sousQuestionsTotalAttendu * (sousQuestionsDisponibles / sousQuestionsTotalAttendu))
  
  // Pour être valide, il faut avoir répondu à au moins 70% des questions disponibles
  // et atteindre le seuil ajusté
  const pourcentageRepondu = (questionsRepondues / sousQuestionsDisponibles) * 100
  const minimumReponsesRequis = 0.7 // 70%
  
  if (pourcentageRepondu >= minimumReponsesRequis * 100 && score >= seuilAjuste) {
    console.log(`✅ Niveau ${niveau} atteint: Score=${score}, SeuilAjuste=${seuilAjuste}, Repondues=${questionsRepondues}/${sousQuestionsDisponibles}`)
    return true
  }
  
  console.log(`❌ Niveau ${niveau} non atteint: Score=${score}, SeuilAjuste=${seuilAjuste}, Repondues=${questionsRepondues}/${sousQuestionsDisponibles}`)
  return false
}

// ALGORITHME PRINCIPAL : Calculer le niveau suggéré
export function calculerNiveauSuggere(reponses: ReponsesUtilisateur): string {
  // 1. Vérifier si débutant complet (première question A1 = "OUI")
  if (estDebutantComplet(reponses)) {
    return 'A1'
  }
  
  // 2. Ordonner les niveaux du plus élevé au plus bas
  const niveaux = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1']
  
  // 3. Parcourir les niveaux en commençant par le plus haut
  for (const niveau of niveaux) {
    if (niveauEstAtteint(niveau, reponses)) {
      return niveau
    }
  }
  
  // 4. Par défaut, retourner A1
  return 'A1'
}

// Calculer les statistiques détaillées pour le dashboard
export function calculerStatistiquesDetaillees(reponses: ReponsesUtilisateur) {
  const niveaux = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const statistiques: Record<string, {
    score: number
    totalQuestions: number
    questionsRepondues: number
    pourcentageRepondu: number
    scoreMaxPossible: number
    pourcentageScore: number
    seuil: number
    seuilAtteint: boolean
  }> = {}
  
  // Compter les sous-questions disponibles
  const sousQuestionsDisponibles = compterSousQuestionsDisponiblesParNiveau()
  
  niveaux.forEach(niveau => {
    const { score, totalQuestions, questionsRepondues } = calculerScorePourNiveau(niveau, reponses)
    const niveauData = STRUCTURE_NIVEAUX.find(n => n.niveau === niveau)
    
    statistiques[niveau] = {
      score,
      totalQuestions,
      questionsRepondues,
      pourcentageRepondu: totalQuestions > 0 ? (questionsRepondues / totalQuestions) * 100 : 0,
      scoreMaxPossible: totalQuestions * 2,
      pourcentageScore: totalQuestions > 0 ? (score / (totalQuestions * 2)) * 100 : 0,
      seuil: niveauData?.seuil || 0,
      seuilAtteint: niveauEstAtteint(niveau, reponses)
    }
  })
  
  return statistiques
}

// Exporter les réponses au format C1-C348 pour la base de données
export function exporterVersFormatC(reponses: ReponsesUtilisateur): Record<string, number> {
  const exportData: Record<string, number> = {}
  
  // Initialiser tous les codes Cxxx à 0
  SOUS_QUESTIONS_CECRL.forEach(question => {
    exportData[question.reponses.oui] = 0
    exportData[question.reponses.un_peu] = 0
    exportData[question.reponses.non] = 0
  })
  
  // Remplir avec les réponses de l'utilisateur
  SOUS_QUESTIONS_CECRL.forEach(question => {
    const reponse = reponses[question.id]
    
    if (reponse === 'oui') {
      exportData[question.reponses.oui] = 1
    } else if (reponse === 'un_peu') {
      exportData[question.reponses.un_peu] = 1
    } else if (reponse === 'non') {
      exportData[question.reponses.non] = 1
    }
    // Si pas de réponse, reste à 0
  })
  
  return exportData
}

// Fonction pour afficher un résumé du calcul
export function afficherResumeCalcul(reponses: ReponsesUtilisateur): string {
  const niveau = calculerNiveauSuggere(reponses)
  const stats = calculerStatistiquesDetaillees(reponses)
  
  let resume = `Niveau suggéré : ${niveau}\n\n`
  
  Object.entries(stats).forEach(([niveau, data]) => {
    resume += `${niveau} : ${data.score}/${data.scoreMaxPossible} points `
    resume += `(${data.pourcentageScore.toFixed(1)}%) `
    resume += `- ${data.questionsRepondues}/${data.totalQuestions} questions `
    resume += data.seuilAtteint ? '✅\n' : '❌\n'
  })
  
  return resume
}
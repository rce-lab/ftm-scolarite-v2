// src/lib/pdf/pdfUtils.ts
// Utilitaires jsPDF partagés entre tous les générateurs PDF du projet (grille de
// compétences, rapports...). Extrait de grilleCompetencesPdf.ts lors de l'ajout du
// second générateur, pour ne pas dupliquer le sanitizer anti-emoji.
import jsPDF from 'jspdf'

export const VERT_FTM: [number, number, number] = [104, 158, 78] // #689e4e, couleur de marque FTM

// Les polices standard de jsPDF (Helvetica...) n'encodent que le jeu WinAnsi
// (Latin-1) : un emoji est rendu comme un caractère corrompu au lieu d'être affiché.
// Ces emoji restent utiles à l'écran (boutons, etc.), donc on les retire seulement
// ici, juste avant l'insertion dans un PDF.
export function texteAscii(valeur: string): string {
  return (
    valeur
      // Emoji hors du plan de base (📄, 🎉...) : toujours une paire de substituts
      // UTF-16 ; le reste du projet ne compile pas avec le flag d'expression
      // régulière "u" (cible TypeScript par défaut, antérieure à ES2015), donc on
      // détecte la paire directement plutôt que d'utiliser \u{...}.
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
      // Emoji et symboles du plan de base (❌, ✅, flèches...) que la police
      // standard de jsPDF ne sait pas non plus afficher.
      .replace(/[←-⇿☀-➿⬀-⯿️‍]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
  )
}

// jspdf-autotable pose `lastAutoTable` sur le document à l'exécution mais ne le
// déclare pas dans ses types publiés (dts-bundle) : accès typé explicitement plutôt
// que de désactiver la vérification de type sur tout le fichier.
export function positionApresTableau(doc: jsPDF, repli: number): number {
  const avecDernierTableau = doc as unknown as { lastAutoTable?: { finalY: number } }
  return avecDernierTableau.lastAutoTable?.finalY ?? repli
}

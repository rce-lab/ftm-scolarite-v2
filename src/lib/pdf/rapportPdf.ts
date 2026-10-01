// src/lib/pdf/rapportPdf.ts
// Générateur PDF générique pour les rapports (src/app/admin/rapports/**), utilisé à
// la place de window.print(). Le bouton "Imprimer" (impression navigateur) posait
// deux problèmes sur ces tableaux larges : format portrait imposé par défaut (lignes
// tronquées) et la pagination de l'aperçu d'impression qui ne fonctionnait pas de
// façon fiable selon le pilote. jsPDF + jspdf-autotable construit le PDF directement
// en paysage avec une vraie pagination multi-page, indépendamment du navigateur —
// même principe que grilleCompetencesPdf.ts.
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { VERT_FTM, texteAscii } from '@/lib/pdf/pdfUtils'

interface OptionsRapportPdf {
  titre: string
  sousTitre?: string
  colonnes: string[]
  lignes: (string | number)[][]
  nomFichier: string
}

export function genererRapportPdf({ titre, sousTitre, colonnes, lignes, nomFichier }: OptionsRapportPdf): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const margeGauche = 10
  let y = 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(VERT_FTM[0], VERT_FTM[1], VERT_FTM[2])
  doc.text(texteAscii(titre), margeGauche, y)
  doc.setTextColor(0, 0, 0)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  if (sousTitre) {
    doc.text(texteAscii(sousTitre), margeGauche, y)
    y += 4
  }
  doc.text(
    texteAscii(`Édité le ${new Date().toLocaleDateString('fr-FR')} — ${lignes.length} ligne(s)`),
    margeGauche,
    y
  )
  y += 4

  autoTable(doc, {
    startY: y,
    margin: { left: margeGauche, right: margeGauche },
    styles: { fontSize: 8, cellPadding: 1.5, overflow: 'linebreak' },
    headStyles: { fillColor: VERT_FTM, textColor: 255 },
    // Répète l'en-tête sur chaque page générée automatiquement par autoTable —
    // c'est cette pagination native qui remplace l'aperçu d'impression du
    // navigateur, peu fiable sur un tableau de cette largeur.
    showHead: 'everyPage',
    head: [colonnes.map((c) => texteAscii(c))],
    body: lignes.map((ligne) => ligne.map((cellule) => texteAscii(String(cellule ?? ''))))
  })

  doc.save(nomFichier)
}

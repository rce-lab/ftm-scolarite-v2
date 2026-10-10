// src/lib/pdf/recuPdf.ts
// Reçu de paiement PDF signé, reproduisant le modèle « DOCS TECH/Reçu F.T.M..docx ».
// Généré côté serveur avec pdf-lib (pur JS, sans navigateur) — à n'appeler que depuis
// une action serveur (src/app/actions/recuActions.ts). Polices standard Times : leur
// encodage WinAnsi couvre les accents français et le signe €.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { BANDEAU_RECU_JPEG_BASE64, SIGNATURE_RECU_PNG_BASE64 } from '@/lib/pdf/recuAssets'
import { montantAvecLettres } from '@/lib/montantEnLettres'
import { formaterDateFr } from '@/lib/datePaiement'

export const SIGNATAIRE_RECU = 'RAKOTOMAVO Tafika'
export const ADRESSE_SIGNATAIRE_RECU = '02 Square Voltaire 94230 - Cachan'

export const LIBELLES_MODE_RECU: Record<string, string> = {
  virement: 'Virement',
  especes: 'Espèces',
  autre: 'Autre'
}

export interface DonneesRecu {
  numero: string
  // yyyy-mm-dd
  datePaiement: string
  montant: number
  prenom: string
  nom: string
  // ex. « 2026 - 2027 »
  anneeRecu: string
  mode: string
}

export async function genererRecuPdf(donnees: DonneesRecu): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`Reçu n° ${donnees.numero}`)
  doc.setAuthor('FTM Malagasy')

  const page = doc.addPage([595.28, 841.89]) // A4 portrait, en points
  const { width, height } = page.getSize()
  const marge = 50
  const largeurUtile = width - 2 * marge

  const times = await doc.embedFont(StandardFonts.TimesRoman)
  const timesGras = await doc.embedFont(StandardFonts.TimesRomanBold)
  const bandeau = await doc.embedJpg(BANDEAU_RECU_JPEG_BASE64)
  const signature = await doc.embedPng(SIGNATURE_RECU_PNG_BASE64)
  const noir = rgb(0, 0, 0)

  // Bandeau d'en-tête sur toute la largeur utile
  const hauteurBandeau = (bandeau.height / bandeau.width) * largeurUtile
  let y = height - 36 - hauteurBandeau
  page.drawImage(bandeau, { x: marge, y, width: largeurUtile, height: hauteurBandeau })

  // Titre centré
  y -= 50
  const titre = `Reçu n° ${donnees.numero}`
  const tailleTitre = 18
  page.drawText(titre, {
    x: (width - timesGras.widthOfTextAtSize(titre, tailleTitre)) / 2,
    y,
    size: tailleTitre,
    font: timesGras,
    color: noir
  })

  // Lignes « Libellé : valeur » ; la valeur passe à la ligne si elle dépasse
  const taille = 12
  const interligne = 26
  const ligne = (libelle: string, valeur: string) => {
    const debut = `${libelle} : `
    const largeurLibelle = timesGras.widthOfTextAtSize(debut, taille)
    page.drawText(debut, { x: marge, y, size: taille, font: timesGras, color: noir })
    const largeurDispo = largeurUtile - largeurLibelle
    let courant = ''
    const lignesValeur: string[] = []
    for (const mot of valeur.split(' ')) {
      const essai = courant ? `${courant} ${mot}` : mot
      if (courant && times.widthOfTextAtSize(essai, taille) > largeurDispo) {
        lignesValeur.push(courant)
        courant = mot
      } else {
        courant = essai
      }
    }
    if (courant) lignesValeur.push(courant)
    lignesValeur.forEach((texte, idx) => {
      page.drawText(texte, { x: marge + largeurLibelle, y: y - idx * 16, size: taille, font: times, color: noir })
    })
    y -= interligne + (lignesValeur.length - 1) * 16
  }

  const dateFr = formaterDateFr(donnees.datePaiement)
  const nomComplet = `${donnees.prenom.trim()} ${donnees.nom.trim().toUpperCase()}`.trim()

  y -= 45
  ligne('Je soussigné', SIGNATAIRE_RECU)
  ligne('Demeurant au', ADRESSE_SIGNATAIRE_RECU)
  ligne('Reconnais avoir reçu le', dateFr)
  ligne('La somme de', montantAvecLettres(donnees.montant))
  ligne('De la part de', nomComplet)
  ligne('Correspondant aux services suivants', `Droits d'inscription ${donnees.anneeRecu} (cours de malgache)`)
  ligne('Le paiement a été reçu sous la forme de', LIBELLES_MODE_RECU[donnees.mode] || donnees.mode || '—')

  y -= 20
  page.drawText('Fait pour valoir ce que de droit.', { x: marge, y, size: taille, font: times, color: noir })

  // Bloc lieu/date + signature, aligné à droite
  y -= 50
  const xSignature = width - marge - 200
  page.drawText(`Cachan, le ${dateFr}`, { x: xSignature, y, size: taille, font: times, color: noir })
  y -= 24
  page.drawText('Signature', { x: xSignature, y, size: taille, font: timesGras, color: noir })
  const largeurSignature = 110
  const hauteurSignature = (signature.height / signature.width) * largeurSignature
  y -= 8 + hauteurSignature
  page.drawImage(signature, { x: xSignature, y, width: largeurSignature, height: hauteurSignature })

  return doc.save()
}

// Nom de fichier : Recu_FTM_{numero avec / remplacé par -}.pdf
export function nomFichierRecu(numero: string): string {
  return `Recu_FTM_${numero.replace(/\//g, '-')}.pdf`
}

// src/lib/emailService.ts
import nodemailer from 'nodemailer'
import { translations } from '@/lib/i18n/translations'

const FROM_ADDRESS = 'FTM Malagasy <scolarite.ftm@gmail.com>'

// Adresses mises en copie (CC) sur les emails envoyés à un candidat UNIQUEMENT
// (pas sur les notifications internes, déjà envoyées à scolarite.ftm@gmail.com —
// les dupliquer ici serait redondant). Ajouter/retirer une adresse ici suffit.
// Liste définitive à remettre une fois les tests confirmés :
// 'sonya.rakotonirina@gmail.com',
// 'livafocard@gmail.com',
// 'r.philippejoelle@yahoo.fr',
// 'ramelintsoa@gmail.com',
// 't.rakotomavo@free.fr'
const ADMINS_EN_COPIE_CANDIDATS = [
  'crama6104@gmail.com'
]

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_SMTP_USER,
    pass: process.env.GMAIL_SMTP_PASSWORD
  }
})

interface InscriptionData {
  nom: string
  prenom: string
  email_contact: string
  telephone: string
  niveau_suggere: string
  student_code: string
  age?: number | null
}

export async function sendInscriptionNotification(
  inscription: InscriptionData,
  adminEmails: string[]
) {
  try {
    // Email à l'étudiant
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: inscription.email_contact,
      cc: ADMINS_EN_COPIE_CANDIDATS,
      subject: 'Confirmation de votre inscription - FTM Malagasy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">FTM Malagasy</h1>
            <p style="color: #6b7280;">Apprentissage de la langue malagasy</p>
          </div>
          
          <h2 style="color: #1f2937;">Bonjour ${inscription.prenom} ${inscription.nom},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Votre inscription aux cours de Malagasy a bien été enregistrée.
          </p>
          
          <div style="background: #f8fafc; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-top: 0;">Vos informations d'inscription</h3>
            <p><strong>Code étudiant :</strong> <span style="font-family: monospace; background: #e0e7ff; padding: 2px 6px; border-radius: 4px;">${inscription.student_code}</span></p>
            <p><strong>Niveau suggéré :</strong> ${inscription.niveau_suggere}</p>
            <p><strong>Date d'inscription :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Un administrateur validera bientôt votre inscription et vous contactera pour la suite du processus.
            Vous recevrez un email avec les détails de votre classe et l'emploi du temps.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 0.9em;">
              <strong>Contact :</strong> ${adminEmails.join(', ')}<br>
              <strong>Site web :</strong> ${process.env.APP_URL || 'https://ftm-malagasy.org'}
            </p>
          </div>
          
          <p style="color: #374151; margin-top: 30px;">
            Cordialement,<br>
            <strong>L'équipe FTM Malagasy</strong>
          </p>
        </div>
      `
    })

    // Notification à l'administrateur (toujours en malgache — envoi automatique côté serveur, pas de bascule dynamique de langue ici)
    const adminSubject = translations.emailAdminNotification.subject.mg
      .replace('{code}', inscription.student_code)
      .replace('{prenom}', inscription.prenom)
      .replace('{nom}', inscription.nom)

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: adminEmails,
      subject: adminSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">${translations.emailAdminNotification.heading.mg}</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</p>
          </div>

          <div style="padding: 25px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #1f2937; margin-top: 0;">${inscription.prenom} ${inscription.nom}</h2>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb; width: 30%;"><strong>${translations.emailAdminNotification.studentCodeLabel.mg}</strong></td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; font-family: monospace; font-weight: bold; color: #1e40af;">${inscription.student_code}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb;"><strong>${translations.emailAdminNotification.emailLabel.mg}</strong></td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${inscription.email_contact}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb;"><strong>${translations.emailAdminNotification.phoneLabel.mg}</strong></td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${inscription.telephone}</td>
              </tr>
              ${inscription.age ? `<tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb;"><strong>${translations.emailAdminNotification.ageLabel.mg}</strong></td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${translations.emailAdminNotification.ageYears.mg.replace('{age}', String(inscription.age))}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; background: #f9fafb;"><strong>${translations.emailAdminNotification.suggestedLevelLabel.mg}</strong></td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">
                  <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-weight: bold;">
                    ${inscription.niveau_suggere}
                  </span>
                </td>
              </tr>
            </table>

            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.APP_URL}/admin/inscriptions/${inscription.student_code}"
                 style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                ${translations.emailAdminNotification.viewDetailsButton.mg}
              </a>
            </div>

            <p style="color: #6b7280; font-size: 0.9em; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              ${translations.emailAdminNotification.autoNotice.mg}
            </p>
          </div>
        </div>
      `
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return { success: false, error }
  }
}

interface ClasseData {
  nom: string
  jour?: string | null
  heure?: string | null
}

// Fonction pour annoncer la validation de l'inscription et la classe assignée
export async function sendDecisionEmail(
  inscription: InscriptionData,
  classe: ClasseData
) {
  try {
    const horaire = [classe.jour, classe.heure].filter(Boolean).join(' à ')

    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: inscription.email_contact,
      cc: ADMINS_EN_COPIE_CANDIDATS,
      subject: 'Votre inscription est validée - FTM Malagasy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">FTM Malagasy</h1>
            <p style="color: #6b7280;">Apprentissage de la langue malagasy</p>
          </div>

          <h2 style="color: #1f2937;">Bonjour ${inscription.prenom} ${inscription.nom},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Bonne nouvelle ! Votre inscription aux cours de Malagasy a été validée par le conseil pédagogique.
          </p>

          <div style="background: #f8fafc; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-top: 0;">Votre classe</h3>
            <p><strong>Code étudiant :</strong> <span style="font-family: monospace; background: #e0e7ff; padding: 2px 6px; border-radius: 4px;">${inscription.student_code}</span></p>
            <p><strong>Classe assignée :</strong> ${classe.nom}</p>
            ${horaire ? `<p><strong>Horaire :</strong> ${horaire}</p>` : ''}
          </div>

          <div style="background: #fffbeb; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Frais d'inscription</h3>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 0;">
              Merci de régler les <strong>30€</strong> de frais d'inscription dès que possible.
              Il n'y a pas de date limite imposée : vous pouvez effectuer ce paiement quand cela vous convient.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 0.9em;">
              <strong>Site web :</strong> ${process.env.APP_URL || 'https://ftm-malagasy.org'}
            </p>
          </div>

          <p style="color: #374151; margin-top: 30px;">
            Cordialement,<br>
            <strong>L'équipe FTM Malagasy</strong>
          </p>
        </div>
      `
    })

    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email décision:', error)
    return { success: false, error }
  }
}

// Fonction pour envoyer la confirmation de paiement
export async function sendPaymentConfirmation(
  studentEmail: string,
  studentName: string,
  studentCode: string,
  amount: number
) {
  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: studentEmail,
      cc: ADMINS_EN_COPIE_CANDIDATS,
      subject: 'Confirmation de paiement - FTM Malagasy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Paiement confirmé</h2>
          <p>Bonjour ${studentName},</p>
          <p>Votre paiement de ${amount}€ pour l'inscription ${studentCode} a bien été enregistré.</p>
          <p>Votre inscription est maintenant complète.</p>
        </div>
      `
    })
    
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email paiement:', error)
    return { success: false, error }
  }
}
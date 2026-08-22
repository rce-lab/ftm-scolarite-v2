// src/app/public/inscription/components/PersonalInfoStep/index.tsx
'use client'

import { StepProps, FormData } from '../../types'
import { useMemo, useState } from 'react'
import { PAYS } from '../../data/pays'
import { usePublicTranslation } from '@/lib/i18n/PublicLanguageContext'
import { supabase } from '@/lib/supabase/client'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 Mo

const generateUniqueId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export default function PersonalInfoStep({
  formData,
  updateFormData,
  onNext,
  onBack
}: StepProps) {
  const { t, language } = usePublicTranslation()

  const paysTries = useMemo(() => {
    return [...PAYS].sort((a, b) =>
      language === 'en'
        ? a.nomAnglais.localeCompare(b.nomAnglais)
        : a.nom.localeCompare(b.nom, 'fr')
    )
  }, [language])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState('')

  const ageNum = parseInt(formData.age)
  const isMinor = !isNaN(ageNum) && ageNum < 18

  // Validation des noms
  const validateName = (name: string, field: 'nom' | 'prenom'): string => {
    if (!name.trim()) {
      return field === 'prenom' ? t('personalInfo.firstNameRequiredError') : t('personalInfo.nameRequiredError')
    }
    const nameRegex = /^[a-zA-ZÀ-ÿ\-\'\s]{2,50}$/
    if (!nameRegex.test(name.trim())) {
      return field === 'prenom'
        ? t('personalInfo.firstNameInvalidError')
        : t('personalInfo.nameInvalidError')
    }
    return ''
  }

  // Validation email
  const validateEmail = (email: string): string => {
    if (!email.trim()) return t('personalInfo.emailRequiredError')
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return t('personalInfo.emailInvalidError')
    }
    return ''
  }

  // Validation téléphone (numéro local, sans indicatif)
  const validatePhone = (phone: string): string => {
    if (!phone.trim()) return t('personalInfo.phoneRequiredError')
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 6) {
      return t('personalInfo.phoneTooShortError')
    }
    return ''
  }

  // Validation âge
  const validateAge = (age: string): string => {
    if (!age.trim()) return t('personalInfo.ageRequiredError')
    const ageNumLocal = parseInt(age)
    if (isNaN(ageNumLocal) || ageNumLocal < 6 || ageNumLocal > 80) {
      return t('personalInfo.ageInvalidError')
    }
    return ''
  }

  // Validation champ requis (le message traduit est déjà résolu par l'appelant)
  const validateRequiredField = (value: string, message: string): string => {
    return value.trim() ? '' : message
  }

  // Validation du responsable légal, obligatoire uniquement si le candidat est mineur
  const validateLegalGuardian = (value: string, age: string): string => {
    const ageNumLocal = parseInt(age)
    const minor = !isNaN(ageNumLocal) && ageNumLocal < 18
    if (minor && !value.trim()) {
      return t('personalInfo.legalGuardianRequiredError')
    }
    return ''
  }

  // Formatage téléphone (numéro local uniquement, sans indicatif)
  const formatPhoneNumber = (value: string): string => {
    return value.replace(/[^\d\s\-]/g, '')
  }

  // Casse de titre : première lettre de chaque mot en majuscule (mots séparés par espace ou tiret)
  const toTitleCase = (value: string): string => {
    return value
      .toLowerCase()
      .split(/([\s\-])/)
      .map(part => (part === ' ' || part === '-') ? part : part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  }

  // Gestionnaire de changement
  const handleNameChange = (field: 'nom' | 'prenom', value: string) => {
    const cleaned = value.replace(/[^a-zA-ZÀ-ÿ\-\'\s]/g, '')
    const cased = field === 'nom' ? cleaned.toUpperCase() : toTitleCase(cleaned)
    updateFormData(field, cased)

    const error = validateName(cased, field)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  const handleEmailChange = (value: string) => {
    updateFormData('email_contact', value)

    const error = validateEmail(value)
    setErrors(prev => ({
      ...prev,
      email_contact: error
    }))
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    updateFormData('telephone', formatted)

    const error = validatePhone(formatted)
    setErrors(prev => ({
      ...prev,
      telephone: error
    }))
  }

  const handleAgeChange = (value: string) => {
    updateFormData('age', value)

    setErrors(prev => ({
      ...prev,
      age: validateAge(value),
      responsable_legal: validateLegalGuardian(formData.responsable_legal, value)
    }))
  }

  const handleLegalGuardianChange = (value: string) => {
    updateFormData('responsable_legal', value)

    setErrors(prev => ({
      ...prev,
      responsable_legal: validateLegalGuardian(value, formData.age)
    }))
  }

  const handleGeneralChange = (field: keyof FormData, value: string) => {
    const processed = field === 'ville_residence'
      ? value.toUpperCase()
      : value
    updateFormData(field, processed)

    if (field === 'pays_residence') {
      const pays = PAYS.find(p => p.nom === processed)
      updateFormData('indicatif_pays', pays?.indicatif || '')
    }

    if (field === 'pays_residence' || field === 'ville_residence') {
      const message = field === 'pays_residence' ? t('personalInfo.countryRequiredError') : t('personalInfo.cityRequiredError')
      const error = validateRequiredField(processed, message)
      setErrors(prev => ({
        ...prev,
        [field]: error
      }))
    }
  }

  const handleIndicatifChange = (value: string) => {
    updateFormData('indicatif_pays', value)
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoError('')
    setSelectedFileName(file.name)

    if (!file.type.startsWith('image/')) {
      setPhotoError(t('personalInfo.photoInvalidTypeError'))
      e.target.value = ''
      setSelectedFileName('')
      return
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError(t('personalInfo.photoTooLargeError'))
      e.target.value = ''
      setSelectedFileName('')
      return
    }

    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl)
    }
    setPhotoPreviewUrl(URL.createObjectURL(file))

    setPhotoUploading(true)
    try {
      const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
      const filePath = `${generateUniqueId()}.${extension}`

      const { data, error } = await supabase.storage
        .from('photos-candidats')
        .upload(filePath, file, { upsert: false })

      if (error) throw error

      updateFormData('photo_url', data.path)
    } catch (error) {
      console.error('Erreur upload photo:', error)
      setPhotoError(t('personalInfo.photoUploadError'))
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl)
    }
    setPhotoPreviewUrl(null)
    setPhotoError('')
    setSelectedFileName('')
    updateFormData('photo_url', '')
  }

  // Validation complète
  const validateForm = () => {
    const newErrors = {
      nom: validateName(formData.nom, 'nom'),
      prenom: validateName(formData.prenom, 'prenom'),
      age: validateAge(formData.age),
      pays_residence: validateRequiredField(formData.pays_residence, t('personalInfo.countryRequiredError')),
      ville_residence: validateRequiredField(formData.ville_residence, t('personalInfo.cityRequiredError')),
      email_contact: validateEmail(formData.email_contact),
      telephone: validatePhone(formData.telephone),
      responsable_legal: validateLegalGuardian(formData.responsable_legal, formData.age)
    }

    setErrors(newErrors)

    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onNext()
    } else {
      const firstErrorField = Object.keys(errors).find(key => errors[key])
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  // Vérification si le formulaire est valide
  const isFormValid = () => {
    return formData.nom.trim() !== '' &&
           formData.prenom.trim() !== '' &&
           formData.age.trim() !== '' &&
           formData.pays_residence.trim() !== '' &&
           formData.ville_residence.trim() !== '' &&
           formData.email_contact.trim() !== '' &&
           formData.telephone.trim() !== '' &&
           (!isMinor || formData.responsable_legal.trim() !== '') &&
           errors.nom === '' &&
           errors.prenom === '' &&
           errors.age === '' &&
           errors.pays_residence === '' &&
           errors.ville_residence === '' &&
           errors.email_contact === '' &&
           errors.telephone === '' &&
           !errors.responsable_legal
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">{t('personalInfo.title')}</h2>
      <p className="text-gray-600 text-base">{t('personalInfo.subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Colonne gauche */}
        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-base">
              {t('personalInfo.nameLabel')}
            </label>
            <input
              name="nom"
              type="text"
              className={`w-full p-2 border rounded text-sm ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.nom}
              onChange={(e) => handleNameChange('nom', e.target.value)}
              required
              placeholder={t('personalInfo.namePlaceholder')}
            />
            {errors.nom && <p className="text-sm text-red-500 mt-1">{errors.nom}</p>}
          </div>

          <div>
            <label className="block mb-1 text-base">
              {t('personalInfo.firstNameLabel')}
            </label>
            <input
              name="prenom"
              type="text"
              className={`w-full p-2 border rounded text-sm ${
                errors.prenom ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.prenom}
              onChange={(e) => handleNameChange('prenom', e.target.value)}
              required
              placeholder={t('personalInfo.firstNamePlaceholder')}
            />
            {errors.prenom && <p className="text-sm text-red-500 mt-1">{errors.prenom}</p>}
          </div>

          <div>
            <label className="block mb-1 text-base">
              {t('personalInfo.ageLabel')}
            </label>
            <input
              name="age"
              type="number"
              className={`w-full p-2 border rounded text-sm ${
                errors.age ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.age}
              onChange={(e) => handleAgeChange(e.target.value)}
              min="6"
              max="80"
              required
              placeholder={t('personalInfo.agePlaceholder')}
            />
            {errors.age && <p className="text-sm text-red-500 mt-1">{errors.age}</p>}
          </div>

          <div>
            <label className="block mb-1 text-base">
              {t('personalInfo.countryLabel')}
            </label>
            <select
              name="pays_residence"
              className={`w-full p-2 border rounded text-sm ${
                errors.pays_residence ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.pays_residence}
              onChange={(e) => handleGeneralChange('pays_residence', e.target.value)}
              required
            >
              <option value="">{t('personalInfo.countrySelectPlaceholder')}</option>
              {paysTries.map((pays) => (
                <option key={pays.nom} value={pays.nom}>
                  {language === 'en' ? pays.nomAnglais : pays.nom}
                </option>
              ))}
            </select>
            {errors.pays_residence && <p className="text-sm text-red-500 mt-1">{errors.pays_residence}</p>}
          </div>

          <div>
            <label className="block mb-1 text-base">
              {t('personalInfo.cityLabel')}
            </label>
            <input
              name="ville_residence"
              type="text"
              className={`w-full p-2 border rounded text-sm ${
                errors.ville_residence ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.ville_residence}
              onChange={(e) => handleGeneralChange('ville_residence', e.target.value)}
              required
              placeholder={t('personalInfo.cityPlaceholder')}
            />
            {errors.ville_residence && <p className="text-sm text-red-500 mt-1">{errors.ville_residence}</p>}
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-base">
              {t('personalInfo.legalGuardianLabel')}{isMinor ? ' *' : ''}
            </label>
            <input
              name="responsable_legal"
              type="text"
              className={`w-full p-2 border rounded text-sm ${
                errors.responsable_legal ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.responsable_legal}
              onChange={(e) => handleLegalGuardianChange(e.target.value)}
              placeholder={t('personalInfo.legalGuardianPlaceholder')}
            />
            {errors.responsable_legal ? (
              <p className="text-sm text-red-500 mt-1">{errors.responsable_legal}</p>
            ) : (
              <p className="text-sm text-gray-700 mt-1">{t('personalInfo.legalGuardianHint')}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-base">
              {t('personalInfo.emailLabel')}
            </label>
            <input
              name="email_contact"
              type="email"
              className={`w-full p-2 border rounded text-sm ${
                errors.email_contact ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.email_contact}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              placeholder={t('personalInfo.emailPlaceholder')}
            />
            {errors.email_contact && <p className="text-sm text-red-500 mt-1">{errors.email_contact}</p>}
          </div>

          <div>
            <label className="block mb-1 text-base">
              {t('personalInfo.addressLabel')}
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded text-sm"
              value={formData.adresse_postale}
              onChange={(e) => handleGeneralChange('adresse_postale', e.target.value)}
              rows={2}
              placeholder={t('personalInfo.addressPlaceholder')}
            />
          </div>

          <div>
            <label className="block mb-1 text-base">
              {t('personalInfo.phoneLabel')}
            </label>
            <div className="flex gap-2">
              <input
                name="indicatif_pays"
                type="text"
                value={formData.indicatif_pays}
                onChange={(e) => handleIndicatifChange(e.target.value)}
                className="w-20 p-2 border border-gray-300 rounded text-sm"
                placeholder={t('personalInfo.countryCodePlaceholder')}
              />
              <input
                name="telephone"
                type="tel"
                className={`flex-1 p-2 border rounded text-sm ${
                  errors.telephone ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.telephone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                required
                placeholder={t('personalInfo.phonePlaceholder')}
              />
            </div>
            {errors.telephone && <p className="text-sm text-red-500 mt-1">{errors.telephone}</p>}
            <p className="text-sm text-gray-700 mt-1">
              {t('personalInfo.countryCodeHint')}
            </p>
          </div>
        </div>
      </div>

      {/* Photo (optionnelle) */}
      <div className="pt-3 border-t border-gray-200">
        <label className="block mb-1 text-base">
          {t('personalInfo.photoLabel')}
        </label>

        {photoPreviewUrl ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreviewUrl}
              alt={t('personalInfo.photoPreviewAlt')}
              className="w-16 h-16 object-cover rounded border border-gray-300"
            />
            <div className="flex flex-col gap-1">
              {photoUploading && <span className="text-sm text-gray-700">{t('personalInfo.photoUploading')}</span>}
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-sm text-red-600 hover:text-red-800 text-left"
              >
                {t('personalInfo.removePhotoButton')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <label
                htmlFor="photo-upload-input"
                className="px-3 py-1.5 border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50"
              >
                {t('personalInfo.choosePhotoButton')}
              </label>
              <span className="text-sm text-gray-700">
                {selectedFileName || t('personalInfo.noFileChosenLabel')}
              </span>
              <input
                id="photo-upload-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
              />
            </div>
            <p className="text-sm text-gray-700 mt-1">{t('personalInfo.photoHint')}</p>
          </>
        )}

        {photoError && <p className="text-sm text-red-500 mt-1">{photoError}</p>}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
        >
          {t('personalInfo.backButton')}
        </button>

        <button
          onClick={handleSubmit}
          disabled={!isFormValid()}
          className={`px-4 py-2 rounded text-sm ${
            isFormValid()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {t('personalInfo.nextButton')}
        </button>
      </div>
    </div>
  );
}

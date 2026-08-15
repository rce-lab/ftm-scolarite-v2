import { supabase } from './supabase/client'

export interface Config {
  email_communication: string
  montant_inscription: number
  rib_banque: string
  annee_scolaire_courante: string
  prefixe_code_etudiant: string
  beneficiaire: string
  email_responsable_scolarite?: string
  email_responsable_administratif?: string
  [key: string]: string | number | boolean | undefined
}

let cachedConfig: Config | null = null

function getDefaultConfig(): Config {
  return {
    montant_inscription: 30,
    annee_scolaire_courante: '2026-2027',
    prefixe_code_etudiant: 'FTM-26',
    email_communication: 'scolarite_ftm@gmail.com',
    rib_banque: 'ERREUR CONFIGURATION — contactez scolarite_ftm@gmail.com',
    beneficiaire: 'ERREUR CONFIGURATION — contactez scolarite_ftm@gmail.com',
    email_responsable_scolarite: '',
    email_responsable_administratif: ''
  }
}

export async function getConfig(): Promise<Config> {
  if (cachedConfig) {
    console.log('Config depuis cache:', cachedConfig);
    return cachedConfig;
  }
  
  const { data, error } = await supabase
    .from('configuration')
    .select('key, value');
  
  if (error) {
    console.error('Erreur chargement configuration:', error);
    return getDefaultConfig();
  }
  
  const config = {} as Config;
  data.forEach(item => {
    console.log(`Config item: ${item.key} = ${item.value} (type: ${typeof item.value})`);
    
    // Convertir les nombres
    if (!isNaN(Number(item.value))) {
      config[item.key] = Number(item.value);
    } else if (item.value.toLowerCase() === 'true' || item.value.toLowerCase() === 'false') {
      config[item.key] = item.value.toLowerCase() === 'true';
    } else {
      config[item.key] = item.value;
    }
  });
  
  console.log('Config final:', config);
  cachedConfig = config;
  return config;
}
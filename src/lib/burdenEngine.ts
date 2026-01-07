// Deterministic Burden Engine
// Maps medicines to affected organs with predefined relationships
// This is purely educational and illustrative

export type OrganId = 
  | 'liver' 
  | 'kidney' 
  | 'heart' 
  | 'stomach' 
  | 'brain' 
  | 'lungs' 
  | 'pancreas' 
  | 'intestines';

export type BurdenLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface OrganBurden {
  organId: OrganId;
  level: BurdenLevel;
  medicineCount: number;
  medicines: string[];
}

export interface OrganInfo {
  id: OrganId;
  name: string;
  description: string;
}

// Organ metadata
export const organInfo: Record<OrganId, OrganInfo> = {
  liver: {
    id: 'liver',
    name: 'Liver',
    description: 'The liver processes and metabolizes many medications. Multiple hepatotoxic medicines may increase processing load.',
  },
  kidney: {
    id: 'kidney',
    name: 'Kidneys',
    description: 'The kidneys filter and excrete many medications. Nephrotoxic medicines may affect kidney function.',
  },
  heart: {
    id: 'heart',
    name: 'Heart',
    description: 'Some medications can affect heart rhythm and blood pressure. Cardioactive medicines require careful monitoring.',
  },
  stomach: {
    id: 'stomach',
    name: 'Stomach',
    description: 'Many oral medications can irritate the stomach lining. GI-active medicines may cause discomfort.',
  },
  brain: {
    id: 'brain',
    name: 'Brain',
    description: 'Neuroactive medications can affect cognitive function and mood. CNS-active medicines may cause drowsiness.',
  },
  lungs: {
    id: 'lungs',
    name: 'Lungs',
    description: 'Some medications can affect breathing and lung function. Pulmonary-active medicines require monitoring.',
  },
  pancreas: {
    id: 'pancreas',
    name: 'Pancreas',
    description: 'The pancreas regulates blood sugar and produces enzymes. Some medicines may affect pancreatic function.',
  },
  intestines: {
    id: 'intestines',
    name: 'Intestines',
    description: 'The intestines absorb medications and nutrients. Some medicines may affect gut motility and absorption.',
  },
};

// Medicine to organ mapping (educational purposes only)
// In a real application, this would be a comprehensive database
const medicineOrganMap: Record<string, OrganId[]> = {
  // Pain relievers
  paracetamol: ['liver'],
  acetaminophen: ['liver'],
  ibuprofen: ['kidney', 'stomach'],
  aspirin: ['stomach', 'kidney'],
  naproxen: ['kidney', 'stomach'],
  diclofenac: ['kidney', 'stomach', 'liver'],
  celecoxib: ['kidney', 'heart'],
  
  // Cardiovascular
  atorvastatin: ['liver'],
  simvastatin: ['liver'],
  rosuvastatin: ['liver'],
  lisinopril: ['kidney'],
  enalapril: ['kidney'],
  ramipril: ['kidney'],
  amlodipine: ['heart'],
  metoprolol: ['heart'],
  atenolol: ['heart'],
  propranolol: ['heart', 'brain'],
  furosemide: ['kidney'],
  hydrochlorothiazide: ['kidney'],
  spironolactone: ['kidney'],
  digoxin: ['heart', 'kidney'],
  warfarin: ['liver'],
  clopidogrel: ['stomach'],
  
  // Diabetes
  metformin: ['liver', 'kidney'],
  glipizide: ['pancreas', 'liver'],
  gliclazide: ['pancreas', 'liver'],
  sitagliptin: ['pancreas', 'kidney'],
  empagliflozin: ['kidney'],
  dapagliflozin: ['kidney'],
  insulin: ['pancreas'],
  
  // Antibiotics
  amoxicillin: ['liver', 'intestines'],
  azithromycin: ['liver'],
  ciprofloxacin: ['kidney', 'intestines'],
  levofloxacin: ['kidney'],
  metronidazole: ['liver', 'brain'],
  doxycycline: ['liver', 'stomach'],
  clarithromycin: ['liver'],
  gentamicin: ['kidney'],
  vancomycin: ['kidney'],
  
  // CNS medications
  sertraline: ['liver', 'brain'],
  fluoxetine: ['liver', 'brain'],
  escitalopram: ['liver', 'brain'],
  venlafaxine: ['liver', 'brain'],
  duloxetine: ['liver', 'brain'],
  amitriptyline: ['heart', 'brain'],
  gabapentin: ['kidney', 'brain'],
  pregabalin: ['kidney', 'brain'],
  diazepam: ['liver', 'brain'],
  alprazolam: ['liver', 'brain'],
  zolpidem: ['liver', 'brain'],
  quetiapine: ['liver', 'brain', 'heart'],
  risperidone: ['liver', 'brain'],
  olanzapine: ['liver', 'brain', 'pancreas'],
  lithium: ['kidney', 'brain'],
  valproate: ['liver', 'pancreas'],
  carbamazepine: ['liver', 'brain'],
  phenytoin: ['liver', 'brain'],
  levetiracetam: ['kidney', 'brain'],
  
  // GI medications
  omeprazole: ['liver', 'stomach'],
  pantoprazole: ['liver', 'stomach'],
  lansoprazole: ['liver', 'stomach'],
  esomeprazole: ['liver', 'stomach'],
  ranitidine: ['kidney', 'stomach'],
  famotidine: ['kidney', 'stomach'],
  ondansetron: ['liver'],
  metoclopramide: ['brain', 'stomach'],
  loperamide: ['intestines'],
  lactulose: ['intestines'],
  
  // Respiratory
  salbutamol: ['heart', 'lungs'],
  albuterol: ['heart', 'lungs'],
  budesonide: ['lungs'],
  fluticasone: ['lungs'],
  montelukast: ['liver', 'lungs'],
  theophylline: ['heart', 'liver', 'lungs'],
  
  // Immunosuppressants
  prednisone: ['liver', 'stomach', 'pancreas'],
  prednisolone: ['liver', 'stomach', 'pancreas'],
  dexamethasone: ['liver', 'stomach', 'pancreas'],
  methotrexate: ['liver', 'kidney', 'lungs'],
  azathioprine: ['liver'],
  cyclosporine: ['kidney', 'liver'],
  tacrolimus: ['kidney', 'liver'],
  
  // Others
  allopurinol: ['liver', 'kidney'],
  colchicine: ['liver', 'kidney', 'intestines'],
  levothyroxine: ['heart'],
  sildenafil: ['heart', 'liver'],
  tamsulosin: ['liver'],
  finasteride: ['liver'],
};

// Calculate burden level based on medicine count
function calculateBurdenLevel(count: number): BurdenLevel {
  if (count === 0) return 'none';
  if (count === 1) return 'low';
  if (count === 2) return 'medium';
  if (count === 3) return 'high';
  return 'critical';
}

// Get affected organs for a medicine
export function getAffectedOrgans(medicineId: string): OrganId[] {
  const normalized = medicineId.toLowerCase().trim();
  return medicineOrganMap[normalized] || [];
}

// Compute organ burdens from a list of medicines
export function computeOrganBurdens(medicineIds: string[]): OrganBurden[] {
  // Initialize all organs with zero burden
  const burdenMap: Record<OrganId, { count: number; medicines: string[] }> = {
    liver: { count: 0, medicines: [] },
    kidney: { count: 0, medicines: [] },
    heart: { count: 0, medicines: [] },
    stomach: { count: 0, medicines: [] },
    brain: { count: 0, medicines: [] },
    lungs: { count: 0, medicines: [] },
    pancreas: { count: 0, medicines: [] },
    intestines: { count: 0, medicines: [] },
  };

  // Process each medicine
  for (const medicineId of medicineIds) {
    const organs = getAffectedOrgans(medicineId);
    for (const organ of organs) {
      burdenMap[organ].count++;
      burdenMap[organ].medicines.push(medicineId);
    }
  }

  // Convert to array with burden levels
  return Object.entries(burdenMap).map(([organId, data]) => ({
    organId: organId as OrganId,
    level: calculateBurdenLevel(data.count),
    medicineCount: data.count,
    medicines: data.medicines,
  }));
}

// Check if a medicine is known
export function isMedicineKnown(medicineId: string): boolean {
  const normalized = medicineId.toLowerCase().trim();
  return normalized in medicineOrganMap;
}

// Get all known medicines (for reference)
export function getAllKnownMedicines(): string[] {
  return Object.keys(medicineOrganMap).sort();
}

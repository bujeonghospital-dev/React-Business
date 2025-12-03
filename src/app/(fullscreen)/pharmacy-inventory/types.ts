// Pharmacy Inventory System - Type Definitions
// Open Source Hospital Pharmacy Management for Physicians

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  category: MedicationCategory;
  form: MedicationForm;
  strength: string;
  unit: string;
  batchNumber: string;
  lotNumber: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  expirationDate: string;
  manufacturer: string;
  supplier: string;
  unitPrice: number;
  location: string;
  barcode: string;
  ndcCode: string;
  controlledSubstance: boolean;
  scheduleClass?: ControlledSchedule;
  requiresRefrigeration: boolean;
  storageConditions: string;
  contraindications: string[];
  sideEffects: string[];
  interactions: string[];
  lastRestocked: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicationCategory =
  | "Analgesics"
  | "Antibiotics"
  | "Antivirals"
  | "Cardiovascular"
  | "Diabetes"
  | "Gastrointestinal"
  | "Respiratory"
  | "Neurological"
  | "Psychiatric"
  | "Dermatological"
  | "Oncology"
  | "Immunosuppressants"
  | "Hormones"
  | "Vitamins"
  | "Supplements"
  | "Emergency"
  | "Anesthetics"
  | "Other";

export type MedicationForm =
  | "Tablet"
  | "Capsule"
  | "Liquid"
  | "Injection"
  | "Topical"
  | "Inhaler"
  | "Patch"
  | "Suppository"
  | "Drops"
  | "Powder"
  | "Suspension"
  | "Cream"
  | "Gel"
  | "Ointment"
  | "Solution"
  | "Syrup";

export type ControlledSchedule = "I" | "II" | "III" | "IV" | "V";

export type StockStatus =
  | "In Stock"
  | "Low Stock"
  | "Critical"
  | "Out of Stock"
  | "Expired"
  | "Expiring Soon";

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  allergies: string[];
  currentMedications: string[];
  medicalConditions: string[];
  weight?: number;
  height?: number;
  bloodType?: string;
  contactNumber: string;
  email?: string;
  insuranceProvider?: string;
  insuranceId?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  physicianId: string;
  physicianName: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  refillsRemaining: number;
  instructions: string;
  status: PrescriptionStatus;
  prescribedDate: string;
  dispensedDate?: string;
  dispensedBy?: string;
  notes?: string;
  priority: "Routine" | "Urgent" | "STAT";
}

export type PrescriptionStatus =
  | "Pending"
  | "Verified"
  | "Dispensed"
  | "Cancelled"
  | "On Hold"
  | "Partially Filled";

export interface DispenseRecord {
  id: string;
  prescriptionId: string;
  medicationId: string;
  medicationName: string;
  patientId: string;
  patientName: string;
  quantity: number;
  batchNumber: string;
  lotNumber: string;
  dispensedBy: string;
  dispensedDate: string;
  verifiedBy?: string;
  notes?: string;
}

export interface StockAlert {
  id: string;
  medicationId: string;
  medicationName: string;
  alertType:
    | "Low Stock"
    | "Critical Stock"
    | "Expiring"
    | "Expired"
    | "Reorder";
  severity: "Low" | "Medium" | "High" | "Critical";
  currentQuantity: number;
  threshold: number;
  expirationDate?: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface InventoryTransaction {
  id: string;
  medicationId: string;
  medicationName: string;
  transactionType:
    | "Received"
    | "Dispensed"
    | "Adjusted"
    | "Returned"
    | "Expired"
    | "Transferred";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  batchNumber: string;
  reason?: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

export interface Physician {
  id: string;
  name: string;
  specialization: string;
  licenseNumber: string;
  department: string;
  email: string;
  phone: string;
  deaNumber?: string; // For controlled substances
}

export interface DashboardStats {
  totalMedications: number;
  lowStockItems: number;
  criticalStockItems: number;
  expiringItems: number;
  expiredItems: number;
  pendingPrescriptions: number;
  dispensedToday: number;
  totalValue: number;
}

export interface FilterOptions {
  category: MedicationCategory | "All";
  stockStatus: StockStatus | "All";
  form: MedicationForm | "All";
  expirationRange: "All" | "7days" | "30days" | "90days" | "Expired";
  controlledOnly: boolean;
  searchQuery: string;
}

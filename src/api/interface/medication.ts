export enum MedicationCategory {
    Unknown = 0,
    Prescription = 1,
    OTC = 2,
    Traditional = 3,
    HealthCare = 4
}

export enum MedicationStatus {
    Disable = 0,
    Enable = 1
}

export interface Medication {
    id: number;
    name: string;
    description: string | null;
    price: number;
    amount: number;
    category: MedicationCategory;
    status: MedicationStatus;
    update_date: Date;
}

export interface SearchMedicationDto {
    pageNum: number;
    pageSize: number;
    searchValue?: string;
    category?: MedicationCategory;
    status?: MedicationStatus;
    startDate?: Date;
    endDate?: Date;
}

export interface CreateMedicationDto {
    name: string;
    description?: string;
    price: number;
    amount: number;
    category: MedicationCategory;
    status: MedicationStatus;
}

export interface UpdateMedicationDto extends Partial<CreateMedicationDto> { } 
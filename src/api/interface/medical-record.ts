export interface MedicalRecord {
    id: number;
    chief_complaint: string;
    present_illness: string;
    past_history: string;
    physical_exam: string;
    diagnosis: string;
    treatment_plan: string;
    note: string;
    status: number;
    create_date: string;
    update_date: string;
}
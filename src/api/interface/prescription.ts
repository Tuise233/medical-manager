export interface Prescription {
    id: number;
    type: number;
    description: string;
    frequency: string;
    dosage: string;
    duration: number;
    note: string;
    status: number;
    create_date: string;
    update_date: string;
    doctor: {
        id: number;
        real_name: string;
    };
}
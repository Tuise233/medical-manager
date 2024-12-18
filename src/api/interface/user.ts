export enum UserRole {
    User = 0,
    Doctor = 1,
    Admin = 2
}

export enum UserStatus {
    Active = 0,
    Banned = 1,
    Pending = 2
}

export enum Gender {
    Female = 0,
    Male = 1
}

export enum BloodType {
    A = 0,
    B = 1,
    AB = 2,
    O = 3
}

export enum AlcoholConsumption {
    None = 0,
    Occasional = 1,
    Regular = 2
}

export interface BasicInfo {
    address: string;
    birth_date: Date | string | undefined;
    gender: Gender;
    emergency_contact: string;
    emergency_contact_phone: string;
}

export interface HealthInfo {
    height: number | undefined;
    weight: number | undefined;
    blood_type: BloodType;
    blood_pressure: string;
    allergies: string;
    chronic_conditions: string;
    medical_history: string;
    current_medications: string;
    alcohol_consumption: AlcoholConsumption;
    heart_rate: number | undefined;
    body_temperature: number | undefined;
}

export interface User {
    id: number;
    username: string;
    realName: string;
    email: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    createDate: Date;
    basicInfo: BasicInfo;
    healthInfo: HealthInfo;
}
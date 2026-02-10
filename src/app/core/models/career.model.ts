
export interface CareerEvent {
    roll: number;
    description: string;
    effect?: (char: any) => void; // Placeholder for effect logic
    label?: string; // Short description/title
}

export interface CareerMishap {
    roll: number;
    description: string;
    // Mishaps usually enforce forcing out of career
}

export interface Rank {
    level: number;
    title: string;
    bonus?: string; // Text description of bonus
}

export interface Assignment {
    name: string;
    survivalStat: string;
    survivalTarget: number;
    advancementStat: string;
    advancementTarget: number;
    skillTable: string[]; // List of skills available
    ranks: Rank[];
}

export interface CareerDefinition {
    name: string;
    description: string;
    qualificationStat: string;
    qualificationTarget: number;
    eventTable: CareerEvent[];
    mishapTable: CareerMishap[];
    assignments: Assignment[];
    personalSkills: string[];
    serviceSkills: string[];
    advancedEducation: string[]; // Req EDU 8+
    officerSkills?: string[]; // Only for commissioned
    musteringOutCash: number[]; // d6 table
    musteringOutBenefits: string[]; // d6 table
}

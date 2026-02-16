import { LifeEvent, InjuryResult, MedicalBillsEntry } from '../core/models/career.model';
import * as Shared from './events/shared/life-events';

export const LIFE_EVENTS: LifeEvent[] = Shared.LIFE_EVENT_TABLE as any as LifeEvent[];
export const INJURY_TABLE: InjuryResult[] = Shared.INJURY_TABLE as any as InjuryResult[];
export const MEDICAL_BILLS: MedicalBillsEntry[] = Shared.MEDICAL_BILLS as any as MedicalBillsEntry[];
export const MEDICAL_COSTS = Shared.MEDICAL_COSTS;

export const getCareerMedicalCategory = Shared.getCareerMedicalCategory;
export const getMedicalCoverage = Shared.getMedicalCoverage;
export const calculateRepairCost = Shared.calculateRepairCost;
export const calculateMedicalDebt = Shared.calculateMedicalDebt;

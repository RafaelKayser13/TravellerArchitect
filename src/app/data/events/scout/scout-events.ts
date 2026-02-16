import { CareerEvent } from '../../../core/models/career.model';
import tables from '../../../../assets/data/tables.json';

export const SCOUT_EVENT_TABLE: CareerEvent[] = (tables.scoutEventTable as any) as CareerEvent[];

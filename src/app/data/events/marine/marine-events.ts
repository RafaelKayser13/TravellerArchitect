import { CareerEvent } from '../../../core/models/career.model';
import tableData from '../../../../assets/data/tables.json';

// Cast to any to assume structural compatibility
const rawData: any[] = tableData.marineEventTable;

export const MARINE_EVENT_TABLE: CareerEvent[] = rawData as CareerEvent[];

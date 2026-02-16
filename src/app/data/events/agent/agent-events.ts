import { CareerEvent } from '../../../core/models/career.model';
import tableData from '../../../../assets/data/tables.json';

const rawData: any[] = tableData.agentEventTable;

export const AGENT_EVENT_TABLE: CareerEvent[] = rawData as CareerEvent[];

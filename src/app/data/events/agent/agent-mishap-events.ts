import { CareerMishap } from '../../../core/models/career.model';
import tableData from '../../../../assets/data/tables.json';

const rawData: any[] = tableData.agentMishapTable;

export const AGENT_MISHAP_TABLE: CareerMishap[] = rawData as CareerMishap[];

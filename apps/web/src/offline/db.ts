import Dexie, { type Table } from 'dexie';

export interface SyncOperation {
  id?: number;
  operation_id: string;
  device_id: string;
  entity_type: string;
  entity_id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPSERT';
  base_version: number;
  client_timestamp: string;
  idempotency_key: string;
  payload: any;
  sync_status: 'PENDING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
  retry_count: number;
}

export interface CachedStudent {
  id: string;
  tenant_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  class_name: string;
  section: string;
  cached_at: string;
}

export interface DraftAttendance {
  id?: number;
  tenant_id: string;
  session_date: string;
  class_id: string;
  student_id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
  recorded_by: string;
  is_synced: boolean;
}

export class OfflineERPDatabase extends Dexie {
  sync_queue!: Table<SyncOperation, number>;
  students!: Table<CachedStudent, string>;
  attendance_drafts!: Table<DraftAttendance, number>;

  constructor() {
    super('EducationERPOfflineDB');
    this.version(1).stores({
      sync_queue: '++id, operation_id, entity_type, sync_status, idempotency_key',
      students: 'id, tenant_id, admission_number, class_name',
      attendance_drafts: '++id, session_date, class_id, student_id, is_synced',
    });
  }
}

export const offlineDb = new OfflineERPDatabase();

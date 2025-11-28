export interface Visit {
  record_no?: number;
  vn: string;
  cn: string;
  doctor_code?: string;
  doctor_name?: string;
  start_date?: string | null;
  end_date?: string | null;
  doc_type?: string;
  display_name?: string;
  cc?: string; // chief complaint / activity
  note_result?: string;
  status?: string;
  created_at?: string | null;
  updated_at?: string | null;
}

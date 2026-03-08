export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          legal_name: string;
          trade_name: string;
          gstin: string | null;
          pan: string | null;
          pf_registration_number: string | null;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          legal_name: string;
          trade_name: string;
          gstin?: string | null;
          pan?: string | null;
          pf_registration_number?: string | null;
          address: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          full_name: string;
          email: string;
          role: "admin" | "finance_operator" | "payroll_operator" | "ca_readonly";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          full_name: string;
          email: string;
          role?: "admin" | "finance_operator" | "payroll_operator" | "ca_readonly";
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      bank_accounts: {
        Row: {
          id: string;
          company_id: string;
          bank_name: string;
          account_name: string;
          account_number_masked: string;
          ifsc: string;
          currency_code: string;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          bank_name: string;
          account_name: string;
          account_number_masked: string;
          ifsc: string;
          currency_code?: string;
          is_primary?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["bank_accounts"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          code: string;
          type: "income" | "expense" | "payroll" | "transfer";
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          code: string;
          type: "income" | "expense" | "payroll" | "transfer";
          description?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      bank_imports: {
        Row: {
          id: string;
          company_id: string;
          bank_account_id: string;
          source_filename: string;
          storage_path: string;
          imported_by: string;
          import_month: string;
          row_count: number;
          deduplicated_count: number;
          period_start: string;
          period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          bank_account_id: string;
          source_filename: string;
          storage_path: string;
          imported_by: string;
          import_month: string;
          row_count: number;
          deduplicated_count: number;
          period_start: string;
          period_end: string;
        };
        Update: Partial<Database["public"]["Tables"]["bank_imports"]["Insert"]>;
      };
      bank_transactions: {
        Row: {
          id: string;
          company_id: string;
          bank_account_id: string;
          bank_import_id: string;
          posted_at: string;
          narration: string;
          normalized_narration: string;
          reference_number: string;
          direction: "credit" | "debit";
          amount: number;
          balance: number;
          counterparty_name: string | null;
          transaction_type: "intercompany_funding" | "salary" | "freelancer_payment" | "office_expense" | "reimbursement" | "bank_charge" | "invoice_receipt" | "other";
          category_id: string | null;
          gst_flag: boolean;
          tds_flag: boolean;
          review_status: "unreviewed" | "reviewed" | "matched";
          notes: string | null;
          internal_memo: string | null;
          employee_id: string | null;
          vendor_id: string | null;
          invoice_id: string | null;
          duplicate_fingerprint: string;
          split_parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          bank_account_id: string;
          bank_import_id: string;
          posted_at: string;
          narration: string;
          normalized_narration: string;
          reference_number: string;
          direction: "credit" | "debit";
          amount: number;
          balance: number;
          counterparty_name?: string | null;
          transaction_type?: Database["public"]["Tables"]["bank_transactions"]["Row"]["transaction_type"];
          category_id?: string | null;
          gst_flag?: boolean;
          tds_flag?: boolean;
          review_status?: "unreviewed" | "reviewed" | "matched";
          notes?: string | null;
          internal_memo?: string | null;
          employee_id?: string | null;
          vendor_id?: string | null;
          invoice_id?: string | null;
          duplicate_fingerprint: string;
          split_parent_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bank_transactions"]["Insert"]>;
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          employee_code: string;
          full_name: string;
          email: string;
          phone: string | null;
          designation: string;
          department: string;
          location: string;
          join_date: string;
          leave_date: string | null;
          pan: string;
          uan: string | null;
          pf_eligible: boolean;
          bank_account_name: string;
          bank_account_number_masked: string;
          bank_ifsc: string;
          status: "active" | "inactive";
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          employee_code: string;
          full_name: string;
          email: string;
          phone?: string | null;
          designation: string;
          department: string;
          location: string;
          join_date: string;
          leave_date?: string | null;
          pan: string;
          uan?: string | null;
          pf_eligible?: boolean;
          bank_account_name: string;
          bank_account_number_masked: string;
          bank_ifsc: string;
          status?: "active" | "inactive";
        };
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
      };
      salary_structures: {
        Row: {
          id: string;
          company_id: string;
          employee_id: string;
          effective_date: string;
          monthly_basic: number;
          hra: number;
          special_allowance: number;
          fixed_allowance: number;
          other_fixed_earnings: number;
          employee_pf_enabled: boolean;
          employer_pf_enabled: boolean;
          professional_tax_enabled: boolean;
          tds_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          employee_id: string;
          effective_date: string;
          monthly_basic: number;
          hra: number;
          special_allowance: number;
          fixed_allowance: number;
          other_fixed_earnings: number;
          employee_pf_enabled?: boolean;
          employer_pf_enabled?: boolean;
          professional_tax_enabled?: boolean;
          tds_enabled?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["salary_structures"]["Insert"]>;
      };
      payroll_runs: {
        Row: {
          id: string;
          company_id: string;
          payroll_month: string;
          status: "draft" | "reviewed" | "approved" | "locked";
          total_employees: number;
          total_gross: number;
          total_net: number;
          total_employer_cost: number;
          reviewed_at: string | null;
          reviewed_by: string | null;
          approved_at: string | null;
          approved_by: string | null;
          locked_at: string | null;
          locked_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          payroll_month: string;
          status?: "draft" | "reviewed" | "approved" | "locked";
          total_employees?: number;
          total_gross?: number;
          total_net?: number;
          total_employer_cost?: number;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          locked_at?: string | null;
          locked_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payroll_runs"]["Insert"]>;
      };
      payroll_adjustments: {
        Row: {
          id: string;
          company_id: string;
          employee_id: string;
          payroll_month: string;
          kind: "bonus" | "reimbursement" | "advance_recovery" | "manual_deduction" | "incentive";
          label: string;
          amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          employee_id: string;
          payroll_month: string;
          kind: Database["public"]["Tables"]["payroll_adjustments"]["Row"]["kind"];
          label: string;
          amount: number;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payroll_adjustments"]["Insert"]>;
      };
      payroll_items: {
        Row: {
          id: string;
          company_id: string;
          payroll_run_id: string;
          employee_id: string;
          payroll_month: string;
          paid_days: number;
          lop_days: number;
          gross_pay: number;
          employee_pf: number;
          employer_pf: number;
          professional_tax: number;
          tds: number;
          other_deductions: number;
          reimbursements: number;
          net_pay: number;
          calc_snapshot: Json;
          payslip_document_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          payroll_run_id: string;
          employee_id: string;
          payroll_month: string;
          paid_days: number;
          lop_days: number;
          gross_pay: number;
          employee_pf: number;
          employer_pf: number;
          professional_tax: number;
          tds: number;
          other_deductions: number;
          reimbursements: number;
          net_pay: number;
          calc_snapshot: Json;
          payslip_document_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["payroll_items"]["Insert"]>;
      };
      vendors: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          kind: "vendor" | "freelancer";
          email: string | null;
          phone: string | null;
          gstin: string | null;
          pan: string | null;
          default_category_id: string | null;
          tds_applicable: boolean;
          active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          kind: "vendor" | "freelancer";
          email?: string | null;
          phone?: string | null;
          gstin?: string | null;
          pan?: string | null;
          default_category_id?: string | null;
          tds_applicable?: boolean;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["vendors"]["Insert"]>;
      };
      invoices: {
        Row: {
          id: string;
          company_id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          customer_name: string;
          customer_address: string;
          gstin: string | null;
          notes: string | null;
          subtotal: number;
          tax_total: number;
          grand_total: number;
          status: "draft" | "sent" | "paid";
          pdf_document_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          invoice_number: string;
          issue_date: string;
          due_date: string;
          customer_name: string;
          customer_address: string;
          gstin?: string | null;
          notes?: string | null;
          subtotal: number;
          tax_total: number;
          grand_total: number;
          status?: "draft" | "sent" | "paid";
          pdf_document_id?: string | null;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      invoice_line_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          rate: number;
          tax_percent: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity: number;
          rate: number;
          tax_percent: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_line_items"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          company_id: string;
          document_kind: "statement" | "invoice" | "expense_proof" | "payslip" | "other";
          file_name: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          linked_entity: string;
          linked_id: string;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          document_kind: "statement" | "invoice" | "expense_proof" | "payslip" | "other";
          file_name: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          linked_entity: string;
          linked_id: string;
          uploaded_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          company_id: string;
          actor_profile_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          diff_summary: string | null;
          diff: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          actor_profile_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          diff_summary?: string | null;
          diff?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
      saved_rules: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          narration_pattern: string;
          transaction_type: Database["public"]["Tables"]["bank_transactions"]["Row"]["transaction_type"];
          category_id: string | null;
          gst_flag: boolean;
          tds_flag: boolean;
          linked_employee_id: string | null;
          linked_vendor_id: string | null;
          priority: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          narration_pattern: string;
          transaction_type: Database["public"]["Tables"]["bank_transactions"]["Row"]["transaction_type"];
          category_id?: string | null;
          gst_flag?: boolean;
          tds_flag?: boolean;
          linked_employee_id?: string | null;
          linked_vendor_id?: string | null;
          priority?: number;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["saved_rules"]["Insert"]>;
      };
      settings: {
        Row: {
          id: string;
          company_id: string;
          key: string;
          value: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          key: string;
          value: Json;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
      };
    };
  };
}

import Papa from "papaparse";
import { parse } from "date-fns";
import type { TransactionType } from "@/lib/types/domain";
import { monthKeyFromDate, toAmount } from "@/lib/utils";

export interface ColumnMapping {
  dateColumn: string;
  narrationColumn: string;
  referenceColumn: string;
  creditColumn?: string;
  debitColumn?: string;
  amountColumn?: string;
  balanceColumn?: string;
}

export interface ParsedBankTransaction {
  postedAt: string;
  narration: string;
  normalizedNarration: string;
  referenceNumber: string;
  direction: "credit" | "debit";
  amount: number;
  balance: number;
  type: TransactionType;
  duplicateKey: string;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseDateValue(value: string) {
  const supportedFormats = ["dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd", "dd-MM-yyyy"];
  for (const format of supportedFormats) {
    const parsed = parse(value, format, new Date());
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }
  throw new Error(`Unsupported date format: ${value}`);
}

function parseNumber(value?: string) {
  if (!value) return 0;
  const normalized = value.replace(/,/g, "").trim();
  return normalized ? Number(normalized) : 0;
}

function inferType(narration: string): TransactionType {
  const text = normalizeText(narration);
  if (text.includes("salary")) return "salary";
  if (text.includes("canada") || text.includes("wire")) return "intercompany_funding";
  if (text.includes("invoice") || text.includes("receipt")) return "invoice_receipt";
  if (text.includes("charge") || text.includes("gst") || text.includes("fee")) return "bank_charge";
  return "other";
}

export function parseBankStatement(csv: string, mapping: ColumnMapping) {
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: true });
  const dedupe = new Map<string, ParsedBankTransaction>();

  for (const row of parsed.data) {
    const postedAt = parseDateValue(row[mapping.dateColumn] ?? "");
    const narration = row[mapping.narrationColumn]?.trim() ?? "";
    const normalizedNarration = normalizeText(narration);
    const referenceNumber = row[mapping.referenceColumn]?.trim() ?? "";
    const credit = parseNumber(mapping.creditColumn ? row[mapping.creditColumn] : undefined);
    const debit = parseNumber(mapping.debitColumn ? row[mapping.debitColumn] : undefined);
    const amount = mapping.amountColumn ? parseNumber(row[mapping.amountColumn]) : credit || debit;
    const direction = credit > 0 || (mapping.amountColumn && amount > 0) ? "credit" : "debit";
    const balance = parseNumber(mapping.balanceColumn ? row[mapping.balanceColumn] : undefined);
    const signedAmount = direction === "credit" ? Math.abs(amount) : Math.abs(amount || debit);
    const duplicateKey = `${postedAt}:${referenceNumber}:${signedAmount}:${normalizedNarration}`;

    if (!dedupe.has(duplicateKey)) {
      dedupe.set(duplicateKey, {
        postedAt,
        narration,
        normalizedNarration,
        referenceNumber,
        direction,
        amount: toAmount(signedAmount),
        balance: toAmount(balance),
        type: inferType(narration),
        duplicateKey,
      });
    }
  }

  const transactions = [...dedupe.values()];
  const months = [...new Set(transactions.map((item) => monthKeyFromDate(item.postedAt)))];

  return {
    transactions,
    summary: {
      rowCount: parsed.data.length,
      importedCount: transactions.length,
      duplicateCount: parsed.data.length - transactions.length,
      months,
    },
  };
}

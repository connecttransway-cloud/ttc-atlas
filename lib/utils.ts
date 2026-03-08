import { type ClassValue, clsx } from "clsx";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatMonth(value: string) {
  return format(parseISO(`${value}-01`), "MMMM yyyy");
}

export function formatDate(value: string | Date, pattern = "dd MMM yyyy") {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, pattern);
}

export function timeAgo(value: string) {
  return formatDistanceToNowStrict(parseISO(value), { addSuffix: true });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function toAmount(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function monthKeyFromDate(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "yyyy-MM");
}

export function downloadName(prefix: string, month: string, extension: string) {
  return `${slugify(prefix)}-${month}.${extension}`;
}

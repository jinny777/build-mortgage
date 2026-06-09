import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000);
    const man = Math.floor((amount % 100000000) / 10000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만원`;
  }
  return `${amount.toLocaleString()}원`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatMonthly(amount: number): string {
  return `월 ${formatCurrency(amount)}`;
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function calculateLTV(loanAmount: number, propertyPrice: number): number {
  return (loanAmount / propertyPrice) * 100;
}

export function calculateDTI(
  annualLoanPayment: number,
  annualIncome: number
): number {
  return (annualLoanPayment / annualIncome) * 100;
}

export function calculateDSR(
  totalAnnualDebtPayment: number,
  annualIncome: number
): number {
  return (totalAnnualDebtPayment / annualIncome) * 100;
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number,
  method: 'equal-principal-interest' | 'equal-principal' | 'bullet'
): number {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;

  if (method === 'bullet') {
    return principal * monthlyRate;
  }

  if (method === 'equal-principal') {
    const principalPayment = principal / months;
    return principalPayment + principal * monthlyRate;
  }

  // 원리금균등
  if (monthlyRate === 0) return principal / months;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

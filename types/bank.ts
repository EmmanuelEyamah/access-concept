import type { BrandKey, PersonKey } from "@/constants/assets";

export type Phase = "splash" | "onboarding" | "login" | "app";

export type TxKind = "in" | "out";
export type TxCategory = "transfer" | "bills" | "card" | "airtime" | "income";

export interface Transaction {
  id: string;
  title: string;
  note: string;
  amount: number;
  kind: TxKind;
  category: TxCategory;
  /** A company's logo, or a person's photo: one of the two identifies the row. */
  brand?: BrandKey;
  person?: PersonKey;
  /** Days before today. */
  daysAgo: number;
  time: string;
}

export interface Recipient {
  id: string;
  name: string;
  bank: string;
  brand: BrandKey;
  /** Saved beneficiaries have a photo; someone typed in for the first time does not. */
  person?: PersonKey;
  account: string;
}

export interface TransferDraft {
  recipient: Recipient | null;
  amount: number;
  note: string;
}

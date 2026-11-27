import { create } from "zustand";
import { OPENING_BALANCE, TRANSACTIONS, TRANSFER_FEE } from "@/constants/data";
import type { Phase, Recipient, Transaction, TransferDraft } from "@/types/bank";

interface BankStore {
  phase: Phase;
  balance: number;
  hidden: boolean;
  transactions: Transaction[];
  draft: TransferDraft;
  /** Autopilot cue: bumping it makes the send slider complete by itself. */
  autoSend: number;
  /** Autopilot cue: bumping it opens the services sheet on the home screen. */
  autoServices: number;
  /** Autopilot cues for the card flip and the history filter sheet. */
  autoFlip: number;
  autoFilter: number;
  setPhase: (phase: Phase) => void;
  toggleHidden: () => void;
  setRecipient: (recipient: Recipient) => void;
  setAmount: (amount: number) => void;
  /** Moves the money: the balance drops and the transfer appears at the top of the list. */
  commit: () => void;
  resetDraft: () => void;
  cueSend: () => void;
  cueServices: () => void;
  cue: (name: "autoFlip" | "autoFilter") => void;
}

const EMPTY: TransferDraft = { recipient: null, amount: 0, note: "" };

export const useBankStore = create<BankStore>()((set) => ({
  phase: "splash",
  balance: OPENING_BALANCE,
  hidden: false,
  transactions: TRANSACTIONS,
  draft: EMPTY,
  autoSend: 0,
  autoServices: 0,
  autoFlip: 0,
  autoFilter: 0,
  setPhase: (phase) => set({ phase }),
  toggleHidden: () => set((s) => ({ hidden: !s.hidden })),
  setRecipient: (recipient) => set((s) => ({ draft: { ...s.draft, recipient } })),
  setAmount: (amount) => set((s) => ({ draft: { ...s.draft, amount } })),
  commit: () =>
    set((s) => {
      if (!s.draft.recipient) return s;
      const sent: Transaction = { id: `sent-${Date.now()}`, title: s.draft.recipient.name, note: "You sent money", amount: s.draft.amount, kind: "out", category: "transfer", person: s.draft.recipient.person, daysAgo: 0, time: "Now" };
      return { balance: s.balance - s.draft.amount - TRANSFER_FEE, transactions: [sent, ...s.transactions] };
    }),
  resetDraft: () => set({ draft: EMPTY }),
  cueSend: () => set((s) => ({ autoSend: s.autoSend + 1 })),
  cueServices: () => set((s) => ({ autoServices: s.autoServices + 1 })),
  cue: (name) => set((s) => ({ [name]: s[name] + 1 }) as Pick<BankStore, typeof name>),
}));

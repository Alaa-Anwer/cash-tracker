import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Transaction } from "@/types"

interface TransactionState {
  transactions: Transaction[]
  addTransaction: (
    tx: Omit<Transaction, "id" | "balanceAfter" | "createdAt">,
    balanceAfter: number
  ) => Transaction
  updateTransaction: (id: string, data: Partial<Omit<Transaction, "id" | "createdAt">>) => void
  removeTransaction: (id: string) => void
  clearTransactions: () => void
  setTransactions: (txs: Transaction[]) => void
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (tx, balanceAfter) => {
        const newTx: Transaction = {
          ...tx,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          balanceAfter,
        }
        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }))
        return newTx
      },
      updateTransaction: (id, data) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data, createdAt: t.createdAt } : t
          ),
        }))
      },
      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }))
      },
      clearTransactions: () => {
        set({ transactions: [] })
      },
      setTransactions: (txs) => {
        set({ transactions: txs })
      },
    }),
    { name: "cash-tracker-transactions" }
  )
)

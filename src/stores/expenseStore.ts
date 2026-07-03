import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Expense } from "@/types"

interface ExpenseState {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Expense
  removeExpense: (id: string) => void
  updateExpense: (id: string, data: Partial<Omit<Expense, "id" | "createdAt">>) => void
  getTotalExpenses: () => number
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      addExpense: (expense) => {
        const newExpense: Expense = {
          ...expense,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }))
        return newExpense
      },
      removeExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }))
      },
      updateExpense: (id, data) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...data, createdAt: e.createdAt } : e
          ),
        }))
      },
      getTotalExpenses: () => {
        return get().expenses.reduce((sum, e) => sum + e.amount, 0)
      },
    }),
    { name: "cash-tracker-expenses" }
  )
)

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Income } from "@/types"

interface IncomeState {
  incomes: Income[]
  addIncome: (income: Omit<Income, "id" | "createdAt">) => Income
  removeIncome: (id: string) => void
  updateIncome: (id: string, data: Partial<Omit<Income, "id" | "createdAt">>) => void
  getTotalIncome: () => number
}

export const useIncomeStore = create<IncomeState>()(
  persist(
    (set, get) => ({
      incomes: [],
      addIncome: (income) => {
        const newIncome: Income = {
          ...income,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          incomes: [...state.incomes, newIncome],
        }))
        return newIncome
      },
      removeIncome: (id) => {
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        }))
      },
      updateIncome: (id, data) => {
        set((state) => ({
          incomes: state.incomes.map((i) =>
            i.id === id ? { ...i, ...data, createdAt: i.createdAt } : i
          ),
        }))
      },
      getTotalIncome: () => {
        return get().incomes.reduce((sum, i) => sum + i.amount, 0)
      },
    }),
    { name: "cash-tracker-income" }
  )
)

import { z } from "zod"

export interface Income {
  id: string
  title: string
  amount: number
  createdAt: string
  note?: string
}

export interface Expense {
  id: string
  title: string
  amount: number
  category: string
  createdAt: string
  note?: string
}

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  createdAt: string
  category?: string
  note?: string
  sourceId: string
  balanceAfter: number
}

export type Theme = "light" | "dark"
export type Language = "en" | "ar"

export const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "shopping",
  "bills",
  "entertainment",
  "other",
] as const

export const EXPENSE_OPTIONS = [
  "Food",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Coffee",
  "Tea",
  "Snacks",
  "Water",
  "Transportation",
  "Uber",
  "Taxi",
  "Bus",
  "Metro",
  "Fuel",
  "Shopping",
  "Clothes",
  "Shoes",
  "Electronics",
  "Groceries",
  "Rent",
  "Electricity",
  "Water Bill",
  "Internet",
  "Mobile Recharge",
  "Healthcare",
  "Medicine",
  "Doctor",
  "Gym",
  "Entertainment",
  "Cinema",
  "Games",
  "Subscription",
  "Education",
  "Course",
  "Books",
  "Gifts",
  "Family",
  "Friends",
  "Travel",
  "Hotel",
  "Maintenance",
  "Car Service",
  "Parking",
  "Other",
] as const

export const incomeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  note: z.string().optional(),
})

export const expenseSchema = z
  .object({
    selectedOption: z.string().optional(),
    customTitle: z.string().optional(),
    amount: z.coerce.number().positive("Amount must be positive"),
    category: z.string().min(1, "Category is required"),
    note: z.string().optional(),
  })
  .refine((data) => data.selectedOption || data.customTitle, {
    message: "Please select or enter an expense description",
    path: ["selectedOption"],
  })

export type IncomeFormData = z.infer<typeof incomeSchema>
export type ExpenseFormData = z.infer<typeof expenseSchema>

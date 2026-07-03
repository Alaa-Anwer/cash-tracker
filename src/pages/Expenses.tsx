import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "@/stores/settingsStore"
import { useIncomeStore } from "@/stores/incomeStore"
import { useExpenseStore } from "@/stores/expenseStore"
import { useTransactionStore } from "@/stores/transactionStore"
import { expenseSchema, EXPENSE_OPTIONS, EXPENSE_CATEGORIES, type ExpenseFormData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export function Expenses() {
  const { t } = useTranslation()
  const lang = useSettingsStore((s) => s.language)
  const totalIncome = useIncomeStore((s) => s.getTotalIncome())
  const totalExpenses = useExpenseStore((s) => s.getTotalExpenses())
  const { expenses, addExpense, removeExpense, updateExpense } = useExpenseStore()
  const { addTransaction, updateTransaction, removeTransaction, transactions } = useTransactionStore()

  const [editingId, setEditingId] = useState<string | null>(null)

  const balance = totalIncome - totalExpenses

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { selectedOption: "", customTitle: "", amount: 0, category: "", note: "" },
  })

  const onSubmit = (data: ExpenseFormData) => {
    const amount = Number(data.amount)
    if (amount > balance && !editingId) {
      return
    }
    const title = data.selectedOption || data.customTitle || ""

    if (editingId) {
      const oldExpense = expenses.find((e) => e.id === editingId)
      if (!oldExpense) return
      updateExpense(editingId, { title, amount, category: data.category, note: data.note })
      const diff = amount - oldExpense.amount
      const tx = transactions.find((t) => t.sourceId === editingId)
      if (tx) {
        updateTransaction(tx.id, { amount, description: title, note: data.note, category: data.category })
        const idx = transactions.indexOf(tx)
        let runningBalance = tx.balanceAfter - diff
        for (let j = idx + 1; j < transactions.length; j++) {
          const next = transactions[j]
          runningBalance += next.type === "income" ? next.amount : -next.amount
          updateTransaction(next.id, { balanceAfter: runningBalance })
        }
      }
      setEditingId(null)
    } else {
      const currentTotalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
      const expense = addExpense({ title, amount, category: data.category, note: data.note })
      const balanceAfter = totalIncome - (currentTotalExpenses + amount)
      addTransaction(
        {
          type: "expense",
          amount,
          description: title,
          note: data.note,
          category: data.category,
          sourceId: expense.id,
        },
        balanceAfter
      )
    }
    form.reset({ selectedOption: "", customTitle: "", amount: 0, category: "", note: "" })
  }

  const startEdit = (id: string) => {
    const expense = expenses.find((e) => e.id === id)
    if (!expense) return
    setEditingId(id)
    const isOption = EXPENSE_OPTIONS.includes(expense.title as typeof EXPENSE_OPTIONS[number])
    form.reset({
      selectedOption: isOption ? expense.title : "",
      customTitle: isOption ? "" : expense.title,
      amount: expense.amount,
      category: expense.category,
      note: expense.note,
    })
  }

  const handleDelete = (id: string) => {
    removeExpense(id)
    const tx = transactions.find((t) => t.sourceId === id)
    if (tx) removeTransaction(tx.id)
  }

  const selectedOption = form.watch("selectedOption")
  const customTitle = form.watch("customTitle")

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{t("expense.availableBalance")}</p>
          <p className={`text-xl font-semibold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
            {balance.toLocaleString()} {t("common.egp")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("expense.newExpense")}</h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>{t("expense.fields.selectOption")}</Label>
              <Select
                value={selectedOption}
                onChange={(e) => {
                  form.setValue("selectedOption", e.target.value)
                  if (e.target.value) form.setValue("customTitle", "")
                }}
              >
                <option value="">{t("expense.fields.selectOption")}</option>
                {EXPENSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(`expense.options.${opt}`)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t("expense.fields.or")}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label>{t("expense.fields.customTitle")}</Label>
              <Input
                value={customTitle}
                onChange={(e) => {
                  form.setValue("customTitle", e.target.value)
                  if (e.target.value) form.setValue("selectedOption", "")
                }}
              />
            </div>
            {form.formState.errors.selectedOption && (
              <p className="text-xs text-destructive">{form.formState.errors.selectedOption.message}</p>
            )}
            <div className="space-y-1">
              <Label>{t("expense.fields.amount")}</Label>
              <Input type="number" step="0.01" {...form.register("amount")} />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>{t("expense.fields.category")}</Label>
              <Select {...form.register("category")}>
                <option value="">{t("expense.fields.category")}</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`expense.categories.${cat}`)}
                  </option>
                ))}
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>{t("expense.fields.note")}</Label>
              <Input {...form.register("note")} />
            </div>
            <Button type="submit">{editingId ? t("income.update") : t("expense.add")}</Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("expense.listTitle")}</h2>
        {expenses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("expense.noExpenses")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{expense.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.createdAt).toLocaleString(lang)}
                      {expense.category && ` — ${t(`expense.categories.${expense.category}`)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-destructive">-{expense.amount.toLocaleString()} {t("common.egp")}</p>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(expense.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

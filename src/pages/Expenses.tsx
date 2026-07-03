import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Wallet, Pencil } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useExpenseStore } from "@/stores/expenseStore"
import { useIncomeStore } from "@/stores/incomeStore"
import { useSettingsStore } from "@/stores/settingsStore"
import { useTransactionStore } from "@/stores/transactionStore"
import {
  expenseSchema,
  EXPENSE_CATEGORIES,
  EXPENSE_OPTIONS,
  type ExpenseFormData,
} from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function Expenses() {
  const { t } = useTranslation()
  const lang = useSettingsStore((s) => s.language)
  const { expenses, addExpense, removeExpense, updateExpense, getTotalExpenses } =
    useExpenseStore()
  const getTotalIncome = useIncomeStore((s) => s.getTotalIncome)
  const { addTransaction } = useTransactionStore()
  const [editingId, setEditingId] = useState<string | null>(null)

  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const availableBalance = totalIncome - totalExpenses

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      selectedOption: "",
      customTitle: "",
      amount: 0,
      category: "",
      note: "",
    },
  })

  const watchedOption = form.watch("selectedOption")
  const watchedCustom = form.watch("customTitle")

  const onSubmit = (data: ExpenseFormData) => {
    if (data.amount > availableBalance && !editingId) {
      form.setError("amount", {
        message: t("expense.insufficientBalance", {
          balance: availableBalance.toLocaleString(),
        }),
      })
      return
    }

    const title = data.selectedOption || data.customTitle || ""

    if (editingId) {
      updateExpense(editingId, {
        title,
        amount: data.amount,
        category: data.category,
        note: data.note || undefined,
      })
      const bal = getTotalIncome() - getTotalExpenses()
      addTransaction(
        {
          type: "expense",
          amount: data.amount,
          description: title,
          category: data.category,
          note: data.note || undefined,
          sourceId: editingId,
        },
        bal
      )
      setEditingId(null)
    } else {
      const expense = addExpense({
        title,
        amount: data.amount,
        category: data.category,
        note: data.note || undefined,
      })
      const bal = getTotalIncome() - getTotalExpenses()
      addTransaction(
        {
          type: "expense",
          amount: expense.amount,
          description: expense.title,
          category: expense.category,
          note: expense.note,
          sourceId: expense.id,
        },
        bal
      )
    }
    form.reset({
      selectedOption: "",
      customTitle: "",
      amount: 0,
      category: "",
      note: "",
    })
  }

  const handleEdit = (id: string) => {
    const exp = expenses.find((e) => e.id === id)
    if (!exp) return
    setEditingId(id)
    const isPredefined = (EXPENSE_OPTIONS as readonly string[]).includes(exp.title)
    form.setValue("selectedOption", isPredefined ? exp.title : "")
    form.setValue("customTitle", isPredefined ? "" : exp.title)
    form.setValue("amount", exp.amount)
    form.setValue("category", exp.category)
    form.setValue("note", exp.note || "")
  }

  const handleDelete = (id: string) => {
    const expense = expenses.find((e) => e.id === id)
    if (!expense) return
    removeExpense(id)
    const bal = getTotalIncome() - getTotalExpenses()
    addTransaction(
      {
        type: "income",
        amount: expense.amount,
        description: `${t("expense.reversed")}: ${expense.title}`,
        sourceId: id,
      },
      bal
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t("expense.availableBalance")}
          </CardTitle>
          <CardDescription>
            {t("expense.totalCash")}: {totalIncome.toLocaleString()} {t("common.egp")} —{" "}
            {t("expense.expensesTotal")}: {totalExpenses.toLocaleString()} {t("common.egp")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${
              availableBalance < 0 ? "text-destructive" : ""
            }`}
          >
            {availableBalance.toLocaleString()} {t("common.egp")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? t("history.editTransaction") : t("expense.newExpense")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="selectedOption">{t("expense.fields.selectOption")}</Label>
              <Select
                id="selectedOption"
                {...form.register("selectedOption")}
                value={watchedOption}
                onChange={(e) => {
                  form.setValue("selectedOption", e.target.value)
                  if (e.target.value) form.setValue("customTitle", "")
                }}
              >
                <option value="">--</option>
                {EXPENSE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(`expense.options.${opt}`)}
                  </option>
                ))}
              </Select>
              {form.formState.errors.selectedOption && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.selectedOption.message}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("expense.fields.or")}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="customTitle">{t("expense.fields.customTitle")}</Label>
              <Input
                id="customTitle"
                {...form.register("customTitle")}
                value={watchedCustom}
                onChange={(e) => {
                  form.setValue("customTitle", e.target.value)
                  if (e.target.value) form.setValue("selectedOption", "")
                }}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="amount">{t("expense.fields.amount")}</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                {...form.register("amount")}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">{t("expense.fields.category")}</Label>
              <Select id="category" {...form.register("category")}>
                <option value="">--</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {t(`expense.categories.${cat}`)}
                  </option>
                ))}
              </Select>
              {form.formState.errors.category && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="note">{t("expense.fields.note")}</Label>
              <Input id="note" {...form.register("note")} />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? t("common.save") : t("expense.add")}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    form.reset({
                      selectedOption: "",
                      customTitle: "",
                      amount: 0,
                      category: "",
                      note: "",
                    })
                  }}
                >
                  {t("common.cancel")}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("expense.noExpenses")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t("expense.listTitle")}
          </h3>
          {[...expenses]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((e) => (
              <Card key={e.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <p className="font-medium">{e.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {t(`expense.categories.${e.category}`)} —{" "}
                      {new Date(e.createdAt).toLocaleDateString(lang)}
                      {e.note && ` — ${e.note}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-destructive">
                      -{e.amount.toLocaleString()} {t("common.egp")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(e.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(e.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}

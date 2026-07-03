import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useIncomeStore } from "@/stores/incomeStore"
import { useExpenseStore } from "@/stores/expenseStore"
import { useSettingsStore } from "@/stores/settingsStore"
import { useTransactionStore } from "@/stores/transactionStore"
import { incomeSchema, type IncomeFormData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function IncomePage() {
  const { t } = useTranslation()
  const lang = useSettingsStore((s) => s.language)
  const { incomes, addIncome, removeIncome, updateIncome, getTotalIncome } =
    useIncomeStore()
  const getTotalExpenses = useExpenseStore((s) => s.getTotalExpenses)
  const { addTransaction } = useTransactionStore()
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { title: "", amount: 0, note: "" },
  })

  const onSubmit = (data: IncomeFormData) => {
    if (editingId) {
      const old = incomes.find((i) => i.id === editingId)
      if (!old) return
      const diff = data.amount - old.amount
      updateIncome(editingId, {
        title: data.title,
        amount: data.amount,
        note: data.note || undefined,
      })
      const bal = getTotalIncome() - getTotalExpenses() + diff
      addTransaction(
        {
          type: "income",
          amount: data.amount,
          description: data.title,
          note: data.note || undefined,
          sourceId: editingId,
        },
        bal
      )
      setEditingId(null)
    } else {
      const income = addIncome({
        title: data.title,
        amount: data.amount,
        note: data.note || undefined,
      })
      const bal = getTotalIncome() - getTotalExpenses()
      addTransaction(
        {
          type: "income",
          amount: income.amount,
          description: income.title,
          note: income.note,
          sourceId: income.id,
        },
        bal
      )
    }
    form.reset({ title: "", amount: 0, note: "" })
  }

  const handleEdit = (id: string) => {
    const inc = incomes.find((i) => i.id === id)
    if (!inc) return
    setEditingId(id)
    form.setValue("title", inc.title)
    form.setValue("amount", inc.amount)
    form.setValue("note", inc.note || "")
  }

  const handleDelete = (id: string) => {
    const inc = incomes.find((i) => i.id === id)
    if (!inc) return
    removeIncome(id)
    const bal = getTotalIncome() - getTotalExpenses()
    addTransaction(
      {
        type: "expense",
        amount: inc.amount,
        description: `${t("income.deleted")}: ${inc.title}`,
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
            <DollarSign className="h-5 w-5" />
            {t("home.totalIncome")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {getTotalIncome().toLocaleString()} {t("common.egp")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? t("income.editIncome") : t("income.newIncome")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="title">{t("income.fields.title")}</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">{t("income.fields.amount")}</Label>
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
              <Label htmlFor="note">{t("income.fields.note")}</Label>
              <Input id="note" {...form.register("note")} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? t("income.update") : t("income.add")}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    form.reset({ title: "", amount: 0, note: "" })
                  }}
                >
                  {t("income.cancel")}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {incomes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("income.noIncome")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t("income.listTitle")}
          </h3>
          {[...incomes]
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .map((inc) => (
              <Card key={inc.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <p className="font-medium">{inc.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(inc.createdAt).toLocaleDateString(lang)}
                      {inc.note && ` — ${inc.note}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary">
                      +{inc.amount.toLocaleString()} {t("common.egp")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(inc.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(inc.id)}
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

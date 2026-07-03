import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "@/stores/settingsStore"
import { useIncomeStore } from "@/stores/incomeStore"
import { useTransactionStore } from "@/stores/transactionStore"
import { incomeSchema, type IncomeFormData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function IncomePage() {
  const { t } = useTranslation()
  const lang = useSettingsStore((s) => s.language)
  const { incomes, addIncome, removeIncome, updateIncome } = useIncomeStore()
  const { addTransaction, updateTransaction, removeTransaction, transactions } = useTransactionStore()

  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { title: "", amount: 0, note: "" },
  })

  const onSubmit = (data: IncomeFormData) => {
    const amount = Number(data.amount)
    if (editingId) {
      const oldIncome = incomes.find((i) => i.id === editingId)
      if (!oldIncome) return
      updateIncome(editingId, { title: data.title, amount, note: data.note })
      const diff = amount - oldIncome.amount
      const tx = transactions.find((t) => t.sourceId === editingId)
      if (tx) {
        updateTransaction(tx.id, { amount, description: data.title, note: data.note })
        const idx = transactions.indexOf(tx)
        let runningBalance = tx.balanceAfter + diff
        for (let j = idx + 1; j < transactions.length; j++) {
          const next = transactions[j]
          runningBalance += next.type === "income" ? next.amount : -next.amount
          updateTransaction(next.id, { balanceAfter: runningBalance })
        }
      }
      setEditingId(null)
    } else {
      const currentTotal = incomes.reduce((s, i) => s + i.amount, 0)
      const income = addIncome({ title: data.title, amount, note: data.note })
      const balanceAfter = currentTotal + amount
      addTransaction(
        {
          type: "income",
          amount,
          description: data.title,
          note: data.note,
          sourceId: income.id,
        },
        balanceAfter
      )
    }
    form.reset({ title: "", amount: 0, note: "" })
  }

  const startEdit = (id: string) => {
    const income = incomes.find((i) => i.id === id)
    if (!income) return
    setEditingId(id)
    form.reset({ title: income.title, amount: income.amount, note: income.note })
  }

  const handleDelete = (id: string) => {
    removeIncome(id)
    const tx = transactions.find((t) => t.sourceId === id)
    if (tx) removeTransaction(tx.id)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? t("income.editIncome") : t("income.newIncome")}
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>{t("income.fields.title")}</Label>
              <Input {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>{t("income.fields.amount")}</Label>
              <Input type="number" step="0.01" {...form.register("amount")} />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>{t("income.fields.note")}</Label>
              <Input {...form.register("note")} />
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? t("income.update") : t("income.add")}</Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); form.reset({ title: "", amount: 0, note: "" }) }}>
                  {t("income.cancel")}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("income.listTitle")}</h2>
        {incomes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("income.noIncome")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {incomes.map((income) => (
              <Card key={income.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{income.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(income.createdAt).toLocaleString(lang)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-primary">+{income.amount.toLocaleString()} {t("common.egp")}</p>
                    <Button variant="ghost" size="icon" onClick={() => startEdit(income.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(income.id)}>
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

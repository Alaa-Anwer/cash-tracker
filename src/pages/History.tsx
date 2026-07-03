import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Filter,
  X,
  Search,
  Pencil,
  Trash2,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "@/stores/settingsStore"
import { useTransactionStore } from "@/stores/transactionStore"
import { useIncomeStore } from "@/stores/incomeStore"
import { useExpenseStore } from "@/stores/expenseStore"
import { incomeSchema, type IncomeFormData } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

type SortField = "date" | "amount"
type FilterType = "all" | "income" | "expense"

export function History() {
  const { t } = useTranslation()
  const lang = useSettingsStore((s) => s.language)
  const { transactions, updateTransaction, removeTransaction } =
    useTransactionStore()
  const { updateIncome, removeIncome } = useIncomeStore()
  const { updateExpense, removeExpense } = useExpenseStore()

  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<FilterType>("all")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortAsc, setSortAsc] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [editingTx, setEditingTx] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...transactions]

    if (dateFrom) {
      result = result.filter((t) => new Date(t.createdAt) >= new Date(dateFrom))
    }
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      result = result.filter((t) => new Date(t.createdAt) <= end)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((t) =>
        t.description.toLowerCase().includes(q)
      )
    }
    if (typeFilter !== "all") {
      result = result.filter((t) => t.type === typeFilter)
    }

    result.sort((a, b) => {
      const mul = sortAsc ? 1 : -1
      if (sortField === "date") {
        return mul * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      }
      return mul * (a.amount - b.amount)
    })

    return result
  }, [transactions, dateFrom, dateTo, searchQuery, typeFilter, sortField, sortAsc])

  const editForm = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: { title: "", amount: 0, note: "" },
  })

  const startEdit = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId)
    if (!tx) return
    setEditingTx(txId)
    editForm.reset({
      title: tx.description,
      amount: tx.amount,
      note: tx.note || "",
    })
  }

  const saveEdit = () => {
    if (!editingTx) return
    const tx = transactions.find((t) => t.id === editingTx)
    if (!tx) return
    const data = editForm.getValues()
    const newAmount = Number(data.amount)
    const diff = newAmount - tx.amount

    if (tx.sourceId) {
      if (tx.type === "income") {
        updateIncome(tx.sourceId, {
          title: String(data.title),
          amount: newAmount,
          note: String(data.note) || undefined,
        })
      } else {
        updateExpense(tx.sourceId, {
          title: String(data.title),
          amount: newAmount,
          note: String(data.note) || undefined,
        })
      }
    }

    updateTransaction(editingTx, {
      amount: newAmount,
      description: String(data.title),
      note: String(data.note) || undefined,
    })

    const idx = transactions.findIndex((t) => t.id === editingTx)
    const rest = transactions.slice(idx + 1)
    let runningBalance = tx.balanceAfter + diff
    rest.forEach((t) => {
      updateTransaction(t.id, { balanceAfter: runningBalance })
      runningBalance += t.type === "income" ? t.amount : -t.amount
    })

    setEditingTx(null)
  }

  const handleDeleteTx = (txId: string) => {
    const tx = transactions.find((t) => t.id === txId)
    if (!tx) return
    if (tx.sourceId) {
      if (tx.type === "income") removeIncome(tx.sourceId)
      else removeExpense(tx.sourceId)
    }
    removeTransaction(txId)
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("history.title")}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilter(!showFilter)}
        >
          <Filter className="mr-2 h-4 w-4" />
          {t("history.filter")}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t("history.search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {showFilter && (
        <Card>
          <CardContent className="flex flex-wrap items-end gap-3 pt-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="dateFrom">{t("history.fromDate")}</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="dateTo">{t("history.toDate")}</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="w-full space-y-1">
              <Label>{t("history.filter")}</Label>
              <div className="flex gap-2">
                {(["all", "income", "expense"] as const).map((ft) => (
                  <Button
                    key={ft}
                    variant={typeFilter === ft ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTypeFilter(ft)}
                  >
                    {ft === "all"
                      ? t("history.allTypes")
                      : ft === "income"
                        ? t("history.incomeOnly")
                        : t("history.expenseOnly")}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size={sortField === "date" ? "default" : "sm"}
                onClick={() => toggleSort("date")}
              >
                {t("history.sortDate")}{" "}
                {sortField === "date" ? (sortAsc ? "↑" : "↓") : ""}
              </Button>
              <Button
                variant="ghost"
                size={sortField === "amount" ? "default" : "sm"}
                onClick={() => toggleSort("amount")}
              >
                {t("history.sortAmount")}{" "}
                {sortField === "amount" ? (sortAsc ? "↑" : "↓") : ""}
              </Button>
            </div>
            {(dateFrom || dateTo || searchQuery) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDateFrom("")
                  setDateTo("")
                  setSearchQuery("")
                  setTypeFilter("all")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("history.noTransactions")}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {filtered.map((tx) => (
            <Card key={tx.id}>
              {editingTx === tx.id ? (
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <Label>{t("income.fields.title")}</Label>
                    <Input {...editForm.register("title")} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("income.fields.amount")}</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...editForm.register("amount")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("income.fields.note")}</Label>
                    <Input {...editForm.register("note")} />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit}>
                      {t("history.save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTx(null)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </CardContent>
              ) : (
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-3">
                    {tx.type === "income" ? (
                      <ArrowUpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <ArrowDownCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString(lang)}
                        {tx.category && ` — ${t(`expense.categories.${tx.category}`)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.type === "income"
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {tx.amount.toLocaleString()} {t("common.egp")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("history.balance")}: {tx.balanceAfter.toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(tx.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTx(tx.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

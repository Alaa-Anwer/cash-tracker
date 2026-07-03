import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useIncomeStore } from "@/stores/incomeStore"
import { useExpenseStore } from "@/stores/expenseStore"
import { useSettingsStore } from "@/stores/settingsStore"
import { useTransactionStore } from "@/stores/transactionStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function Home() {
  const { t } = useTranslation()
  const lang = useSettingsStore((s) => s.language)
  const getTotalIncome = useIncomeStore((s) => s.getTotalIncome)
  const getTotalExpenses = useExpenseStore((s) => s.getTotalExpenses)
  const transactions = useTransactionStore((s) => s.transactions)

  const totalIncome = getTotalIncome()
  const totalExpenses = getTotalExpenses()
  const balance = totalIncome - totalExpenses
  const recent = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t("home.currentBalance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-3xl font-bold ${
              balance < 0 ? "text-destructive" : ""
            }`}
          >
            {balance.toLocaleString()} {t("common.egp")}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("home.totalIncome")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{totalIncome.toLocaleString()} {t("common.egp")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("home.totalExpenses")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{totalExpenses.toLocaleString()} {t("common.egp")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("home.recentTransactions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("home.noTransactions")}</p>
          ) : (
            recent.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div className="flex items-center gap-2">
                  {tx.type === "income" ? (
                    <ArrowUpCircle className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString(lang)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.type === "income" ? "text-primary" : "text-destructive"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {tx.amount.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

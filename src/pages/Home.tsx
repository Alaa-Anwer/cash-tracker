import { useIncomeStore } from "@/stores/incomeStore"
import { useExpenseStore } from "@/stores/expenseStore"
import { useTransactionStore } from "@/stores/transactionStore"
import { useSettingsStore } from "@/stores/settingsStore"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react"

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
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">{t("home.currentBalance")}</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
            {balance.toLocaleString()} {t("common.egp")}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t("home.totalIncome")}</p>
            <p className="text-xl font-semibold text-primary">
              +{totalIncome.toLocaleString()} {t("common.egp")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{t("home.totalExpenses")}</p>
            <p className="text-xl font-semibold text-destructive">
              -{totalExpenses.toLocaleString()} {t("common.egp")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("home.recentTransactions")}</h2>
        {recent.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("home.noTransactions")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {tx.type === "income" ? (
                      <ArrowUpCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString(lang)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === "income" ? "text-primary" : "text-destructive"}`}>
                      {tx.type === "income" ? "+" : "-"}
                      {tx.amount.toLocaleString()} {t("common.egp")}
                    </p>
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

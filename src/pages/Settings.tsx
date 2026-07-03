import { useRef } from "react"
import { Moon, Sun, Download, Upload, RotateCcw, Languages } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "@/stores/settingsStore"
import { useIncomeStore } from "@/stores/incomeStore"
import { useExpenseStore } from "@/stores/expenseStore"
import { useTransactionStore } from "@/stores/transactionStore"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function Settings() {
  const { t } = useTranslation()
  const { theme, language, setTheme, setLanguage } = useSettingsStore()
  const incomeStore = useIncomeStore()
  const expenseStore = useExpenseStore()
  const transactionStore = useTransactionStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      incomes: incomeStore.incomes,
      expenses: expenseStore.expenses,
      transactions: transactionStore.transactions,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cash-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.incomes || !data.expenses || !data.transactions) {
        alert(t("settings.invalidBackup"))
        return
      }
      incomeStore.incomes.forEach((i) => incomeStore.removeIncome(i.id))
      data.incomes.forEach(
        (i: { title: string; amount: number; date: string; note?: string }) =>
          incomeStore.addIncome(i)
      )
      expenseStore.expenses.forEach((e) => expenseStore.removeExpense(e.id))
      data.expenses.forEach(
        (e: {
          title: string
          amount: number
          category: string
          date: string
          note?: string
        }) => expenseStore.addExpense(e)
      )
      transactionStore.setTransactions(data.transactions)
      alert(t("settings.importSuccess"))
    } catch {
      alert(t("settings.importFailed"))
    }
    e.target.value = ""
  }

  const handleReset = () => {
    if (!confirm(t("settings.resetConfirm"))) return
    incomeStore.incomes.forEach((i) => incomeStore.removeIncome(i.id))
    expenseStore.expenses.forEach((e) => expenseStore.removeExpense(e.id))
    transactionStore.clearTransactions()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearance")}</CardTitle>
          <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <Label>
                {theme === "dark"
                  ? t("settings.darkMode")
                  : t("settings.lightMode")}
              </Label>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
          <CardDescription>{t("settings.languageDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <Label>
                {language === "en"
                  ? t("settings.english")
                  : t("settings.arabic")}
              </Label>
            </div>
            <Switch
              checked={language === "ar"}
              onCheckedChange={(checked) =>
                setLanguage(checked ? "ar" : "en")
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.backup")}</CardTitle>
          <CardDescription>{t("settings.backupDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {t("settings.export")}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" />
            {t("settings.import")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            {t("settings.dangerZone")}
          </CardTitle>
          <CardDescription>{t("settings.dangerDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleReset}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("settings.reset")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

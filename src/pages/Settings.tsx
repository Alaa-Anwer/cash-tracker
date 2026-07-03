import { useRef } from "react"
import { useTranslation } from "react-i18next"
import { useSettingsStore } from "@/stores/settingsStore"
import { useIncomeStore } from "@/stores/incomeStore"
import { useExpenseStore } from "@/stores/expenseStore"
import { useTransactionStore } from "@/stores/transactionStore"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download, Upload, AlertTriangle } from "lucide-react"

export function Settings() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { theme, language, setTheme, toggleTheme, setLanguage } = useSettingsStore()
  const { setTheme: _, toggleTheme: __, ...settingsState } = useSettingsStore.getState()

  const handleExport = () => {
    const data = {
      settings: localStorage.getItem("cash-tracker-settings"),
      income: localStorage.getItem("cash-tracker-income"),
      expenses: localStorage.getItem("cash-tracker-expenses"),
      transactions: localStorage.getItem("cash-tracker-transactions"),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cash-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.settings) localStorage.setItem("cash-tracker-settings", data.settings)
        if (data.income) localStorage.setItem("cash-tracker-income", data.income)
        if (data.expenses) localStorage.setItem("cash-tracker-expenses", data.expenses)
        if (data.transactions) localStorage.setItem("cash-tracker-transactions", data.transactions)
        window.location.reload()
      } catch {
        alert(t("settings.invalidBackup"))
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    if (window.confirm(t("settings.resetConfirm"))) {
      localStorage.removeItem("cash-tracker-settings")
      localStorage.removeItem("cash-tracker-income")
      localStorage.removeItem("cash-tracker-expenses")
      localStorage.removeItem("cash-tracker-transactions")
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">{t("settings.title")}</h2>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("settings.appearance")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.appearanceDesc")}</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
          <p className="mt-1 text-sm">
            {theme === "dark" ? t("settings.darkMode") : t("settings.lightMode")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("settings.language")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.languageDesc")}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("en")}
              >
                {t("settings.english")}
              </Button>
              <Button
                variant={language === "ar" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("ar")}
              >
                {t("settings.arabic")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <div>
            <p className="font-medium">{t("settings.backup")}</p>
            <p className="text-sm text-muted-foreground">{t("settings.backupDesc")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              {t("settings.export")}
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              {t("settings.import")}
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium">{t("settings.dangerZone")}</p>
              <p className="text-sm text-muted-foreground">{t("settings.dangerDesc")}</p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleReset}>
            {t("settings.reset")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

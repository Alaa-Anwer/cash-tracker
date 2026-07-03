import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { initSettings } from "./stores/settingsStore"
import "./i18n"
import "./index.css"

initSettings()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

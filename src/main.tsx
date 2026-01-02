import { createRoot } from "react-dom/client"
import { ThemeProvider } from "./components/theme-provider.tsx"
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"

import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <BrowserRouter>
    <Toaster/>
    <App />
    </BrowserRouter>
  </ThemeProvider>
)

import { createRoot } from "react-dom/client"
import { ThemeProvider } from "./components/theme-provider.tsx"
import { BrowserRouter } from 'react-router-dom'

import "./index.css"
import App from "./App.tsx"

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark">
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </ThemeProvider>
)

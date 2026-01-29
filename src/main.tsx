import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import ThemeToggle from "./ThemeToggle"; 

function Header() {
  return (
    <header className="flex justify-between p-4 bg-card dark:bg-sidebar">
      <h1 className="text-lg font-bold text-foreground dark:text-sidebar-foreground">
        BizBoost
      </h1>
      <ThemeToggle />
    </header>
  );
}

createRoot(document.getElementById("root")!).render(
  <div>
    <Header />
    <App />
  </div>
);


export default Header;

import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ru" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>{t("common:welcome")}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          {t("common:counter.button", { count })}
        </button>
        <p>
          <Trans i18nKey="common:counter.description">
            Edit <code>src/App.tsx</code> and save to test HMR
          </Trans>
        </p>
      </div>
      <p className="read-the-docs">{t("common:learnMore")}</p>
      <div style={{ marginTop: "20px" }}>
        <button onClick={toggleLanguage}>{t("common:language.switch")}</button>
        <p>{t("common:language.current")}</p>
      </div>
      <div
        style={{
          marginTop: "40px",
          borderTop: "1px solid #ccc",
          paddingTop: "20px",
        }}
      >
        <h2>{t("users:title")}</h2>
        <p>{t("users:list")}</p>
        <h2>{t("roles:title")}</h2>
        <p>
          {t("roles:admin")} / {t("roles:user")} / {t("roles:moderator")}
        </p>
        <h2>{t("products:title")}</h2>
        <p>
          {t("products:inStock")} / {t("products:outOfStock")}
        </p>
      </div>
    </>
  );
}

export default App;

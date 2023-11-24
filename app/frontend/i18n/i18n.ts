import i18n from "i18next"
import { initReactI18next } from "react-i18next"

i18n.use(initReactI18next).init({
  resources: {
    /* English translations */
    en: {
      translation: {
        login: {
          login: "Login",
          description: "Enter the username for your Digital Building Permit Account below.",
          usernameLabel: "Username",
          passwordLabel: "Password",
          forgot: "Forgot your password?",
          register: "Register for account",
        },
        ui: {
          back: "Back",
          show: "Show",
          hide: "Hide",
          loading: "Loading...",
        },
      },
    },
    // ... other languages
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
})

export default i18n

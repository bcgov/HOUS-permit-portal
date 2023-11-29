import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export const useLanguageChange = () => {
  const { i18n } = useTranslation()
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      document.documentElement.lang = lng
    }

    handleLanguageChange(i18n.language)

    i18n.on("languageChanged", handleLanguageChange)

    // Cleanup function
    return () => {
      i18n.off("languageChanged", handleLanguageChange)
    }
  }, [i18n])
}

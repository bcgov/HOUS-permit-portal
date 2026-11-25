import { BookOpen } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { MenuLinkItem } from "../menu-link-item"

export const QuestionBankMenuItem = () => {
  const { t } = useTranslation()

  return <MenuLinkItem icon={<BookOpen size={20} />} label={t("home.questionBankTitle")} to="/question-bank" />
}

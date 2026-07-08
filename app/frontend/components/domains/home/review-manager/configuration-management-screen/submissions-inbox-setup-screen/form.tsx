import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { ESubmissionContactClass } from "../../../../../../types/enums"
import { SubmissionContactForm } from "../shared/submission-contact-form"
import { i18nPrefix } from "./i18n-prefix"

interface IFormProps {
  jurisdiction: IJurisdiction
}

export const Form = observer(function SubmissionInboxSetupForm({ jurisdiction }: IFormProps) {
  const { t } = useTranslation()

  return (
    <SubmissionContactForm
      jurisdiction={jurisdiction}
      contactClass={ESubmissionContactClass.application}
      emailLabel={t(`${i18nPrefix}.emailLabel`)}
      addEmailLabel={t(`${i18nPrefix}.addEmail`)}
      confirmationRequiredLabel={t(`${i18nPrefix}.confirmationRequired`)}
    />
  )
})

import { FormControl, FormHelperText, FormLabel } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { CalloutBanner } from "../../shared/base/callout-banner"
import { Editor } from "../../shared/editor/editor"

export function LocalContextEditor({ htmlValue, onChange }: { htmlValue: string; onChange: (html: string) => void }) {
  const { t } = useTranslation()

  return (
    <FormControl>
      <FormLabel>{t("requirementTemplate.explainer.localJurisdiction")}</FormLabel>
      <FormHelperText mb={3}>{t("requirementTemplate.explainer.localContextHint")}</FormHelperText>
      <CalloutBanner type="info" title={t("requirementTemplate.explainer.localContextNote")} my={0} mb={3} />
      <Editor htmlValue={htmlValue} onChange={onChange} />
    </FormControl>
  )
}

import { Link, LinkProps } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { configurePermitInformationPath } from "../../../utils/permit-application-info-path"

export function PermitInformationReminderLink({
  requirementTemplateId,
  ...props
}: { requirementTemplateId?: string } & Omit<LinkProps, "href">) {
  const { t } = useTranslation()
  if (!requirementTemplateId) return null

  return (
    <Link
      isExternal
      display="inline-flex"
      alignItems="center"
      gap={2}
      w="fit-content"
      {...props}
      href={configurePermitInformationPath(requirementTemplateId)}
    >
      {t("requirementTemplate.edit.publishInfoReminder")}
      <ArrowSquareOut size={16} />
    </Link>
  )
}

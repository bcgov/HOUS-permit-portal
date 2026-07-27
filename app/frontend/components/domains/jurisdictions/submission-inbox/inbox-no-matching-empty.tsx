import { BoxProps, Link, Text } from "@chakra-ui/react"
import { Buildings, ClipboardText } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { EInboxViewMode } from "../../../../types/enums"
import { EmptyResultsBox } from "../../../shared/grid/empty-results-box"

interface IProps extends BoxProps {
  viewMode: EInboxViewMode
  onClearFilters: () => void
}

export const InboxNoMatchingEmpty = observer(function InboxNoMatchingEmpty({
  viewMode,
  onClearFilters,
  ...boxProps
}: IProps) {
  const { t } = useTranslation()
  const isProjects = viewMode === EInboxViewMode.projects

  return (
    <EmptyResultsBox
      icon={isProjects ? <Buildings size={18} /> : <ClipboardText size={18} />}
      title={
        isProjects ? t("submissionInbox.noMatchingProjectsTitle") : t("submissionInbox.noMatchingApplicationsTitle")
      }
      description={
        <Text fontSize="sm">
          {isProjects
            ? t("submissionInbox.noMatchingProjectsDescription")
            : t("submissionInbox.noMatchingApplicationsDescription")}{" "}
          <Link as="button" onClick={onClearFilters} textDecoration="underline">
            {t("submissionInbox.clearAllFilters")}
          </Link>
        </Text>
      }
      {...boxProps}
    />
  )
})

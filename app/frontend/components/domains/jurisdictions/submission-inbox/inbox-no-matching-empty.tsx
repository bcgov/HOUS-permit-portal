import { Link, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { EFlashMessageStatus, EInboxViewMode } from "../../../../types/enums"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"

interface IProps {
  viewMode: EInboxViewMode
  onClearFilters: () => void
}

export const InboxNoMatchingEmpty = observer(function InboxNoMatchingEmpty({ viewMode, onClearFilters }: IProps) {
  const { t } = useTranslation()
  const isProjects = viewMode === EInboxViewMode.projects

  return (
    <CustomMessageBox
      w="full"
      status={EFlashMessageStatus.info}
      title={
        isProjects ? t("submissionInbox.noMatchingProjectsTitle") : t("submissionInbox.noMatchingApplicationsTitle")
      }
      description={
        <Text>
          {isProjects
            ? t("submissionInbox.noMatchingProjectsDescription")
            : t("submissionInbox.noMatchingApplicationsDescription")}{" "}
          <Link as="button" onClick={onClearFilters} textDecoration="underline">
            {t("submissionInbox.clearAllFilters")}
          </Link>
        </Text>
      }
    />
  )
})

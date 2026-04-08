import { Button, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { EInboxViewMode } from "../../../../types/enums"

interface IProps {
  viewMode: EInboxViewMode
  onClearFilters: () => void
}

export const InboxNoMatchingEmpty = observer(function InboxNoMatchingEmpty({ viewMode, onClearFilters }: IProps) {
  const { t } = useTranslation()
  const isProjects = viewMode === EInboxViewMode.projects

  return (
    <VStack align="start" spacing={3} py={10} px={2} w="full">
      <Text fontWeight="bold" fontSize="md">
        {isProjects ? t("submissionInbox.noMatchingProjectsTitle") : t("submissionInbox.noMatchingApplicationsTitle")}
      </Text>
      <Text color="text.secondary" fontSize="sm">
        {isProjects
          ? t("submissionInbox.noMatchingProjectsDescription")
          : t("submissionInbox.noMatchingApplicationsDescription")}
      </Text>
      <Button variant="link" size="sm" onClick={onClearFilters} p={0} h="auto" minH={0}>
        {t("submissionInbox.clearAllFilters")}
      </Button>
    </VStack>
  )
})

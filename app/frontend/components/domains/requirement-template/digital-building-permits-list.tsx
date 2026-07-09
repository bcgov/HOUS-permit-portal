import { Box, Button, Center, Flex, HStack, Stack, Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateFormat } from "../../../constants"
import { useTemplateVersions } from "../../../hooks/resources/use-template-versions"
import { ITemplateVersion } from "../../../models/template-version"
import { ETemplateVersionStatus } from "../../../types/enums"
import { groupTemplateVersionsByCategory } from "../../../utils/template-version-grouping"
import { ErrorScreen } from "../../shared/base/error-screen"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { RouterLink } from "../../shared/navigation/router-link"
import { TemplateStatusTag } from "../../shared/requirement-template/template-status-tag"
import { can } from "../../shared/user/can"
import { VersionTag } from "../../shared/version-tag"
import { SectionBox } from "../home/section-box"

interface IProps {
  renderButton?: (templateVersion: ITemplateVersion) => React.ReactNode
  status?: ETemplateVersionStatus
  isPubliclyPreviewable?: boolean
  jurisdictionId?: string
  statusDisplayOptions?: {
    showStatus?: boolean
    showVersionDate?: boolean
  }
}

export const DigitalBuildingPermitsList = observer(function DigitalBuildingPermitsList({
  renderButton,
  status,
  statusDisplayOptions,
  isPubliclyPreviewable,
  jurisdictionId,
}: IProps) {
  const { t } = useTranslation()
  const { error, templateVersions, isLoading } = useTemplateVersions({
    customErrorMessage: t("errors.fetchBuildingPermits"),
    status,
    isPubliclyPreviewable,
    jurisdictionId,
  })
  const { showStatus = false, showVersionDate = true } = statusDisplayOptions || {}
  const showStatusTag = showStatus || can("requirementTemplate:manage")
  const groupedTemplateVersions = groupTemplateVersionsByCategory(templateVersions)

  if (error) return <ErrorScreen error={error} />
  if (isLoading)
    return (
      <Center>
        <SharedSpinner />
      </Center>
    )

  return (
    <Stack as="section" w={"min(100%, 906px)"} justifyContent={"center"}>
      {templateVersions.length === 0 && (
        <Text color={"text.secondary"} fontSize={"sm"} fontStyle={"italic"} alignSelf={"center"}>
          {t("digitalBuildingPermits.index.emptyPermitsText")}
        </Text>
      )}
      {groupedTemplateVersions.map((group) => (
        <Stack key={group.id} spacing={3} w="full">
          <Text as="h2" color="text.secondary" fontWeight={700} fontSize="lg">
            {group.label}
          </Text>
          {group.templateVersions.map((templateVersion) => {
            return (
              <SectionBox key={templateVersion.id} w="full" enableCardClick={!!renderButton}>
                <Flex w="full" as="section">
                  <Stack spacing={3} flex={1}>
                    <Text as="h3" color={"text.link"} fontWeight={700} fontSize="xl">
                      {templateVersion.denormalizedTemplateJson.nickname}
                    </Text>
                    <Text fontSize={"sm"} color={"text.secondary"}>
                      {templateVersion.denormalizedTemplateJson?.description}
                    </Text>
                    <Text fontSize={"sm"} color={"text.secondary"}>
                      <Text as="span" fontWeight={700}>
                        {t("digitalBuildingPermits.index.lastUpdated")}:{" "}
                      </Text>
                      {format(templateVersion.updatedAt, datefnsTableDateFormat)}
                    </Text>
                    <HStack gap={4} align="center">
                      <VersionTag versionDate={templateVersion.versionDate} w="fit-content" />
                      {(templateVersion.denormalizedTemplateJson?.tags ?? []).length > 0 && (
                        <Text fontSize="sm" color="text.secondary">
                          {(templateVersion.denormalizedTemplateJson?.tags ?? []).join(", ")}
                        </Text>
                      )}
                      {showStatusTag && (
                        <TemplateStatusTag
                          status={templateVersion.status}
                          scheduledFor={
                            showVersionDate &&
                            templateVersion.status === ETemplateVersionStatus.scheduled &&
                            templateVersion.versionDate
                              ? templateVersion.versionDate
                              : undefined
                          }
                        />
                      )}
                    </HStack>
                    {jurisdictionId && (
                      <HStack gap={2}>
                        <Box
                          as="span"
                          w={2.5}
                          h={2.5}
                          borderRadius="full"
                          bg={templateVersion.disabledByJurisdiction ? "transparent" : "semantic.success"}
                          border="1px solid"
                          borderColor={templateVersion.disabledByJurisdiction ? "border.light" : "semantic.success"}
                        />
                        <Text fontSize="sm" color="text.secondary">
                          {templateVersion.disabledByJurisdiction
                            ? t("digitalBuildingPermits.index.notAvailableToApplicants")
                            : t("digitalBuildingPermits.index.availableToApplicants")}
                        </Text>
                      </HStack>
                    )}
                  </Stack>

                  {renderButton ? (
                    renderButton(templateVersion)
                  ) : (
                    <HStack ml={4} alignSelf="center">
                      <Button
                        to={`/digital-building-permits/${templateVersion.id}/settings`}
                        as={RouterLink}
                        variant="secondary"
                      >
                        {t("ui.settings")}
                      </Button>
                      <Button
                        to={`/digital-building-permits/${templateVersion.id}/edit`}
                        as={RouterLink}
                        variant="primary"
                      >
                        {t("ui.open")}
                      </Button>
                    </HStack>
                  )}
                </Flex>
              </SectionBox>
            )
          })}
        </Stack>
      ))}
    </Stack>
  )
})

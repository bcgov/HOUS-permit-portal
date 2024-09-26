import { Button, Flex, HStack, Stack, Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useTemplateVersions } from "../../../hooks/resources/use-template-versions"
import { ITemplateVersion } from "../../../models/template-version"
import { ETemplateVersionStatus } from "../../../types/enums"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { FirstNationsTag } from "../../shared/first-nations-tag"
import { RouterLink } from "../../shared/navigation/router-link"
import { TemplateStatusTag } from "../../shared/requirement-template/template-status-tag"
import { can } from "../../shared/user/can"
import { VersionTag } from "../../shared/version-tag"
import { SectionBox } from "../home/section-box"

interface IProps {
  activityId?: string
  renderButton?: (templateVersion: ITemplateVersion) => React.ReactNode
  status?: ETemplateVersionStatus
  statusDisplayOptions?: {
    showStatus?: boolean
    showVersionDate?: boolean
  }
}

export const DigitalBuildingPermitsList = observer(function DigitalBuildingPermitsList({
  activityId,
  renderButton,
  status,
  statusDisplayOptions,
}: IProps) {
  const { t } = useTranslation()
  const { error, templateVersions, isLoading } = useTemplateVersions({
    activityId,
    customErrorMessage: t("errors.fetchBuildingPermits"),
    status,
  })
  const { showStatus = false, showVersionDate = true } = statusDisplayOptions || {}
  const showStatusTag = showStatus || can("requirementTemplate:manage")

  if (error) return <ErrorScreen error={error} />
  if (isLoading) return <LoadingScreen />

  return (
    <Stack as="section" w={"min(100%, 866px)"} px={6}>
      {templateVersions.length === 0 && (
        <Text color={"text.secondary"} fontSize={"sm"} fontStyle={"italic"} alignSelf={"center"}>
          {t("digitalBuildingPermits.index.emptyPermitsText")}
        </Text>
      )}
      {templateVersions.map((templateVersion) => {
        return (
          <SectionBox key={templateVersion.id}>
            <Flex w="full" as="section">
              <Stack spacing={3} flex={1}>
                <Text as="h3" color={"text.link"} fontWeight={700} fontSize="xl">
                  {templateVersion.denormalizedTemplateJson.label}
                </Text>
                <Text fontSize={"sm"} color={"text.secondary"}>
                  {templateVersion.denormalizedTemplateJson?.description}
                </Text>
                <Text fontSize={"sm"} color={"text.secondary"}>
                  <Text as="span" fontWeight={700}>
                    {t("digitalBuildingPermits.index.lastUpdated")}:{" "}
                  </Text>
                  {format(templateVersion.updatedAt, "MMM d, yyyy")}
                </Text>
                <HStack gap={4} align="center">
                  <VersionTag versionDate={templateVersion.versionDate} w="fit-content" />
                  {templateVersion.denormalizedTemplateJson.firstNations && <FirstNationsTag />}
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
              </Stack>

              {renderButton ? (
                renderButton(templateVersion)
              ) : (
                <Button
                  to={`/digital-building-permits/${templateVersion.id}/edit`}
                  as={RouterLink}
                  variant={"primary"}
                  ml={4}
                  alignSelf={"center"}
                >
                  {t("ui.manage")}
                </Button>
              )}
            </Flex>
          </SectionBox>
        )
      })}
    </Stack>
  )
})

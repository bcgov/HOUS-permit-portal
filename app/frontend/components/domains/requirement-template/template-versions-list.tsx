import { Button, Center, Flex, HStack, Stack, Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useTemplateVersions } from "../../../hooks/resources/use-template-versions"
import { ITemplateVersion } from "../../../models/template-version"
import { useMst } from "../../../setup/root"
import { ETemplateVersionStatus } from "../../../types/enums"
import { ErrorScreen } from "../../shared/base/error-screen"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { RouterLink } from "../../shared/navigation/router-link"
import { TemplateStatusTag } from "../../shared/requirement-template/template-status-tag"
import SandboxHeader from "../../shared/sandbox/sandbox-header"
import { can } from "../../shared/user/can"
import { VersionTag } from "../../shared/version-tag"
import { SectionBox } from "../home/section-box"

interface IProps {
  renderButton?: (templateVersion: ITemplateVersion) => React.ReactNode
  status?: ETemplateVersionStatus
  earlyAccess?: boolean
  isPubliclyPreviewable?: boolean
  statusDisplayOptions?: {
    showStatus?: boolean
    showVersionDate?: boolean
  }
}

export const TemplateVersionsList = observer(function TemplateVersionsList({
  renderButton,
  status,
  statusDisplayOptions,
  earlyAccess,
  isPubliclyPreviewable,
}: IProps) {
  const { t } = useTranslation()
  const { sandboxStore } = useMst()
  const { isSandboxActive } = sandboxStore
  const { templateVersions, isLoading, error } = useTemplateVersions({
    customErrorMessage: t("errors.fetchBuildingPermits"),
    status,
    earlyAccess,
    isPubliclyPreviewable,
  })

  const { showStatus = false, showVersionDate = true } = statusDisplayOptions || {}
  const showStatusTag = showStatus || can("requirementTemplate:manage")

  if (error) return <ErrorScreen error={error} />
  if (isLoading) {
    return (
      <Center>
        <SharedSpinner />
      </Center>
    )
  }

  return (
    <Stack as="section" w={"min(100%, 906px)"} justifyContent={"center"}>
      {templateVersions.length === 0 && (
        <Text color={"text.secondary"} fontSize={"sm"} fontStyle={"italic"} alignSelf={"center"}>
          {t("digitalBuildingPermits.index.emptyPermitsText")}
        </Text>
      )}

      {templateVersions.map((tv) => (
        <SectionBox key={tv.id} w="full" pt={isSandboxActive ? 12 : 6}>
          {isSandboxActive && <SandboxHeader sandbox={tv.sandbox} />}
          <Flex w="full" as="section">
            <Stack spacing={3} flex={1}>
              <Text as="h4" color={"text.link"} fontWeight={700} fontSize="xl">
                {tv.denormalizedTemplateJson?.nickname}
              </Text>
              <Text fontSize={"sm"} color={"text.secondary"}>
                {tv.denormalizedTemplateJson?.description}
              </Text>
              <Text fontSize={"sm"} color={"text.secondary"}>
                <Text as="span" fontWeight={700}>
                  {t("digitalBuildingPermits.index.lastUpdated")}:{" "}
                </Text>
                {format(tv.updatedAt, "MMM d, yyyy")}
              </Text>
              <HStack gap={4} align="center">
                <VersionTag versionDate={tv.versionDate} w="fit-content" />
                {(tv.denormalizedTemplateJson?.tags ?? []).length > 0 && (
                  <Text fontSize="sm" color="text.secondary">
                    {(tv.denormalizedTemplateJson?.tags ?? []).join(", ")}
                  </Text>
                )}
                {showStatusTag && (
                  <TemplateStatusTag
                    status={tv.status}
                    scheduledFor={
                      showVersionDate && tv.status === ETemplateVersionStatus.scheduled && tv.versionDate
                        ? tv.versionDate
                        : undefined
                    }
                  />
                )}
              </HStack>
            </Stack>
            {renderButton ? (
              renderButton(tv)
            ) : (
              <Button
                to={`/digital-building-permits/${tv.id}/edit`}
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
      ))}
    </Stack>
  )
})

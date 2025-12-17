import { Button, Center, Flex, HStack, Stack, Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useTemplateVersions } from "../../../hooks/resources/use-template-versions"
import { IActivity } from "../../../models/permit-classification"
import { ITemplateVersion } from "../../../models/template-version"
import { useMst } from "../../../setup/root"
import { ETemplateVersionStatus } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { ErrorScreen } from "../../shared/base/error-screen"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { FirstNationsTag } from "../../shared/first-nations-tag"
import { RouterLink } from "../../shared/navigation/router-link"
import { TemplateStatusTag } from "../../shared/requirement-template/template-status-tag"
import { can } from "../../shared/user/can"
import { VersionTag } from "../../shared/version-tag"
import { SectionBox } from "../home/section-box"

interface IProps {
  permitTypeId: string
  renderButton?: (templateVersion: ITemplateVersion) => React.ReactNode
  status?: ETemplateVersionStatus
  earlyAccess?: boolean
  isPublic?: boolean
  statusDisplayOptions?: {
    showStatus?: boolean
    showVersionDate?: boolean
  }
}

export const TemplateVersionsList = observer(function TemplateVersionsList({
  permitTypeId,
  renderButton,
  status,
  statusDisplayOptions,
  earlyAccess,
  isPublic,
}: IProps) {
  const { t } = useTranslation()
  const { permitClassificationStore } = useMst()
  const [activityOptions, setActivityOptions] = useState<IOption<IActivity>[] | null>(null)
  const [activityOptionsError, setActivityOptionsError] = useState<Error | undefined>()
  const { templateVersions, isLoading, error } = useTemplateVersions({
    permitTypeId,
    customErrorMessage: t("errors.fetchBuildingPermits"),
    status,
    earlyAccess,
    isPublic,
  })

  useEffect(() => {
    ;(async () => {
      try {
        const options = await permitClassificationStore.fetchActivityOptions(false, null, permitTypeId)
        setActivityOptions(options ?? [])
        setActivityOptionsError(undefined)
      } catch (e) {
        setActivityOptionsError(e as Error)
      }
    })()
  }, [permitTypeId])

  const enabledActivityOptions = activityOptions?.filter((option) => option.value.enabled) ?? []

  const groupedByCategory = useMemo(() => {
    const groups: Array<{ key: string; label: string; options: IOption<IActivity>[] }> = []
    const map: Record<string, { key: string; label: string; options: IOption<IActivity>[] }> = {}
    const uncategorized: IOption<IActivity>[] = []
    enabledActivityOptions.forEach((opt) => {
      const key = opt.value.category
      if (!key) {
        uncategorized.push(opt)
        return
      }
      const label = opt.value.categoryLabel || key
      if (!map[key]) {
        map[key] = { key, label, options: [] }
        groups.push(map[key])
      }
      map[key].options.push(opt)
    })
    return { groups, uncategorized }
  }, [enabledActivityOptions])

  const { showStatus = false, showVersionDate = true } = statusDisplayOptions || {}
  const showStatusTag = showStatus || can("requirementTemplate:manage")

  if (activityOptionsError) return <ErrorScreen error={activityOptionsError} />
  if (error) return <ErrorScreen error={error} />
  if (!activityOptions || isLoading) {
    return (
      <Center>
        <SharedSpinner />
      </Center>
    )
  }

  // For each activity in the selected permit type, fetch and render template versions
  return (
    <Stack as="section" w={"min(100%, 906px)"} justifyContent={"center"}>
      {enabledActivityOptions.length === 0 && (
        <Text color={"text.secondary"} fontSize={"sm"} fontStyle={"italic"} alignSelf={"center"}>
          {t("digitalBuildingPermits.index.emptyPermitsText")}
        </Text>
      )}

      {groupedByCategory.groups.map((group) => {
        const cards = group.options
          .map((activityOption) => {
            const tv = templateVersions.find(
              (v) =>
                (v as ITemplateVersion).denormalizedTemplateJson?.activity?.id === activityOption.value.id &&
                (v as ITemplateVersion).denormalizedTemplateJson?.permitType?.id === permitTypeId
            ) as ITemplateVersion | undefined

            if (!tv) return null

            return (
              <SectionBox key={tv.id} w="full">
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
                      {tv.denormalizedTemplateJson.firstNations && <FirstNationsTag />}
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
            )
          })
          .filter((c) => c !== null) as JSX.Element[]

        if (cards.length === 0) return null

        return (
          <Stack key={group.key} spacing={3} mb={6}>
            <Text as="h3" fontWeight={700} color="text.secondary">
              {group.label}
            </Text>
            {cards}
          </Stack>
        )
      })}
      {groupedByCategory.uncategorized.length > 0 && (
        <Stack spacing={3} mb={6}>
          {groupedByCategory.uncategorized.map((activityOption) => {
            const tv = templateVersions.find(
              (v) =>
                (v as ITemplateVersion).denormalizedTemplateJson?.activity?.id === activityOption.value.id &&
                (v as ITemplateVersion).denormalizedTemplateJson?.permitType?.id === permitTypeId
            ) as ITemplateVersion | undefined

            if (!tv) return null

            return (
              <SectionBox key={tv.id} w="full">
                <Flex w="full" as="section">
                  <Stack spacing={3} flex={1}>
                    <Text as="h4" color={"text.link"} fontWeight={700} fontSize="xl">
                      {tv.denormalizedTemplateJson.label}
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
                      {tv.denormalizedTemplateJson.firstNations && <FirstNationsTag />}
                      {showStatusTag && (
                        <TemplateStatusTag
                          status={tv.status}
                          scheduledFor={
                            showStatusTag && tv.status === ETemplateVersionStatus.scheduled && tv.versionDate
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
            )
          })}
        </Stack>
      )}
    </Stack>
  )
})

interface IActivityTemplateVersionsSectionBoxProps {
  activityId: string
  permitTypeId: string
  status?: ETemplateVersionStatus
  earlyAccess?: boolean
  isPublic?: boolean
  showStatusTag: boolean
  showVersionDate: boolean
  renderButton?: (templateVersion: ITemplateVersion) => React.ReactNode
}

const ActivityTemplateVersionsSectionBox = observer(function ActivityTemplateVersionsSectionBox({
  activityId,
  permitTypeId,
  status,
  earlyAccess,
  isPublic,
  showStatusTag,
  showVersionDate,
  renderButton,
}: IActivityTemplateVersionsSectionBoxProps) {
  const { t } = useTranslation()
  const { templateVersions } = useTemplateVersions({
    activityId,
    permitTypeId,
    customErrorMessage: t("errors.fetchBuildingPermits"),
    status,
    earlyAccess,
    isPublic,
  })

  if (templateVersions.length === 0) return null

  const filteredTemplateVersions = templateVersions.filter(
    (tv) => tv.denormalizedTemplateJson?.permitType?.id === permitTypeId
  )

  if (filteredTemplateVersions.length === 0) return null

  const templateVersion = filteredTemplateVersions[0]

  return (
    <SectionBox key={templateVersion.id} w="full">
      <Flex w="full" as="section">
        <Stack spacing={3} flex={1}>
          <Text as="h4" color={"text.link"} fontWeight={700} fontSize="xl">
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
})

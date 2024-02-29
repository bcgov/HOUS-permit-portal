import { Button, Flex, Stack, Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useTemplateVersions } from "../../../../hooks/resources/use-template-versions"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { RouterLink } from "../../../shared/navigation/router-link"
import { VersionTag } from "../../../shared/version-tag"

interface IProps {
  activityId?: string
}

export const DigitalBuildingPermitsList = observer(function DigitalBuildingPermitsList({ activityId }: IProps) {
  const { t } = useTranslation()
  const { error, templateVersions, hasLoaded } = useTemplateVersions({
    activityId,
    customErrorMessage: t("errors.fetchBuildingPermits"),
  })

  if (error) return <ErrorScreen error={error} />
  if (!hasLoaded) return <LoadingScreen />

  return (
    <Stack as="section" w="full" px={6}>
      {templateVersions.map((templateVersion) => {
        return (
          <Flex
            key={templateVersion.id}
            border="1px solid"
            borderColor="border.light"
            borderRadius="lg"
            w={"min(100%, 866px)"}
            as="section"
            p={6}
          >
            <Stack spacing={3} flex={1}>
              <Text as="h3" color={"text.link"} fontWeight={700} fontSize="xl">
                {`${templateVersion.denormalizedTemplateJson?.permitType?.name} | ${templateVersion.denormalizedTemplateJson?.activity?.name}`}
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
              <VersionTag versionDate={templateVersion.versionDate} w="fit-content" />
            </Stack>

            <Button as={RouterLink} variant={"primary"} ml={4} textDecor={"none"} alignSelf={"center"} isDisabled>
              {t("ui.manage")}
            </Button>
          </Flex>
        )
      })}
    </Stack>
  )
})

import { Box, Button, Center, Flex, Link, Stack, Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { useTemplateVersions } from "../../../../../hooks/resources/use-template-versions"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { RouterLink } from "../../../../shared/navigation/router-link"
import { VersionTag } from "../../../../shared/version-tag"

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
    <Stack as="section" w={"min(100%, 866px)"} px={6}>
      {templateVersions.length === 0 && (
        <Text color={"text.secondary"} fontSize={"sm"} fontStyle={"italic"} alignSelf={"center"}>
          {t("digitalBuildingPermits.index.emptyPermitsText")}
        </Text>
      )}
      {templateVersions.map((templateVersion) => {
        return (
          <Flex
            key={templateVersion.id}
            border="1px solid"
            borderColor="border.light"
            borderRadius="lg"
            w="full"
            as="section"
            p={6}
            className="jumbo-buttons"
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

            <Button
              to={`/digital-building-permits/${templateVersion.id}/edit`}
              as={RouterLink}
              variant={"primary"}
              ml={4}
              alignSelf={"center"}
            >
              {t("ui.manage")}
            </Button>
          </Flex>
        )
      })}
      <Center>
        <Box bg="greys.grey03" p={4} w="75%" mt={24}>
          <Trans
            i18nKey="digitalBuildingPermits.index.requestNewPromptWithLink"
            components={{
              // This is the component that replaces the <1></1> in your i18n string.
              // It's an array where each index corresponds to the placeholder number.
              1: <Link href={`mailto:digital.codes.permits@gov.bc.ca?subject=New%20permit%20type%20requested`}></Link>,
            }}
          />
        </Box>
      </Center>
    </Stack>
  )
})

import { Container, HStack, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ETemplateVersionStatus } from "../../../../../types/enums"
import { IDenormalizedTemplate } from "../../../../../types/types"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import { TemplateStatusTag } from "../../../../shared/requirement-template/template-status-tag"
import { VersionTag } from "../../../../shared/version-tag"
import { SubNavBar } from "../../../navigation/sub-nav-bar"

interface IProps {
  requirementTemplate: Pick<IDenormalizedTemplate, "id" | "description" | "activity" | "permitType" | "label">
  renderDescription?: () => JSX.Element
  renderHeading?: () => JSX.Element
  status?: ETemplateVersionStatus
  versionDate?: Date
  breadCrumbs?: { href: string; title: string }[]
  latestVersionId?: string
}

export const BuilderHeader = observer(function BuilderHeader({
  requirementTemplate,
  status,
  versionDate,
  renderDescription,
  renderHeading,
  breadCrumbs = [],
  latestVersionId,
}: IProps) {
  const { t } = useTranslation()

  return (
    <Container as={"header"} maxW={"container.lg"} px={8}>
      <HStack justifyContent={"space-between"}>
        <SubNavBar
          staticBreadCrumbs={breadCrumbs}
          breadCrumbContainerProps={{ px: 0, sx: { ol: { pl: 0 } }, minW: undefined }}
          borderBottom={"none"}
          h={"fit-content"}
          w={"fit-content"}
        />
        <Text as={"span"} fontSize={"sm"} color={"greys.grey01"}>
          {t("requirementTemplate.edit.title")}
        </Text>
      </HStack>
      <VStack spacing={2} w={"full"} alignItems={"flex-start"} py={5}>
        {renderHeading ? renderHeading() : <Heading as="h1">{requirementTemplate.label}</Heading>}
        <HStack>
          <Text fontWeight={700}>{t("requirementTemplate.fields.description")}:</Text>
          {renderDescription ? renderDescription() : <Text as="span">{requirementTemplate.description}</Text>}
        </HStack>
        <HStack alignItems={"center"} spacing={2}>
          <TemplateStatusTag
            status={status}
            scheduledFor={status === ETemplateVersionStatus.scheduled && versionDate ? versionDate : undefined}
          />
          {status === ETemplateVersionStatus.deprecated && (
            <RouterLinkButton
              to={`/digital-building-permits/${latestVersionId}/edit`}
              variant="secondary"
              size="xs"
              p={3}
              rightIcon={<CaretRight />}
            >
              {t("requirementTemplate.edit.goToLatest")}
            </RouterLinkButton>
          )}
          {status === ETemplateVersionStatus.published && versionDate && <VersionTag versionDate={versionDate} />}
        </HStack>
      </VStack>
    </Container>
  )
})

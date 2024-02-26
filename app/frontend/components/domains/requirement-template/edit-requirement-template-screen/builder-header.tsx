import { Container, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ETemplateVersionStatus } from "../../../../types/enums"
import { IDenormalizedTemplate } from "../../../../types/types"
import { TemplateStatusTag } from "../../../shared/requirement-template/template-status-tag"
import { VersionTag } from "../../../shared/version-tag"
import { SubNavBar } from "../../navigation/sub-nav-bar"

interface IProps {
  requirementTemplate: Pick<IDenormalizedTemplate, "id" | "description" | "activity" | "permitType">
  renderDescription?: () => JSX.Element
  status?: ETemplateVersionStatus
  versionDate?: Date
}

export const BuilderHeader = observer(function BuilderHeader({
  requirementTemplate,
  status,
  versionDate,
  renderDescription,
}: IProps) {
  const { t } = useTranslation()
  const breadCrumbs =
    status === ETemplateVersionStatus.draft
      ? [
          {
            href: "/requirement-templates",
            title: t("site.breadcrumb.requirementTemplates"),
          },
          {
            href: `/requirements-template${requirementTemplate.id}/edit`,
            title: t("site.breadcrumb.editTemplate"),
          },
        ]
      : [
          {
            href: "/template-versions",
            title: t("site.breadcrumb.templateVersions"),
          },
        ]

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
        <Text as={"h2"} fontWeight={400} fontSize={"sm"} color={"greys.grey01"}>
          {t("requirementTemplate.edit.title")}
        </Text>
      </HStack>
      <VStack spacing={2} w={"full"} alignItems={"flex-start"} py={5}>
        <Heading as="h3" color={"text.primary"}>
          {requirementTemplate.permitType.name} | {requirementTemplate.activity.name}
        </Heading>
        <HStack>
          <Text fontWeight={700}>{t("requirementTemplate.fields.description")}:</Text>
          {renderDescription ? renderDescription() : <Text as="span">{requirementTemplate.description}</Text>}
        </HStack>
        <HStack alignItems={"flex-start"} spacing={2}>
          <TemplateStatusTag status={status} scheduledFor={versionDate} />
          {status === ETemplateVersionStatus.published && <VersionTag versionDate={versionDate} />}
        </HStack>
      </VStack>
    </Container>
  )
})

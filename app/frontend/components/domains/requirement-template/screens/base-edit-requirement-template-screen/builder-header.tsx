import { Button, Container, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { ETemplateVersionStatus } from "../../../../../types/enums"
import { IDenormalizedTemplate } from "../../../../../types/types"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import {
  TemplateStatusTag,
  TTemplateStatusTagStatus,
} from "../../../../shared/requirement-template/template-status-tag"
import { VersionTag } from "../../../../shared/version-tag"
import { SubNavBar } from "../../../navigation/sub-nav-bar"

interface IProps {
  requirementTemplate: Pick<IDenormalizedTemplate, "id" | "description" | "tags" | "nickname">
  renderDescription?: () => JSX.Element
  renderHeading?: () => JSX.Element
  renderTags?: () => JSX.Element
  status?: TTemplateStatusTagStatus
  versionDate?: Date
  breadCrumbs?: { href: string; title: string }[]
  latestVersionId?: string
  forEdit?: boolean
  showBackButton?: boolean
}

export const BuilderHeader = observer(function BuilderHeader({
  requirementTemplate,
  status,
  versionDate,
  renderDescription,
  renderHeading,
  renderTags,
  breadCrumbs = [],
  latestVersionId,
  forEdit = false,
  showBackButton = false,
}: IProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    if (location.key === "default") {
      navigate("/requirement-templates")
    } else {
      navigate(-1)
    }
  }

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
        {showBackButton && (
          <Button variant="link" onClick={handleBack} leftIcon={<CaretLeft size={20} />} textDecoration="none">
            {t("ui.back")}
          </Button>
        )}
        {renderHeading ? renderHeading() : <Heading as="h1">{requirementTemplate.nickname}</Heading>}
        <HStack>
          <Text fontWeight={700}>{t("requirementTemplate.fields.description")}:</Text>
          {renderDescription ? renderDescription() : <Text as="span">{requirementTemplate.description}</Text>}
        </HStack>
        {renderTags && (
          <HStack alignItems={"flex-start"}>
            <Text fontWeight={700} pt={2}>
              {t("requirementTemplate.fields.tags")}:
            </Text>
            {renderTags()}
          </HStack>
        )}
        {status && (
          <HStack alignItems={"center"} spacing={2}>
            <TemplateStatusTag
              status={status}
              scheduledFor={status === ETemplateVersionStatus.scheduled && versionDate ? versionDate : undefined}
            />
            {status === ETemplateVersionStatus.deprecated && (
              <RouterLinkButton
                to={
                  forEdit
                    ? `/digital-building-permits/${latestVersionId}/edit`
                    : `/template-versions/${latestVersionId}`
                }
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
        )}
      </VStack>
    </Container>
  )
})

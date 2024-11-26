import { Container, HStack, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { ITemplateVersion } from "../../../../../models/template-version"
import { useMst } from "../../../../../setup/root"
import { TemplateStatusTag } from "../../../../shared/requirement-template/template-status-tag"
import { VersionTag } from "../../../../shared/version-tag"
import { SubNavBar } from "../../../navigation/sub-nav-bar"

interface IProps {
  templateVersion: ITemplateVersion
}

export const Header = observer(function Header({ templateVersion }: IProps) {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const currentJurisdiction = userStore?.currentUser?.jurisdiction

  const breadCrumbs = [
    {
      href: `/jurisdictions/${currentJurisdiction?.id}/configuration-management`,
      title: t("site.breadcrumb.configurationManagement"),
    },
    {
      href: `/jurisdictions/${currentJurisdiction?.id}/api-settings`,
      title: t("site.breadcrumb.apiSettings"),
    },
    {
      href: "/api-settings/api-mappings",
      title: t("site.breadcrumb.apiMappings"),
    },
    {
      href: `/api-settings/api-mappings/digital-building-permits/${templateVersion.id}/edit`,
      title: t("site.breadcrumb.manageMapping"),
    },
  ]

  return (
    <Container as={"header"} maxW={"container.lg"} px={8}>
      <SubNavBar
        staticBreadCrumbs={breadCrumbs}
        breadCrumbContainerProps={{ px: 0, sx: { ol: { pl: 0 } } }}
        borderBottom={"none"}
        h={"fit-content"}
        w={"fit-content"}
      />
      <VStack spacing={2} w={"full"} alignItems={"flex-start"} py={5}>
        <Heading as="h1" mb={0}>
          <Trans
            i18nKey={"apiMappingsSetup.edit.heading"}
            values={{
              permitClassification: `${templateVersion?.denormalizedTemplateJson?.label}`,
            }}
            components={{
              1: <Text fontSize={"md"} mb={2} />,
              2: <Text />,
            }}
          />
        </Heading>
        <TemplateStatusTag status={templateVersion.status} />
        <HStack spacing={6} fontSize={"sm"}>
          <HStack alignItems={"flex-start"} spacing={2}>
            <Text>{t("apiMappingsSetup.edit.permitTemplate")}:</Text>
            <VersionTag versionDate={templateVersion.versionDate} py={0} />
          </HStack>
          <Link href={"/integrations/api_docs"} target={"_blank"} rel="noopener noreferrer">
            {t("apiMappingsSetup.edit.seeApiDoc")} <ArrowSquareOut />
          </Link>
        </HStack>
      </VStack>
    </Container>
  )
})

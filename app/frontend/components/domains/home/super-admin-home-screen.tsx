import { Container, Flex, Heading } from "@chakra-ui/react"
import { BookOpen, Buildings, ChartBar, FileLock, FileText, Pencil } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "."
import { HomeScreenBox } from "./home-screen-box"

export const SuperAdminHomeScreen = ({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.md" py={16}>
      <Flex direction="column" align="center" w="full">
        <Heading as="h1" mb={8}>
          {t("home.superAdminTitle")}
        </Heading>
        <Flex direction="column" align="center" w="full" gap={6}>
          <HomeScreenBox
            title={t("home.jurisdictionsTitle")}
            description={t("home.jurisdictionsDescription")}
            icon={<Buildings size={24} />}
            href="/jurisdictions"
          />
          <HomeScreenBox
            title={t("home.permitTemplateCatalogueTitle")}
            description={t("home.permitTemplateCatalogueDescription")}
            icon={<FileText size={24} />}
            href="/requirement-templates"
          />
          <HomeScreenBox
            title={t("home.requirementsLibraryTitle")}
            description={t("home.requirementsLibraryDescription")}
            icon={<BookOpen size={24} />}
            href="/requirements-library"
          />
          <HomeScreenBox
            title={t("home.earlyAccess.title")}
            description={t("home.earlyAccess.adminDescription")}
            icon={<FileLock size={24} />}
            href="/early-access"
          />
          <HomeScreenBox
            title={t("home.reportingTitle")}
            description={t("home.reportingDescription")}
            icon={<ChartBar size={24} />}
            href="/reporting"
          />
          <HomeScreenBox
            title={t("home.configurationManagement.title")}
            description={t("home.configurationManagement.adminDescription")}
            icon={<Pencil size={24} />}
            href="/configuration-management"
          />
        </Flex>
      </Flex>
    </Container>
  )
}

import { Flex, Heading } from "@chakra-ui/react"
import { faBookOpen, faBuilding, faFile, faPencil } from "@fortawesome/free-solid-svg-icons"
import React from "react"
import { useTranslation } from "react-i18next"
import { IHomeScreenProps } from "."
import { FullWhiteContainer } from "../../shared/containers/full-white-container"
import { HomeScreenBox } from "./home-screen-box"

export const SuperAdminHomeScreen = ({ ...rest }: IHomeScreenProps) => {
  const { t } = useTranslation()

  return (
    <FullWhiteContainer containerMaxW="container.md">
      <Flex direction="column" align="center" w="full">
        <Heading as="h1" mb={8}>
          {t("home.superAdminTitle")}
        </Heading>
        <Flex direction="column" align="center" w="full" gap={6}>
          <HomeScreenBox
            title={t("home.jurisdictionsTitle")}
            description={t("home.jurisdictionsDescription")}
            icon={faBuilding}
            href="/jurisdictions"
          />
          <HomeScreenBox
            title={t("home.permitTemplateCatalogueTitle")}
            description={t("home.permitTemplateCatalogueDescription")}
            icon={faFile}
            href="/requirement-templates"
          />{" "}
          <HomeScreenBox
            title={t("home.requirementsLibraryTitle")}
            description={t("home.requirementsLibraryDescription")}
            icon={faBookOpen}
            href="/requirements-library"
          />
          <HomeScreenBox
            title={t("home.contentManagementTitle")}
            description={t("home.contentManagementDescription")}
            icon={faPencil}
            href="/content-management"
          />
        </Flex>
      </Flex>
    </FullWhiteContainer>
  )
}

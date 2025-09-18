import { Container, Flex, Heading, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PinnedProjectsGrid } from "./pinned-projects-grid"
import { ProjectsGrid } from "./projects-grid"

export function ProjectTabPanelContent() {
  const { t } = useTranslation()
  return (
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading as="h1">{t("permitProject.index.title", "Projects")}</Heading>
            <RouterLinkButton to="/projects/new" variant="primary">
              {t("permitProject.startNew", "Start New Project")}
            </RouterLinkButton>
          </Flex>
          <PinnedProjectsGrid />
          <ProjectsGrid />
        </VStack>
      </Container>
    </Flex>
  )
}

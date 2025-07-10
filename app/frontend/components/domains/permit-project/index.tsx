import { Box, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { useMst } from "../../../setup/root"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PinnedProjectsGrid } from "./pinned-projects-grid"
import { ProjectsTable } from "./projects-table"

interface IPermitProjectIndexScreenProps {}

export const PermitProjectIndexScreen = observer(({}: IPermitProjectIndexScreenProps) => {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()

  useSearch(permitProjectStore, [])

  useEffect(() => {
    permitProjectStore.fetchPinnedProjects()
  }, [])

  const navHeight = document.getElementById("mainNav")?.offsetHeight

  return (
    <Flex as="main" direction="row" w="full" flexGrow={1}>
      <Box
        as="aside"
        w="280px"
        bg="greys.grey04"
        p={6}
        pb={navHeight}
        borderRight="1px"
        borderColor="border.light"
        position="sticky"
        top={0}
        h="100vh"
        alignSelf="flex-start"
      >
        <Text>Sidebar nav TBD</Text>
      </Box>
      <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
        <Container maxW="container.xl" py={8} h={"full"}>
          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading as="h1">{t("permitProject.index.title", "Projects")}</Heading>
              <RouterLinkButton to="/permit-projects/new" variant="primary">
                {t("permitProject.startNew", "Start New Project")}
              </RouterLinkButton>
            </Flex>

            <PinnedProjectsGrid />

            <ProjectsTable />
          </VStack>
        </Container>
      </Flex>
    </Flex>
  )
})

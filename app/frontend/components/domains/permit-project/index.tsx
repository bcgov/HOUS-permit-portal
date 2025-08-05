import { Container, Flex, Heading, TabPanel, TabPanels, Tabs, VStack } from "@chakra-ui/react"
import { FolderSimple } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { useMst } from "../../../setup/root"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { PinnedProjectsGrid } from "./pinned-projects-grid"
import { ProjectsGrid } from "./projects-grid"
import { ITabItem, ProjectSidebarTabList } from "./sidebar-tab-list"

interface IPermitProjectIndexScreenProps {}

export const PermitProjectIndexScreen = observer(({}: IPermitProjectIndexScreenProps) => {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()

  useSearch(permitProjectStore, [])

  useEffect(() => {
    permitProjectStore.fetchPinnedProjects()
  }, [])

  const TABS_DATA: ITabItem[] = [{ label: t("permitProject.index.title", "Projects"), icon: FolderSimple, to: "" }]

  return (
    <Flex as="main" direction="row" w="full" flexGrow={1}>
      <Tabs w="full" flexGrow={1} index={0} display="flex">
        <ProjectSidebarTabList p={0} tabsData={TABS_DATA} />
        <TabPanels>
          <TabPanel p={0}>
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

                  <ProjectsGrid />
                </VStack>
              </Container>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  )
})

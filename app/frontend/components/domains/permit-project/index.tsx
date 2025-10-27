import { Flex, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { ClipboardText, FolderSimple, ListMagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useTransition } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { PreCheckTabPanelContent } from "./pre-check-tab-panel-content"
import { ITabItem, ProjectSidebarTabList } from "./project-sidebar-tab-list"
import { ProjectTabPanelContent } from "./project-tab-panel-content"
import { StepCodeTabPanelContent } from "./step-code-tab-panel-content"

interface IProjectDashboardScreenProps {}

export const ProjectDashboardScreen = observer(({}: IProjectDashboardScreenProps) => {
  const { t } = useTranslation()
  const { preCheckStore } = useMst()
  const location = useLocation()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  const TABS_DATA: ITabItem[] = [
    { label: t("permitProject.index.title", "Projects"), icon: FolderSimple, to: "projects", tabIndex: 0 },
    { label: t("stepCode.index.title", "Step Codes"), icon: ClipboardText, to: "step-codes", tabIndex: 1 },
    {
      label: t("preCheck.index.title", "Pre-Checks"),
      icon: ListMagnifyingGlass,
      to: "pre-checks",
      tabIndex: 2,
      badgeCount: preCheckStore.unviewedCount,
    },
    // Disabled: Documents tab
    // { label: t("document.index.title", "Documents"), icon: File, to: "documents", tabIndex: 3 },
  ]

  const getTabIndex = () => {
    const tabIndex = TABS_DATA.find((tab) => location.pathname.endsWith(tab.to))?.tabIndex
    return tabIndex ?? 0
  }

  const handleTabChange = (index: number) => {
    startTransition(() => {
      const routes = ["/projects", "/step-codes", "/pre-checks", "/documents"]
      navigate(routes[index] || "/projects", { replace: true })
    })
  }

  return (
    <Flex as="main" direction="row" w="full" flexGrow={1}>
      <Tabs w="full" flexGrow={1} index={getTabIndex()} onChange={handleTabChange} display="flex" isLazy>
        <ProjectSidebarTabList p={0} tabsData={TABS_DATA} />
        <TabPanels>
          <TabPanel p={0}>{isPending ? <LoadingScreen /> : <ProjectTabPanelContent />}</TabPanel>
          <TabPanel p={0}>{isPending ? <LoadingScreen /> : <StepCodeTabPanelContent />}</TabPanel>
          <TabPanel p={0}>{isPending ? <LoadingScreen /> : <PreCheckTabPanelContent />}</TabPanel>
          {/* <TabPanel p={0}>{isPending ? <LoadingScreen /> : <ComingSoonPlaceholder />}</TabPanel> */}
        </TabPanels>
      </Tabs>
    </Flex>
  )
})

import { Flex, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { ClipboardText, FolderSimple } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useTransition } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useSearch } from "../../../hooks/use-search"
import { useMst } from "../../../setup/root"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { ProjectTabPanelContent } from "./project-tab-panel-content"
import { ITabItem, ProjectSidebarTabList } from "./sidebar-tab-list"
import { StepCodeTabPanelContent } from "./step-code-tab-panel-content"

interface IPermitProjectIndexScreenProps {}

export const PermitProjectIndexScreen = observer(({}: IPermitProjectIndexScreenProps) => {
  const { t } = useTranslation()
  const { permitProjectStore } = useMst()
  const location = useLocation()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  useSearch(permitProjectStore, [])

  useEffect(() => {
    permitProjectStore.fetchPinnedProjects()
  }, [])

  const TABS_DATA: ITabItem[] = [
    { label: t("permitProject.index.title", "Projects"), icon: FolderSimple, to: "projects" },
    { label: t("stepCode.index.title", "Step Codes"), icon: ClipboardText, to: "step-codes" },
  ]

  const getTabIndex = () => (location.pathname.endsWith("/step-codes") ? 1 : 0)

  const handleTabChange = (index: number) => {
    startTransition(() => {
      navigate(index === 1 ? "/step-codes" : "/projects", { replace: true })
    })
  }

  return (
    <Flex as="main" direction="row" w="full" flexGrow={1}>
      <Tabs w="full" flexGrow={1} index={getTabIndex()} onChange={handleTabChange} display="flex" isLazy>
        <ProjectSidebarTabList p={0} tabsData={TABS_DATA} />
        <TabPanels>
          <TabPanel p={0}>{isPending ? <LoadingScreen /> : <ProjectTabPanelContent />}</TabPanel>
          <TabPanel p={0}>{isPending ? <LoadingScreen /> : <StepCodeTabPanelContent />}</TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  )
})

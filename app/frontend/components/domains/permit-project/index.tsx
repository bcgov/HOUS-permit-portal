import { Flex, Tabs } from "@chakra-ui/react"
import { Buildings, ClipboardText, ListMagnifyingGlass, Thermometer } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useTransition } from "react"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { OverheatingCodeTabPanelContent } from "./overheating-code-tab-panel-content"
import { PreCheckTabPanelContent } from "./pre-check-tab-panel-content"
import { ITabItem, ProjectSidebarTabList } from "./project-sidebar-tab-list"
import { ProjectTabPanelContent } from "./project-tab-panel-content"
import { StepCodeTabPanelContent } from "./step-code-tab-panel-content"

interface IProjectDashboardScreenProps {}

export const ProjectDashboardScreen = observer(({}: IProjectDashboardScreenProps) => {
  const { t } = useTranslation()
  const { preCheckStore, userStore, sandboxStore } = useMst()
  const { currentUser } = userStore
  const { isSandboxActive } = sandboxStore
  const location = useLocation()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()

  const TABS_DATA: ITabItem[] = [
    { label: t("permitProject.index.title", "Projects"), icon: Buildings, to: "projects", tabIndex: 0 },
    { label: t("stepCode.index.title", "Step Codes"), icon: ClipboardText, to: "step-codes", tabIndex: 1 },
    {
      label: t("preCheck.index.title", "Pre-checks"),
      icon: ListMagnifyingGlass,
      to: "pre-checks",
      tabIndex: 2,
      badgeCount: preCheckStore.unviewedCount,
    },
    {
      label: t("overheatingCode.index.title", "Overheating Codes"),
      icon: Thermometer,
      to: "overheating-codes",
      tabIndex: 3,
    },
    // Disabled: Documents tab
    // { label: t("document.index.title", "Documents"), icon: File, to: "documents", tabIndex: 4 },
  ]

  const getTabIndex = () => {
    const tabIndex = TABS_DATA.find((tab) => location.pathname.endsWith(tab.to))?.tabIndex
    return tabIndex ?? 0
  }

  const handleTabChange = (index: number) => {
    startTransition(() => {
      navigate(`/${TABS_DATA[index].to}`, {
        replace: true,
      })
    })
  }

  // if the current.isJurisdictionStaff, return ErrorScreen saying to enable sandbox mode
  if (currentUser.isJurisdictionStaff && !isSandboxActive) {
    return <ErrorScreen error={new Error(t("permitProject.index.staffError"))} />
  }

  return (
    <Flex as="main" direction="row" w="full" flexGrow={1}>
      <Tabs.Root
        w="full"
        flexGrow={1}
        value={String(getTabIndex())}
        onValueChange={({ value }) => handleTabChange(Number(value))}
        display="flex"
        lazyMount
        variant="sidebar"
      >
        <ProjectSidebarTabList p={0} tabsData={TABS_DATA} />
        <Tabs.ContentGroup>
          <Tabs.Content value="0" p={0}>
            {isPending ? <LoadingScreen /> : <ProjectTabPanelContent />}
          </Tabs.Content>
          <Tabs.Content value="1" p={0}>
            {isPending ? <LoadingScreen /> : <StepCodeTabPanelContent />}
          </Tabs.Content>
          <Tabs.Content value="2" p={0}>
            {isPending ? <LoadingScreen /> : <PreCheckTabPanelContent />}
          </Tabs.Content>
          <Tabs.Content value="3" p={0}>
            {isPending ? <LoadingScreen /> : <OverheatingCodeTabPanelContent />}
          </Tabs.Content>
          {/* <Tabs.Content value="4" p={0}>{isPending ? <LoadingScreen /> : <ComingSoonPlaceholder />}</Tabs.Content> */}
        </Tabs.ContentGroup>
      </Tabs.Root>
    </Flex>
  )
})

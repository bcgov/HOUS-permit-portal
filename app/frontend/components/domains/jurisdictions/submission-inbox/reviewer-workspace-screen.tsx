import { Flex, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { CalendarBlank, Tray } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useMemo, useTransition } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../../setup/root"
import { EInboxViewMode } from "../../../../types/enums"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { MeetingsTabPanelContent } from "./meetings-tab-panel-content"
import { IReviewerWorkspaceTabItem, ReviewerWorkspaceSidebar } from "./reviewer-workspace-sidebar"
import { SubmissionsTabPanelContent } from "./submissions-tab-panel-content"

export const ReviewerWorkspaceScreen = observer(function ReviewerWorkspaceScreen() {
  const { t } = useTranslation()
  const { jurisdictionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const { submissionInboxStore, siteConfigurationStore } = useMst()
  const { currentJurisdiction, error } = useJurisdiction()

  const projectMeetingsFlagLoaded = siteConfigurationStore.configurationLoaded && !!currentJurisdiction
  const projectMeetingsEnabled = Boolean(
    siteConfigurationStore.projectMeetingsEnabled && currentJurisdiction?.projectMeetingsEnabled
  )

  const submissionsUnreadCount =
    submissionInboxStore.viewMode === EInboxViewMode.projects
      ? (currentJurisdiction?.unviewedProjectsCount ?? 0)
      : (currentJurisdiction?.unviewedSubmissionsCount ?? 0)
  const meetingsUnreadCount = currentJurisdiction?.unviewedProjectMeetingsCount ?? 0

  const tabsData: IReviewerWorkspaceTabItem[] = useMemo(() => {
    if (!jurisdictionId) return []

    const submissionsTab: IReviewerWorkspaceTabItem = {
      label: t("submissionInbox.submissions"),
      icon: Tray,
      to: `/jurisdictions/${jurisdictionId}/submission-inbox`,
      tabIndex: 0,
      badgeCount: submissionsUnreadCount,
    }

    if (!projectMeetingsEnabled) return [submissionsTab]

    return [
      submissionsTab,
      {
        label: t("submissionInbox.meetings"),
        icon: CalendarBlank,
        to: `/jurisdictions/${jurisdictionId}/meetings`,
        tabIndex: 1,
        badgeCount: meetingsUnreadCount,
      },
    ]
  }, [jurisdictionId, projectMeetingsEnabled, submissionsUnreadCount, meetingsUnreadCount, t])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction || !jurisdictionId) return <LoadingScreen />
  if (projectMeetingsFlagLoaded && !projectMeetingsEnabled && location.pathname.includes("/meetings")) {
    return <Navigate to={`/jurisdictions/${jurisdictionId}/submission-inbox${location.search}`} replace />
  }

  const getTabIndex = () => {
    if (location.pathname.includes(`/jurisdictions/${jurisdictionId}/meetings`)) {
      return tabsData.find((tab) => tab.to.endsWith("/meetings"))?.tabIndex ?? 0
    }

    const tabIndex = tabsData.find((tab) => location.pathname.startsWith(tab.to))?.tabIndex
    return tabIndex ?? 0
  }

  const handleTabChange = (index: number) => {
    startTransition(() => {
      navigate(tabsData[index].to)
    })
  }

  return (
    <Flex as="main" h="calc(100vh - var(--app-navbar-height, 0px))" overflow="hidden">
      <Tabs
        w="full"
        flexGrow={1}
        index={getTabIndex()}
        onChange={handleTabChange}
        display="flex"
        isLazy
        variant="sidebar"
      >
        <ReviewerWorkspaceSidebar title={t("submissionInbox.workspace")} tabsData={tabsData} />
        <TabPanels flex={1} minW={0} h="full">
          <TabPanel p={0} h="full">
            {isPending ? <LoadingScreen /> : <SubmissionsTabPanelContent currentJurisdiction={currentJurisdiction} />}
          </TabPanel>
          {projectMeetingsEnabled && (
            <TabPanel p={0} h="full">
              {isPending ? <LoadingScreen /> : <MeetingsTabPanelContent currentJurisdiction={currentJurisdiction} />}
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Flex>
  )
})

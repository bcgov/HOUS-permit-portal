import { Container, Flex, Heading, IconButton, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { CalendarBlank, CaretLeft, Chat, ClipboardText, SquaresFour, TrendUp } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useTransition } from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom"
import { usePermitProject } from "../../../../../hooks/resources/use-permit-project"
import { useMst } from "../../../../../setup/root"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { ActivityTabPanelContent } from "../../../permit-project/activity-tab-panel-content"
import { ITabItem, ProjectSidebarTabList } from "../../../permit-project/project-sidebar-tab-list"
import { InboxMeetingsTab } from "./inbox-meetings-tab"
import { InboxNotesTab } from "./inbox-notes-tab"
import { InboxOverviewTab } from "./inbox-overview-tab"
import { InboxPermitsTab } from "./inbox-permits-tab"

export const InboxProjectDetailScreen = observer(() => {
  const { currentPermitProject, error } = usePermitProject()
  const { jurisdictionId } = useParams<{ jurisdictionId: string }>()
  const location = useLocation()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { siteConfigurationStore } = useMst()
  const projectMeetingsEnabled = Boolean(
    siteConfigurationStore.projectMeetingsEnabled && currentPermitProject?.jurisdiction?.projectMeetingsEnabled
  )
  const inboxProjectBasePath =
    jurisdictionId && currentPermitProject
      ? `/jurisdictions/${jurisdictionId}/submission-inbox/projects/${currentPermitProject.id}`
      : null

  const TABS_DATA: ITabItem[] = useMemo(() => {
    if (!inboxProjectBasePath) return []
    return [
      {
        label: t("submissionInbox.projectDetail.overview"),
        icon: SquaresFour,
        to: `${inboxProjectBasePath}/overview`,
        tabIndex: 0,
      },
      {
        label: t("submissionInbox.projectDetail.permits"),
        icon: ClipboardText,
        to: `${inboxProjectBasePath}/permits`,
        tabIndex: 1,
      },
      // Currently, notes are specific to projject meetings and thus will only be shown if project meetings are enabled
      // Change this when notes are made independent of project meetings
      ...(projectMeetingsEnabled
        ? [
            {
              label: t("submissionInbox.projectDetail.notes"),
              icon: Chat,
              to: `${inboxProjectBasePath}/notes`,
              tabIndex: 2,
            },
          ]
        : []),
      {
        label: t("submissionInbox.projectDetail.activity"),
        icon: TrendUp,
        to: `${inboxProjectBasePath}/activity`,
        tabIndex: projectMeetingsEnabled ? 3 : 2,
      },
      ...(projectMeetingsEnabled
        ? [
            {
              label: t("submissionInbox.projectDetail.meetings"),
              icon: CalendarBlank,
              to: `${inboxProjectBasePath}/meetings`,
              tabIndex: 4,
            },
          ]
        : []),
    ]
  }, [inboxProjectBasePath, projectMeetingsEnabled, t])

  useEffect(() => {
    if (!currentPermitProject || !inboxProjectBasePath) return

    if (!TABS_DATA.some((tab) => location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`))) {
      navigate(`${inboxProjectBasePath}/overview`, { replace: true })
    }
  }, [TABS_DATA, currentPermitProject, inboxProjectBasePath, location.pathname, navigate])

  useEffect(() => {
    if (currentPermitProject) {
      currentPermitProject.markAsViewed()
    }
  }, [currentPermitProject])

  const [isPending, startTransition] = useTransition()

  const getTabIndex = () => {
    const tabIndex = TABS_DATA.findIndex(
      (tab) => location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`)
    )
    return tabIndex === -1 ? 0 : tabIndex
  }

  const handleTabChange = (index: number) => {
    startTransition(() => {
      navigate(TABS_DATA[index].to, { replace: true })
    })
  }

  if (error) return <ErrorScreen error={error} />
  if (!currentPermitProject && !error) return <LoadingScreen />
  if (!currentPermitProject) return <Text>{t("permitProject.details.notFound")}</Text>

  return (
    <Flex direction="column" h="calc(100vh - var(--app-navbar-height, 0px))" minH={0} minW={0} overflow="hidden">
      <Flex flexShrink={0} justify="space-between" align="center" py={6} borderBottom="1px" borderColor="border.light">
        <Container maxW="container.lg">
          <Flex align="center" h={24}>
            <IconButton
              as={RouterLink}
              to={`/jurisdictions/${jurisdictionId}/submission-inbox`}
              aria-label={t("submissionInbox.projectDetail.backToInbox")}
              icon={<CaretLeft size={24} />}
              variant="ghost"
              mr={2}
            />
            <Heading as="h1" fontWeight={700} fontSize="3xl" flex={1} noOfLines={1} mb={0}>
              {currentPermitProject.number}
            </Heading>
          </Flex>
        </Container>
      </Flex>
      <Tabs
        w="full"
        flex={1}
        minH={0}
        minW={0}
        index={getTabIndex()}
        onChange={handleTabChange}
        display="flex"
        isLazy
        variant="sidebar"
      >
        <ProjectSidebarTabList p={0} tabsData={TABS_DATA} />
        <TabPanels flex={1} minH={0} minW={0} overflow="hidden" display="flex" flexDirection="column">
          <TabPanel flex={1} minH={0} minW={0} display="flex" flexDirection="column" overflow="hidden">
            {isPending ? <LoadingScreen /> : <InboxOverviewTab permitProject={currentPermitProject} />}
          </TabPanel>
          <TabPanel flex={1} minH={0} minW={0} display="flex" flexDirection="column" overflow="hidden">
            {isPending ? <LoadingScreen /> : <InboxPermitsTab permitProject={currentPermitProject} />}
          </TabPanel>
          {projectMeetingsEnabled && (
            <TabPanel flex={1} minH={0} minW={0} display="flex" flexDirection="column" overflow="hidden">
              {isPending ? <LoadingScreen /> : <InboxNotesTab permitProject={currentPermitProject} />}
            </TabPanel>
          )}
          <TabPanel flex={1} minH={0} minW={0} display="flex" flexDirection="column" overflow="hidden">
            {isPending ? <LoadingScreen /> : <ActivityTabPanelContent permitProject={currentPermitProject} fromInbox />}
          </TabPanel>
          {projectMeetingsEnabled && (
            <TabPanel flex={1} minH={0} minW={0} display="flex" flexDirection="column" overflow="hidden">
              {isPending ? <LoadingScreen /> : <InboxMeetingsTab permitProject={currentPermitProject} />}
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Flex>
  )
})

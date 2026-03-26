import { Box, Container, Flex, Heading, IconButton, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { CalendarBlank, CaretLeft, ClockCounterClockwise, Folder, NoteBlank, SquaresFour } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useTransition } from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom"
import { usePermitProject } from "../../../../../hooks/resources/use-permit-project"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { ITabItem, ProjectSidebarTabList } from "../../../permit-project/project-sidebar-tab-list"
import { InboxActivityTab } from "./inbox-activity-tab"
import { InboxDocumentsTab } from "./inbox-documents-tab"
import { InboxMeetingsTab } from "./inbox-meetings-tab"
import { InboxNotesTab } from "./inbox-notes-tab"
import { InboxOverviewTab } from "./inbox-overview-tab"

export const InboxProjectDetailScreen = observer(() => {
  const { currentPermitProject, error } = usePermitProject()
  const { jurisdictionId } = useParams<{ jurisdictionId: string }>()
  const location = useLocation()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const TABS_DATA: ITabItem[] = [
    { label: t("submissionInbox.projectDetail.overview"), icon: SquaresFour, to: "overview", tabIndex: 0 },
    { label: t("submissionInbox.projectDetail.notes"), icon: NoteBlank, to: "notes", tabIndex: 1 },
    { label: t("submissionInbox.projectDetail.activity"), icon: ClockCounterClockwise, to: "activity", tabIndex: 2 },
    { label: t("submissionInbox.projectDetail.documents"), icon: Folder, to: "documents", tabIndex: 3 },
    { label: t("submissionInbox.projectDetail.meetings"), icon: CalendarBlank, to: "meetings", tabIndex: 4 },
  ]

  useEffect(() => {
    if (!TABS_DATA.some((tab) => location.pathname.includes(tab.to))) {
      navigate("overview", { replace: true })
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (currentPermitProject) {
      currentPermitProject.markAsViewed()
    }
  }, [currentPermitProject])

  const [isPending, startTransition] = useTransition()

  const getTabIndex = () => {
    const tabIndex = TABS_DATA.findIndex((tab) => location.pathname.includes(tab.to))
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
    <Box>
      <Flex justify="space-between" align="center" py={6} borderBottom="1px" borderColor="border.light">
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
              {currentPermitProject.title}
            </Heading>
            {/* todo: inbox specific rollup status box? */}
            {/* <RollupStatusBox project={currentPermitProject} w="240px" /> */}
          </Flex>
        </Container>
      </Flex>
      <Tabs
        w="full"
        flexGrow={1}
        index={getTabIndex()}
        onChange={handleTabChange}
        display="flex"
        isLazy
        variant="sidebar"
      >
        <ProjectSidebarTabList p={0} tabsData={TABS_DATA} />
        <TabPanels>
          <TabPanel>
            {isPending ? <LoadingScreen /> : <InboxOverviewTab permitProject={currentPermitProject} />}
          </TabPanel>
          <TabPanel>{isPending ? <LoadingScreen /> : <InboxNotesTab />}</TabPanel>
          <TabPanel>{isPending ? <LoadingScreen /> : <InboxActivityTab />}</TabPanel>
          <TabPanel>
            {isPending ? <LoadingScreen /> : <InboxDocumentsTab permitProject={currentPermitProject} />}
          </TabPanel>
          <TabPanel>{isPending ? <LoadingScreen /> : <InboxMeetingsTab />}</TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
})

import { Box, Container, Flex, Heading, IconButton, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { CaretLeft, SquaresFour, TrendUp } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useTransition } from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom"
import { usePermitProject } from "../../../../../hooks/resources/use-permit-project"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { ActivityTabPanelContent } from "../../../permit-project/activity-tab-panel-content"
import { ITabItem, ProjectSidebarTabList } from "../../../permit-project/project-sidebar-tab-list"
import { InboxOverviewTab } from "./inbox-overview-tab"

export const InboxProjectDetailScreen = observer(() => {
  const { currentPermitProject, error } = usePermitProject()
  const { jurisdictionId } = useParams<{ jurisdictionId: string }>()
  const location = useLocation()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const TABS_DATA: ITabItem[] = [
    { label: t("submissionInbox.projectDetail.overview"), icon: SquaresFour, to: "overview", tabIndex: 0 },
    {
      label: t("submissionInbox.projectDetail.activity"),
      icon: TrendUp,
      to: "activity",
      tabIndex: 1,
    },
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
          <TabPanel>
            {isPending ? <LoadingScreen /> : <ActivityTabPanelContent permitProject={currentPermitProject} />}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
})

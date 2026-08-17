import { Box, Container, Flex, IconButton, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import {
  CalendarBlank,
  CaretLeft,
  Chat,
  ClipboardText,
  Folder,
  SquaresFour,
  TrendUp,
  Users,
  UsersThree,
} from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useParams } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useProjectDetailTabs } from "../../../hooks/use-project-detail-tabs"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { ProjectStateBox } from "../../shared/permit-projects/project-state-box"
import { ActivityTabPanelContent } from "./activity-tab-panel-content"
import { CollaboratorsTabPanelContent } from "./collaborators-tab-panel-content"
import { LocalResourcesTabPanelContent } from "./local-resources-tab-panel-content"
import { MeetingsTabPanelContent } from "./meetings-tab-panel-content"
import { OverviewTabPanelContent } from "./overview-tab-panel-content"
import { PermitsTabPanelContent } from "./permits-tab-panel-content"
import { ProjectNotesTabPanelContent } from "./project-notes-tab-panel-content"
import { ITabItem, ProjectSidebarTabList } from "./project-sidebar-tab-list"
import { TeamsTabPanelContent } from "./teams-tab-panel-content"

export const PermitProjectScreen = observer(() => {
  const { currentPermitProject, error } = usePermitProject()
  const { permitProjectId } = useParams<{ permitProjectId: string }>()
  const { permitProjectStore, siteConfigurationStore } = useMst()
  const { t } = useTranslation()
  const projectMeetingsEnabled = Boolean(
    siteConfigurationStore.projectMeetingsEnabled && currentPermitProject?.jurisdiction?.projectMeetingsEnabled
  )
  // Derive from the URL, not store current — store lags during project switches and was redirecting to the wrong project.
  const projectBasePath = permitProjectId ? `/projects/${permitProjectId}` : null

  const canViewCollaborators = Boolean(currentPermitProject?.canViewCollaborators)
  const canViewTeams = Boolean(currentPermitProject?.canViewTeams)

  const TABS_DATA: ITabItem[] = useMemo(() => {
    if (!projectBasePath) return []
    // Tab indices follow position, so they stay aligned with the conditionally
    // rendered panels below.
    return [
      { label: t("permitProject.details.overview"), icon: SquaresFour, to: `${projectBasePath}/overview` },
      { label: t("permitProject.details.activity"), icon: TrendUp, to: `${projectBasePath}/activity` },
      { label: t("permitProject.details.permits"), icon: ClipboardText, to: `${projectBasePath}/permits` },
      ...(projectMeetingsEnabled
        ? [
            {
              label: t("permitProject.details.meetings"),
              icon: CalendarBlank,
              to: `${projectBasePath}/meetings`,
            },
            { label: t("permitProject.details.notes"), icon: Chat, to: `${projectBasePath}/notes` },
          ]
        : []),
      {
        label: t("permitProject.details.localResources"),
        icon: Folder,
        to: `${projectBasePath}/local-resources`,
      },
      ...(canViewCollaborators
        ? [{ label: t("permitProject.details.collaborators"), icon: Users, to: `${projectBasePath}/collaborators` }]
        : []),
      ...(canViewTeams
        ? [{ label: t("permitProject.details.teams"), icon: UsersThree, to: `${projectBasePath}/teams` }]
        : []),
    ].map((tab, index) => ({ ...tab, tabIndex: index }))
  }, [projectBasePath, projectMeetingsEnabled, canViewCollaborators, canViewTeams, t])

  const { projectMatchesRoute, tabIndex, handleTabChange, isPending } = useProjectDetailTabs({
    basePath: projectBasePath,
    tabs: TABS_DATA,
    routeProjectId: permitProjectId,
    currentProjectId: currentPermitProject?.id,
  })

  const getDefaultValues = () => {
    return {
      title: currentPermitProject?.title,
    }
  }

  const { register, watch, setValue, handleSubmit, reset } = useForm({
    defaultValues: getDefaultValues(),
  })

  const { updatePermitProject } = permitProjectStore

  useEffect(() => {
    reset(getDefaultValues())
  }, [currentPermitProject, reset]) // Recalculate if title changes, as it might affect height

  const onSubmit = async (data: { title: string }) => {
    if (!currentPermitProject) return
    await updatePermitProject(currentPermitProject.id, { title: data.title })
  }

  if (error) return <ErrorScreen error={error} />
  if (!projectMatchesRoute && !error) return <LoadingScreen />
  if (!currentPermitProject) return <Text>{t("permitProject.details.notFound")}</Text>

  return (
    <Box>
      <Flex justify="space-between" align="center" py={6} borderBottom="1px" borderColor="border.light">
        <Container maxW="container.lg">
          <Flex align="center" h={24}>
            <IconButton
              as={RouterLink}
              to="/projects"
              aria-label={t("permitProject.details.backToProjects")}
              icon={<CaretLeft size={24} />}
              variant="ghost"
              mr={2}
            />
            <EditableInputWithControls
              w="full"
              initialHint={t("permitProject.details.editPermitProjectTitleHint")}
              value={watch("title") || ""}
              editableInputProps={{
                fontWeight: 700,
                fontSize: "3xl",
                width: "100%",
                ...register("title", {
                  maxLength: {
                    value: 256,
                    message: t("permitProject.details.invalidInput"),
                  },
                }),
                "aria-label": t("permitProject.details.editPermitProjectTitle"),
                onSubmit: handleSubmit(onSubmit),
              }}
              editablePreviewProps={{
                fontWeight: 700,
                fontSize: "3xl",
              }}
              aria-label={t("permitProject.details.editPermitProjectTitle")}
              onChange={(val) => setValue("title", val)}
            />
            <ProjectStateBox project={currentPermitProject} w="240px" />
          </Flex>
        </Container>
      </Flex>
      <Tabs w="full" flexGrow={1} index={tabIndex} onChange={handleTabChange} display="flex" isLazy variant="sidebar">
        <ProjectSidebarTabList p={0} tabsData={TABS_DATA} />
        <TabPanels>
          <TabPanel>
            {isPending ? <LoadingScreen /> : <OverviewTabPanelContent permitProject={currentPermitProject} />}
          </TabPanel>
          <TabPanel>
            {isPending ? <LoadingScreen /> : <ActivityTabPanelContent permitProject={currentPermitProject} />}
          </TabPanel>
          <TabPanel>
            {isPending ? <LoadingScreen /> : <PermitsTabPanelContent permitProject={currentPermitProject} />}
          </TabPanel>
          {projectMeetingsEnabled && (
            <TabPanel p={0}>
              {isPending ? <LoadingScreen /> : <MeetingsTabPanelContent permitProject={currentPermitProject} />}
            </TabPanel>
          )}
          {projectMeetingsEnabled && (
            <TabPanel p={0}>
              {isPending ? <LoadingScreen /> : <ProjectNotesTabPanelContent permitProject={currentPermitProject} />}
            </TabPanel>
          )}
          <TabPanel>
            {isPending ? <LoadingScreen /> : <LocalResourcesTabPanelContent permitProject={currentPermitProject} />}
          </TabPanel>
          {canViewCollaborators && (
            <TabPanel>
              {isPending ? <LoadingScreen /> : <CollaboratorsTabPanelContent permitProject={currentPermitProject} />}
            </TabPanel>
          )}
          {canViewTeams && (
            <TabPanel>
              {isPending ? <LoadingScreen /> : <TeamsTabPanelContent permitProject={currentPermitProject} />}
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  )
})

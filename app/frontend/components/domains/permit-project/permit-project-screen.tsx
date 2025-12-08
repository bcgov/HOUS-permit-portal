import { Box, Container, Flex, IconButton, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { CaretLeft, ClipboardText, Folder, SquaresFour } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { RollupStatusBox } from "../../shared/permit-projects/rollup-status-box"
import { LocalResourcesTabPanelContent } from "./local-resources-tab-panel-content"
import { OverviewTabPanelContent } from "./overview-tab-panel-content"
import { PermitsTabPanelContent } from "./permits-tab-panel-content"
import { ITabItem, ProjectSidebarTabList } from "./project-sidebar-tab-list"

export const PermitProjectScreen = observer(() => {
  const { currentPermitProject, error } = usePermitProject()
  const { permitProjectStore } = useMst()
  const location = useLocation()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const TABS_DATA: ITabItem[] = [
    { label: t("permitProject.details.overview"), icon: SquaresFour, to: "overview", tabIndex: 0 },
    { label: t("permitProject.details.permits"), icon: ClipboardText, to: "permits", tabIndex: 1 },
    { label: t("permitProject.details.localResources"), icon: Folder, to: "local-resources", tabIndex: 2 },
  ]

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
    if (!TABS_DATA.some((tab) => location.pathname.includes(tab.to))) {
      navigate("overview", { replace: true })
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    reset(getDefaultValues())
  }, [currentPermitProject, reset]) // Recalculate if title changes, as it might affect height

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

  const onSubmit = async (data: { title: string }) => {
    if (!currentPermitProject) return
    await updatePermitProject(currentPermitProject.id, { title: data.title })
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
            <RollupStatusBox project={currentPermitProject} w="240px" />
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
            {isPending ? <LoadingScreen /> : <OverviewTabPanelContent permitProject={currentPermitProject} />}
          </TabPanel>
          <TabPanel>
            {isPending ? <LoadingScreen /> : <PermitsTabPanelContent permitProject={currentPermitProject} />}
          </TabPanel>
          <TabPanel>
            {isPending ? <LoadingScreen /> : <LocalResourcesTabPanelContent permitProject={currentPermitProject} />}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
})

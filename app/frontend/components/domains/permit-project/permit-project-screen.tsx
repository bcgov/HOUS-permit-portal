import { Box, Container, Flex, IconButton, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react"
import { CaretLeft, ClipboardText, SquaresFour } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useLocation, useNavigate, useParams } from "react-router-dom"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditableInputWithControls } from "../../shared/editable-input-with-controls"
import { PhaseBox } from "../../shared/permit-projects/phase-box"
import { OverviewTabPanelContent } from "./overview-tab-panel-content"
import { PermitsTabPanelContent } from "./permits-tab-panel-content"
import { ITabItem, ProjectSidebar } from "./sidebar"

export const PermitProjectScreen = observer(() => {
  const { currentPermitProject, error } = usePermitProject()
  const { permitProjectStore } = useMst()
  const location = useLocation()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const params = useParams()

  const TABS_DATA: ITabItem[] = [
    { label: t("permitProject.details.overview"), icon: SquaresFour, to: "overview" },
    { label: t("permitProject.details.permits"), icon: ClipboardText, to: "permits" },
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

  const [headerHeight, setHeaderHeight] = useState(0)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!TABS_DATA.some((tab) => location.pathname.includes(tab.to))) {
      navigate("overview", { replace: true })
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
    reset(getDefaultValues())
  }, [currentPermitProject, reset]) // Recalculate if title changes, as it might affect height

  const getTabIndex = () => {
    const tabIndex = TABS_DATA.findIndex((tab) => location.pathname.includes(tab.to))
    return tabIndex === -1 ? 0 : tabIndex
  }

  const handleTabChange = (index: number) => {
    navigate(TABS_DATA[index].to, { replace: true })
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
      <Flex ref={headerRef} justify="space-between" align="center" py={6} borderBottom="1px" borderColor="border.light">
        <Container maxW="container.lg">
          <Flex align="center" h={24}>
            <IconButton
              as={RouterLink}
              to="/permit-projects"
              aria-label={t("permitProject.details.backToProjects")}
              icon={<CaretLeft size={24} />}
              variant="ghost"
              mr={2}
            />
            <EditableInputWithControls
              w="full"
              initialHint={t("permitProject.details.editProjectNameHint")}
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
                "aria-label": t("permitProject.details.editProjectName"),
                onSubmit: handleSubmit(onSubmit),
              }}
              editablePreviewProps={{
                fontWeight: 700,
                fontSize: "3xl",
              }}
              aria-label={t("permitProject.details.editProjectName")}
              onChange={(val) => setValue("title", val)}
            />
            <PhaseBox project={currentPermitProject} w="240px" />
          </Flex>
        </Container>
      </Flex>
      <Tabs w="full" flexGrow={1} index={getTabIndex()} onChange={handleTabChange} display="flex">
        <ProjectSidebar top={`${headerHeight}px`} p={0} tabsData={TABS_DATA} />
        <TabPanels>
          <TabPanel>
            <OverviewTabPanelContent permitProject={currentPermitProject} />
          </TabPanel>
          <TabPanel>
            <PermitsTabPanelContent permitProject={currentPermitProject} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
})

import { Box, Button, Flex, FormControl, FormLabel, HStack, Switch } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsAppDateFormat } from "../../../../constants"
import { useTemplateVersion } from "../../../../hooks/resources/use-template-version"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { BuilderBottomFloatingButtons } from "../builder-bottom-floating-buttons"
import { PublishScheduleModal } from "../publish-schedule-modal"
import { SectionsDisplay } from "../sections-display"
import { SectionsSidebar } from "../sections-sidebar"
import { SharePreviewPopover } from "../share-preview-popover"
import { useSectionHighlight } from "../use-section-highlight"
import { BuilderHeader } from "./base-edit-requirement-template-screen/builder-header"

const scrollToIdPrefix = "template-version-scroll-to-id-"
export const formScrollToId = (id: string) => `${scrollToIdPrefix}${id}`

export const TemplateVersionScreen = observer(function TemplateVersionScreen() {
  const { templateVersion, error } = useTemplateVersion()
  const denormalizedTemplate = templateVersion?.denormalizedTemplateJson
  const { t } = useTranslation()
  const { userStore, templateVersionStore, requirementTemplateStore } = useMst()
  const {
    rootContainerRef: rightContainerRef,
    sectionRefs,
    sectionIdToHighlight: currentSectionId,
  } = useSectionHighlight({ sections: denormalizedTemplate?.requirementTemplateSections })
  const [isCollapsedAll, setIsCollapsedAll] = useState(false)
  const [isTogglingPubliclyPreviewable, setIsTogglingPubliclyPreviewable] = useState(false)
  const navigate = useNavigate()

  const isSuperAdmin = !!userStore.currentUser?.isSuperAdmin
  const isDraft = !!templateVersion?.isDraft
  const requirementTemplateId = templateVersion?.requirementTemplateId

  // Load the parent RequirementTemplate when we're viewing a draft as a super
  // admin so the PublishScheduleModal has scheduledTemplateVersions /
  // nextAvailableScheduleDate to work with.
  useEffect(() => {
    if (!isDraft || !isSuperAdmin || !requirementTemplateId) return
    const existing = requirementTemplateStore.getRequirementTemplateById(requirementTemplateId)
    if (!existing?.isFullyLoaded) {
      requirementTemplateStore.fetchRequirementTemplate(requirementTemplateId).catch(() => {})
    }
  }, [isDraft, isSuperAdmin, requirementTemplateId, requirementTemplateStore])

  const requirementTemplate = requirementTemplateId
    ? (requirementTemplateStore.getRequirementTemplateById(requirementTemplateId) as IRequirementTemplate | undefined)
    : undefined

  const scheduledConflicts = useMemo(
    () =>
      requirementTemplate?.scheduledTemplateVersions?.map((tv) => ({
        id: tv.id,
        versionDate: new Date(tv.versionDate),
      })) ?? [],
    [requirementTemplate?.scheduledTemplateVersions?.length]
  )

  const showSchedulePublishControls = isDraft && isSuperAdmin && !!requirementTemplate?.isFullyLoaded

  const onScheduleConfirm = async (scheduleDate: Date) => {
    if (!requirementTemplate) return
    const updated = await requirementTemplateStore.promoteDraft(requirementTemplate.id, {
      versionDate: format(scheduleDate, datefnsAppDateFormat),
    })
    if (updated) {
      const scheduledTemplateVersion = (updated as IRequirementTemplate).scheduledTemplateVersions?.[0]
      scheduledTemplateVersion
        ? navigate(`/template-versions/${scheduledTemplateVersion.id}`)
        : navigate("/requirement-templates")
    }
  }

  const onForcePublishNow =
    import.meta.env.VITE_ENABLE_TEMPLATE_FORCE_PUBLISH === "true"
      ? async () => {
          if (!requirementTemplate) return
          const updated = await requirementTemplateStore.promoteDraft(requirementTemplate.id, {
            skipDateCheck: true,
          })
          if (updated) {
            const publishedTemplateVersion = (updated as IRequirementTemplate).publishedTemplateVersion
            publishedTemplateVersion
              ? navigate(`/template-versions/${publishedTemplateVersion.id}`)
              : navigate("/requirement-templates")
          }
        }
      : undefined

  if (error) return <ErrorScreen error={error} />
  if (!templateVersion?.isFullyLoaded) return <LoadingScreen />

  const templateSections = denormalizedTemplate?.requirementTemplateSections ?? []
  const hasNoSections = templateSections.length === 0

  const onClose = () => {
    window.history.state && window.history.state.idx > 0 ? navigate(-1) : navigate(`/requirement-templates`)
  }

  const handleTogglePubliclyPreviewable = async () => {
    if (!templateVersion) return
    setIsTogglingPubliclyPreviewable(true)
    try {
      await templateVersionStore.togglePubliclyPreviewable(templateVersion.id, !templateVersion.publiclyPreviewable)
    } finally {
      setIsTogglingPubliclyPreviewable(false)
    }
  }

  return (
    <Box as="main" id="view-template-version">
      <BuilderHeader
        breadCrumbs={[
          {
            href: "/template-versions",
            title: t("site.breadcrumb.templateVersions"),
          },
        ]}
        requirementTemplate={denormalizedTemplate}
        status={templateVersion.status}
        versionDate={templateVersion.versionDate}
        latestVersionId={templateVersion.latestVersionId}
      />
      <Box borderTop={"1px solid"} borderColor={"border.base"}>
        <SectionsSidebar
          sections={templateSections}
          onItemClick={scrollIntoView}
          sectionIdToHighlight={currentSectionId}
        />
        <Box
          bg={hasNoSections ? "greys.grey03" : undefined}
          ref={rightContainerRef}
          position={"relative"}
          display="flex"
          flexDirection="column"
        >
          <Flex
            position="sticky"
            zIndex="1"
            left="0"
            right="0"
            top="0"
            px="6"
            py="4"
            bg="greys.grey03"
            w="100%"
            justifyContent={"flex-end"}
            boxShadow={"elevations.elevation02"}
          >
            <HStack spacing={3}>
              {templateVersion.isDraft && isSuperAdmin && (
                <FormControl display="flex" alignItems="center" width="auto" mr={2}>
                  <FormLabel htmlFor="publicly-previewable-toggle" mb="0" mr={2} fontSize="sm">
                    {t("requirementTemplate.publiclyPreviewable.toggleLabel")}
                  </FormLabel>
                  <Switch
                    id="publicly-previewable-toggle"
                    isChecked={templateVersion.publiclyPreviewable}
                    isDisabled={isTogglingPubliclyPreviewable}
                    onChange={handleTogglePubliclyPreviewable}
                  />
                </FormControl>
              )}
              {templateVersion.isDraft && (
                <SharePreviewPopover draftTemplateVersion={templateVersion} variant="primary" />
              )}
              {showSchedulePublishControls && requirementTemplate && (
                <PublishScheduleModal
                  requirementTemplate={requirementTemplate}
                  minDate={requirementTemplate.nextAvailableScheduleDate}
                  scheduledConflicts={scheduledConflicts}
                  onScheduleConfirm={onScheduleConfirm}
                  onForcePublishNow={onForcePublishNow}
                  translationNamespace="templateVersionPreview.schedulePublish"
                  hideManageAccessButton
                />
              )}
              <RouterLinkButton to={`/template-versions/${templateVersion.id}/preview`} variant="secondary">
                {t("ui.view")}
              </RouterLinkButton>
              <Button variant={"secondary"} onClick={onClose}>
                {t("ui.close")}
              </Button>
            </HStack>
          </Flex>
          <FloatingHelpDrawer />

          <SectionsDisplay
            sections={templateSections}
            isCollapsedAll={isCollapsedAll}
            setSectionRef={setSectionRef}
            formScrollToId={formScrollToId}
          />
        </Box>
      </Box>
      <BuilderBottomFloatingButtons isCollapsedAll={isCollapsedAll} setIsCollapsedAll={setIsCollapsedAll} />
    </Box>
  )

  function scrollToTop() {
    rightContainerRef.current?.scrollTo({ behavior: "smooth", top: 0 })
  }

  function scrollIntoView(id: string) {
    const element = document.getElementById(formScrollToId(id))

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  function setSectionRef(el: HTMLElement, id: string) {
    sectionRefs.current[id] = el
  }
})

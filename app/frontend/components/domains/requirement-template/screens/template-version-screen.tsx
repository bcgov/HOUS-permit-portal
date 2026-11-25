import { Alert, AlertIcon, Box, Flex, HStack, Text } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsAppDateFormat } from "../../../../constants"
import { useTemplateVersion } from "../../../../hooks/resources/use-template-version"
import { IRequirementTemplate } from "../../../../models/requirement-template"
import { useMst } from "../../../../setup/root"
import { stickyBelowNavBar } from "../../../../styles/nav-bar-offset"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { FloatingHelpDrawer } from "../../../shared/floating-help-drawer"
import { BuilderBottomFloatingButtons } from "../builder-bottom-floating-buttons"
import { SectionsDisplay } from "../sections-display"
import { SectionsSidebar } from "../sections-sidebar"
import { SharePreviewPopover } from "../share-preview-popover"
import { useSectionHighlight } from "../use-section-highlight"
import { BuilderHeader } from "./base-edit-requirement-template-screen/builder-header"
import { TemplateVersionActionsMenu } from "./template-version-actions-menu"
import { TemplateVersionBlockActionsMenu } from "./template-version-block-actions-menu"
import { TemplateVersionGoToMenu } from "./template-version-go-to-menu"

const scrollToIdPrefix = "template-version-scroll-to-id-"
export const formScrollToId = (id: string) => `${scrollToIdPrefix}${id}`

export const TemplateVersionScreen = observer(function TemplateVersionScreen() {
  const { templateVersion, error } = useTemplateVersion()
  const denormalizedTemplate = templateVersion?.denormalizedTemplateJson
  const { t } = useTranslation()
  const { userStore, requirementTemplateStore } = useMst()
  const {
    rootContainerRef: rightContainerRef,
    setSectionRef,
    sectionIdToHighlight: currentSectionId,
  } = useSectionHighlight({ sections: denormalizedTemplate?.requirementTemplateSections })
  const [isCollapsedAll, setIsCollapsedAll] = useState(false)
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
  // Restore layout applies to any status; Promote/Discard stay draft-only inside the menu.
  const showActionsMenu = isSuperAdmin && !!requirementTemplateId

  const onSaveAndValidate = async () => {
    if (!templateVersion) return []
    return requirementTemplateStore.validateTemplateVersionConfig(templateVersion.id)
  }

  const onScheduleConfirm = async (scheduleDate: Date, changeNotes?: string) => {
    if (!templateVersion) return
    const updated = await requirementTemplateStore.promoteDraft(templateVersion.id, {
      versionDate: format(scheduleDate, datefnsAppDateFormat),
      changeNotes,
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
      ? async (changeNotes?: string) => {
          if (!templateVersion) return
          const updated = await requirementTemplateStore.promoteDraft(templateVersion.id, {
            skipDateCheck: true,
            changeNotes,
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

  return (
    <Box as="main" id="view-template-version">
      <BuilderHeader
        breadCrumbs={[
          {
            href: "/template-versions",
            title: t("site.breadcrumb.templateVersions"),
          },
          {
            href: `/template-versions/${templateVersion.id}`,
            title: t(`requirementTemplate.status.${templateVersion.status}`),
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
            {...stickyBelowNavBar()}
            px="6"
            py="4"
            bg="greys.grey03"
            w="100%"
            justifyContent={"flex-end"}
            boxShadow={"elevations.elevation02"}
          >
            <HStack spacing={3}>
              {templateVersion.isDraft && (
                <SharePreviewPopover draftTemplateVersion={templateVersion} variant="primary" />
              )}
              {showActionsMenu && (
                <TemplateVersionActionsMenu
                  templateVersion={templateVersion}
                  requirementTemplate={requirementTemplate}
                  showSchedulePublish={showSchedulePublishControls}
                  showDiscard={isDraft}
                  scheduledConflicts={scheduledConflicts}
                  onScheduleConfirm={onScheduleConfirm}
                  onForcePublishNow={onForcePublishNow}
                  onSaveAndValidate={onSaveAndValidate}
                />
              )}
              <TemplateVersionGoToMenu
                templateVersionId={templateVersion.id}
                requirementTemplateId={requirementTemplateId}
                showBuilder={isSuperAdmin && !!requirementTemplateId}
              />
            </HStack>
          </Flex>
          <FloatingHelpDrawer />
          {isDraft && isSuperAdmin && (
            <Alert status="info" m={6} mb={0} borderRadius="md" alignItems="flex-start">
              <AlertIcon mt={1} />
              <Text fontSize="sm">{t("templateVersionPreview.immutableVersionNotice")}</Text>
            </Alert>
          )}

          <SectionsDisplay
            sections={templateSections}
            isCollapsedAll={isCollapsedAll}
            setSectionRef={setSectionRef}
            formScrollToId={formScrollToId}
            renderEdit={
              isSuperAdmin && requirementTemplateId && templateVersion
                ? ({ denormalizedRequirementBlock }) => (
                    <TemplateVersionBlockActionsMenu
                      templateVersionId={templateVersion.id}
                      requirementTemplateId={requirementTemplateId}
                      requirementBlockId={denormalizedRequirementBlock.id}
                    />
                  )
                : undefined
            }
          />
        </Box>
      </Box>
      <BuilderBottomFloatingButtons isCollapsedAll={isCollapsedAll} setIsCollapsedAll={setIsCollapsedAll} />
    </Box>
  )

  function scrollIntoView(id: string) {
    const element = document.getElementById(formScrollToId(id))

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }
})

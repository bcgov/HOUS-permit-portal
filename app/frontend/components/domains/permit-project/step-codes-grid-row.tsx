import { Button, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import {
  Archive,
  ArrowSquareOut,
  ClockClockwise,
  DotsThreeVertical,
  Download,
  ShareNetwork,
} from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link as ReactRouterLink, useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { useMst } from "../../../setup/root"
import { IStepCode } from "../../../stores/step-code-store"
import { EFileUploadAttachmentType, EStepCodeChecklistStage, EStepCodeType } from "../../../types/enums"
import { downloadFileFromStorage } from "../../../utils/utility-functions"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"
import { StepCodeStageIndicators } from "./step-code-stage-indicators"

export const StepCodesGridRow = observer(({ stepCode }: { stepCode: IStepCode }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isSharing, setIsSharing] = useState(false)
  const { stepCodeStore } = useMst()
  const { type, permitProjectTitle, fullAddress, updatedAt, targetPath, isDiscarded } = stepCode as any

  const handleArchive = async (e?: React.MouseEvent | null) => {
    e?.stopPropagation()
    const success = await stepCode.archive()
    if (success) {
      await stepCodeStore.search()
    }
  }

  const handleRestore = async (e?: React.MouseEvent | null) => {
    e?.stopPropagation()
    const success = await stepCode.restore()
    if (success) {
      await stepCodeStore.search()
    }
  }

  const handleShareReport = async () => {
    setIsSharing(true)
    try {
      await (stepCode as any).shareReportWithJurisdiction()
    } finally {
      setIsSharing(false)
    }
  }

  const isNavigable = !isDiscarded && !!targetPath
  const stage = stepCode.currentStage || EStepCodeChecklistStage.preConstruction
  const stageLabel = t(`stepCodeChecklist.edit.projectInfo.stages.${stage}`)
  const latestReportDocument = stepCode.latestReportDocument
  const hasStaleReport = stepCode.reportDocuments?.some((doc) => doc.stale)

  const handleDownloadReport = () => {
    if (!latestReportDocument) return
    downloadFileFromStorage({
      model: EFileUploadAttachmentType.ReportDocument,
      modelId: latestReportDocument.id,
      filename: latestReportDocument.file?.metadata?.filename,
    })
  }

  return (
    <SearchGridRow isClickable={isNavigable} onClick={() => isNavigable && navigate(targetPath)}>
      {/* HUB-5145: The index shows only Part 3/Part 9 type today. As staged
      checklists become user-selectable, include the StepCode currentStage,
      stage-aware target paths, and report-document actions. */}
      <SearchGridItem>{t(`stepCode.types.${type as EStepCodeType}`)}</SearchGridItem>
      <SearchGridItem>{permitProjectTitle}</SearchGridItem>
      <SearchGridItem>{fullAddress}</SearchGridItem>
      <SearchGridItem>{updatedAt ? format(updatedAt, datefnsTableDateTimeFormat) : ""}</SearchGridItem>
      <SearchGridItem>
        <StepCodeStageIndicators stageCompletions={stepCode.stageCompletions} />
      </SearchGridItem>
      <SearchGridItem justifyContent="flex-end" px={2} onClick={(e) => e.stopPropagation()}>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label={t("ui.options")}
            icon={<DotsThreeVertical size={20} />}
            variant="ghost"
          />
          <MenuList>
            {isDiscarded ? (
              <ConfirmationModal
                title={t("ui.confirmRestore")}
                onConfirm={(closeModal) => {
                  handleRestore()
                  closeModal()
                }}
                renderTriggerButton={({ onClick }) => (
                  <MenuItem
                    icon={<ClockClockwise size={16} />}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClick(e)
                    }}
                    color="semantic.success"
                  >
                    {t("ui.restore")}
                  </MenuItem>
                )}
                renderConfirmationButton={(props) => (
                  <Button {...props} colorScheme="green">
                    {t("ui.restore")}
                  </Button>
                )}
              />
            ) : (
              <>
                {latestReportDocument ? (
                  <MenuItem icon={<Download size={16} />} onClick={handleDownloadReport}>
                    {t("stepCode.index.downloadStageReport", { stage: stageLabel })}
                  </MenuItem>
                ) : hasStaleReport ? (
                  <MenuItem _hover={{ cursor: "not-allowed" }}>
                    <Text>{t("stepCode.index.reportOutOfDate")}</Text>
                  </MenuItem>
                ) : (
                  <MenuItem _hover={{ cursor: "not-allowed" }}>
                    <Text>{t("stepCode.index.noReportAvailable")}</Text>
                  </MenuItem>
                )}

                {latestReportDocument && (stepCode as any)?.jurisdiction && (
                  <MenuItem icon={<ShareNetwork size={16} />} onClick={handleShareReport} isDisabled={isSharing}>
                    {isSharing ? t("stepCode.shareReport.sharing") : t("stepCode.shareReport.action")}
                  </MenuItem>
                )}

                <MenuItem
                  as={ReactRouterLink}
                  to={targetPath || "#"}
                  isDisabled={!targetPath}
                  icon={<ArrowSquareOut size={16} />}
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("ui.open")}
                </MenuItem>

                <ConfirmationModal
                  title={t("ui.confirmArchive")}
                  onConfirm={(closeModal) => {
                    handleArchive()
                    closeModal()
                  }}
                  renderTriggerButton={({ onClick }) => (
                    <MenuItem
                      icon={<Archive size={16} />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onClick(e)
                      }}
                      color="semantic.error"
                    >
                      {t("ui.archive")}
                    </MenuItem>
                  )}
                  renderConfirmationButton={(props) => (
                    <Button {...props} colorScheme="red">
                      {t("ui.archive")}
                    </Button>
                  )}
                />
              </>
            )}
          </MenuList>
        </Menu>
      </SearchGridItem>
    </SearchGridRow>
  )
})

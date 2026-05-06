import { Button, IconButton, Menu, Portal, Text } from "@chakra-ui/react"
import { Archive, ArrowSquareOut, ClockClockwise, DotsThreeVertical, ShareNetwork } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link as ReactRouterLink, useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { useMst } from "../../../setup/root"
import { IStepCode } from "../../../stores/step-code-store"
import { EFileUploadAttachmentType, EStepCodeType } from "../../../types/enums"
import { FileDownloadButton } from "../../shared/base/file-download-button"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"

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

  return (
    <SearchGridRow isClickable={isNavigable} onClick={() => isNavigable && navigate(targetPath)}>
      <SearchGridItem>{t(`stepCode.types.${type as EStepCodeType}`)}</SearchGridItem>
      <SearchGridItem>{permitProjectTitle}</SearchGridItem>
      <SearchGridItem>{fullAddress}</SearchGridItem>
      <SearchGridItem>{updatedAt ? format(updatedAt, datefnsTableDateTimeFormat) : ""}</SearchGridItem>
      <SearchGridItem justifyContent="flex-end" px={2} onClick={(e) => e.stopPropagation()}>
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              aria-label={t("ui.options")}
              icon={<DotsThreeVertical size={20} />}
              variant="ghost"
            ></IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {isDiscarded ? (
                  <ConfirmationModal
                    title={t("ui.confirmRestore")}
                    onConfirm={(closeModal) => {
                      handleRestore()
                      closeModal()
                    }}
                    renderTriggerButton={({ onClick }) => (
                      <Menu.Item
                        icon={<ClockClockwise size={16} />}
                        onSelect={(e) => {
                          e.stopPropagation()
                          onClick(e)
                        }}
                        color="semantic.success"
                        value="item-0"
                      >
                        {t("ui.restore")}
                      </Menu.Item>
                    )}
                    renderConfirmationButton={(props) => (
                      <Button {...props} colorPalette="green">
                        {t("ui.restore")}
                      </Button>
                    )}
                  />
                ) : (
                  <>
                    {(stepCode as any)?.reportDocuments?.length > 0 ? (
                      <FileDownloadButton
                        as={Menu.Item}
                        modelType={EFileUploadAttachmentType.ReportDocument}
                        document={(stepCode as any).reportDocuments[stepCode.reportDocuments.length - 1]}
                        variant="ghost"
                        size="sm"
                        simpleLabel
                        w="full"
                        display="flex"
                        justifyContent="flex-start"
                        textAlign="left"
                      />
                    ) : (
                      <Menu.Item _hover={{ cursor: "not-allowed" }} value="item-1">
                        <Text>{t("stepCode.index.noReportAvailable")}</Text>
                      </Menu.Item>
                    )}

                    {(stepCode as any)?.reportDocuments?.length > 0 && (stepCode as any)?.jurisdiction && (
                      <Menu.Item
                        icon={<ShareNetwork size={16} />}
                        onSelect={handleShareReport}
                        disabled={isSharing}
                        value="item-2"
                      >
                        {isSharing ? t("stepCode.shareReport.sharing") : t("stepCode.shareReport.action")}
                      </Menu.Item>
                    )}

                    <Menu.Item disabled={!targetPath} icon={<ArrowSquareOut size={16} />} value="item-3" asChild>
                      <ReactRouterLink to={targetPath || "#"} onSelect={(e) => e.stopPropagation()}>
                        {t("ui.open")}
                      </ReactRouterLink>
                    </Menu.Item>

                    <ConfirmationModal
                      title={t("ui.confirmArchive")}
                      onConfirm={(closeModal) => {
                        handleArchive()
                        closeModal()
                      }}
                      renderTriggerButton={({ onClick }) => (
                        <Menu.Item
                          icon={<Archive size={16} />}
                          onSelect={(e) => {
                            e.stopPropagation()
                            onClick(e)
                          }}
                          color="semantic.error"
                          value="item-4"
                        >
                          {t("ui.archive")}
                        </Menu.Item>
                      )}
                      renderConfirmationButton={(props) => (
                        <Button {...props} colorPalette="red">
                          {t("ui.archive")}
                        </Button>
                      )}
                    />
                  </>
                )}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </SearchGridItem>
    </SearchGridRow>
  )
})

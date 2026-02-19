import { Button, Grid, GridItem, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
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

  return (
    <Grid
      gridColumn="1 / -1"
      templateColumns="subgrid"
      display="grid"
      onClick={() => !isDiscarded && targetPath && navigate(targetPath)}
      _hover={{ bg: "greys.grey03", cursor: !isDiscarded && targetPath ? "pointer" : "default" }}
      borderBottom="1px"
      borderColor="border.light"
      _last={{ borderBottom: "none" }}
    >
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{t(`stepCode.types.${type as EStepCodeType}`)}</Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{permitProjectTitle}</Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{fullAddress}</Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{updatedAt ? format(updatedAt, datefnsTableDateTimeFormat) : ""}</Text>
      </GridItem>
      <GridItem
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        px={2}
        py={2}
        onClick={(e) => e.stopPropagation()}
      >
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
                {(stepCode as any)?.reportDocuments?.length > 0 ? (
                  <FileDownloadButton
                    as={MenuItem}
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
                  <MenuItem _hover={{ cursor: "not-allowed" }}>
                    <Text>{t("stepCode.index.noReportAvailable")}</Text>
                  </MenuItem>
                )}

                {(stepCode as any)?.reportDocuments?.length > 0 && (stepCode as any)?.jurisdiction && (
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
      </GridItem>
    </Grid>
  )
})

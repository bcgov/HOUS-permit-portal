import { Grid, GridItem, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { ArrowSquareOut, DotsThreeVertical, ShareNetwork } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link as ReactRouterLink, useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IStepCode } from "../../../stores/step-code-store"
import { EFileUploadAttachmentType, EStepCodeType } from "../../../types/enums"
import { FileDownloadButton } from "../../shared/base/file-download-button"

export const StepCodesGridRow = observer(({ stepCode }: { stepCode: IStepCode }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isSharing, setIsSharing] = useState(false)
  const { type, permitProjectTitle, fullAddress, updatedAt, targetPath } = stepCode as any

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
      onClick={() => targetPath && navigate(targetPath)}
      _hover={{ bg: "greys.grey03", cursor: targetPath ? "pointer" : "default" }}
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
          </MenuList>
        </Menu>
      </GridItem>
    </Grid>
  )
})

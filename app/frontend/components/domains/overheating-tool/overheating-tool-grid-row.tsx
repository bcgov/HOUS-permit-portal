import { Button, Flex, Grid, GridItem, Menu, MenuButton, MenuItem, MenuList, Spinner, Text } from "@chakra-ui/react"
import { Archive, ArrowSquareOut, ClockClockwise, DotsThreeVertical } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IOverheatingTool } from "../../../models/overheating-tool"
import { EFileUploadAttachmentType, EPdfGenerationStatus } from "../../../types/enums"
import { downloadFileFromStorage } from "../../../utils/utility-functions"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { RollupStatusTag } from "../../shared/permit-projects/rollup-status-tag"

interface IOverheatingToolGridRowProps {
  overheatingTool: IOverheatingTool
  onArchiveTool: (id: string) => void
  onRestoreTool: (id: string) => void
  isGenerating?: boolean
}

export const OverheatingToolGridRow = observer(function OverheatingToolGridRow({
  overheatingTool,
  onArchiveTool,
  onRestoreTool,
  isGenerating: isGeneratingProp,
}: IOverheatingToolGridRowProps) {
  const { t } = useTranslation() as any
  const navigate = useNavigate()

  const hasPdf = !!overheatingTool.pdfFileData
  const isDiscarded = overheatingTool.isDiscarded

  const isGenerating =
    isGeneratingProp ||
    overheatingTool.pdfGenerationStatus === EPdfGenerationStatus.queued ||
    overheatingTool.pdfGenerationStatus === EPdfGenerationStatus.generating

  return (
    <Grid
      gridColumn="1 / -1"
      templateColumns="subgrid"
      display="grid"
      borderBottom="1px"
      borderColor="border.light"
      _last={{ borderBottom: "none" }}
      _hover={{
        bg: "greys.grey03",
      }}
    >
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text w="300px" fontWeight="bold">
          {overheatingTool.formJson?.projectNumber}
        </Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text w="400px" fontWeight="bold">
          {overheatingTool.formJson?.buildingLocation?.address}
        </Text>
      </GridItem>

      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text w="360px">{overheatingTool.createdAt?.toLocaleDateString()}</Text>
      </GridItem>

      <GridItem display="flex" alignItems="center" px={4} py={2}>
        {overheatingTool.rollupStatus && <RollupStatusTag rollupStatus={overheatingTool.rollupStatus as any} />}
      </GridItem>

      <GridItem display="flex" alignItems="center" justifyContent="flex-end" px={2} py={2} w="100%">
        <Flex align="center" justify="flex-end" w="full">
          {isGenerating && <Spinner size="sm" color="blue.500" mr={2} />}
          <Menu>
            <MenuButton as={Button} variant="ghost" size="sm" aria-label="More actions" isDisabled={isGenerating}>
              <DotsThreeVertical size={16} />
            </MenuButton>
            <MenuList minW="160px">
              {overheatingTool.rollupStatus === "new_draft" && (
                <ManageMenuItemButton
                  leftIcon={<ArrowSquareOut size={16} />}
                  onClick={() => navigate(`/overheating-tool/start?toolId=${overheatingTool.id}`)}
                >
                  {t("ui.view")}
                </ManageMenuItemButton>
              )}
              {hasPdf && (
                <ManageMenuItemButton
                  leftIcon={<ArrowSquareOut size={16} />}
                  onClick={() =>
                    downloadFileFromStorage({
                      model: EFileUploadAttachmentType.OverheatingTool,
                      modelId: overheatingTool.id,
                      filename:
                        overheatingTool.pdfFileData?.metadata?.filename || `overheating_tool_${overheatingTool.id}.pdf`,
                    })
                  }
                >
                  Open
                </ManageMenuItemButton>
              )}
              {isDiscarded ? (
                <ConfirmationModal
                  title={t("ui.confirmRestore")}
                  onConfirm={(closeModal) => {
                    onRestoreTool(overheatingTool.id)
                    closeModal()
                  }}
                  renderTriggerButton={({ onClick }) => (
                    <MenuItem
                      icon={<ClockClockwise size={16} />}
                      color="semantic.success"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClick(e)
                      }}
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
                <ConfirmationModal
                  title={t("ui.confirmArchive")}
                  body={t("ui.archiveRetentionNotice" as any)}
                  onConfirm={(closeModal) => {
                    onArchiveTool(overheatingTool.id)
                    closeModal()
                  }}
                  renderTriggerButton={({ onClick }) => (
                    <MenuItem
                      icon={<Archive size={16} />}
                      color="semantic.error"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClick(e)
                      }}
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
              )}
            </MenuList>
          </Menu>
        </Flex>
      </GridItem>
    </Grid>
  )
})

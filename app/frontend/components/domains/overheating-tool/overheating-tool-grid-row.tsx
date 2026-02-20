import { Button, Flex, Grid, GridItem, Menu, MenuButton, MenuList, Spinner, Text } from "@chakra-ui/react"
import { Archive, ArrowSquareOut, DotsThree } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IOverheatingTool } from "../../../models/overheating-tool"
import { EFileUploadAttachmentType, EPdfGenerationStatus } from "../../../types/enums"
import { downloadFileFromStorage } from "../../../utils/utility-functions"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"

interface IOverheatingToolGridRowProps {
  overheatingTool: IOverheatingTool
  onArchiveTool: (id: string) => void
  isGenerating?: boolean
}

export const OverheatingToolGridRow = observer(function OverheatingToolGridRow({
  overheatingTool,
  onArchiveTool,
  isGenerating: isGeneratingProp,
}: IOverheatingToolGridRowProps) {
  const { t } = useTranslation() as any

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

      <GridItem display="flex" alignItems="center" justifyContent="flex-end" px={2} py={2} w="100%">
        <Flex align="center" justify="flex-end" w="full">
          {isGenerating && <Spinner size="sm" color="blue.500" mr={2} />}
          <Menu>
            <MenuButton as={Button} variant="ghost" size="sm" aria-label="More actions" isDisabled={isGenerating}>
              <DotsThree size={16} />
            </MenuButton>
            <MenuList minW="160px">
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
              {!isDiscarded && (
                <ManageMenuItemButton
                  leftIcon={<Archive size={16} />}
                  onClick={() => onArchiveTool(overheatingTool.id)}
                >
                  Archive
                </ManageMenuItemButton>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </GridItem>
    </Grid>
  )
})

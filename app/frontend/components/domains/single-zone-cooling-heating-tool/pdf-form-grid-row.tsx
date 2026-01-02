import { Button, Flex, Grid, GridItem, Menu, MenuButton, MenuList, Spinner, Text } from "@chakra-ui/react"
import { Archive, ArrowSquareOut, DotsThree } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPdfForm } from "../../../models/pdf-form"
import { EFileUploadAttachmentType, EPdfGenerationStatus } from "../../../types/enums"
import { downloadFileFromStorage } from "../../../utils/utility-functions"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"

interface IPdfFormGridRowProps {
  pdfForm: IPdfForm
  onArchivePdf: (id: string) => void
  isGenerating?: boolean
}

export const PdfFormGridRow = observer(function PdfFormGridRow({
  pdfForm,
  onArchivePdf,
  isGenerating: isGeneratingProp,
}: IPdfFormGridRowProps) {
  const { t } = useTranslation() as any

  const hasPdf = !!pdfForm.pdfFileData
  const isArchived = pdfForm.status === false

  const isGenerating =
    isGeneratingProp ||
    pdfForm.pdfGenerationStatus === EPdfGenerationStatus.queued ||
    pdfForm.pdfGenerationStatus === EPdfGenerationStatus.generating

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
          {pdfForm.formJson?.projectNumber}
        </Text>
      </GridItem>
      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text w="400px" fontWeight="bold">
          {[
            pdfForm.formJson?.buildingLocation?.city,
            pdfForm.formJson?.buildingLocation?.province,
            pdfForm.formJson?.buildingLocation?.postalCode,
          ]
            .filter((p) => !!p && String(p).trim() !== "")
            .join(", ")}
        </Text>
      </GridItem>

      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text w="360px">{pdfForm.createdAt?.toLocaleDateString()}</Text>
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
                      model: EFileUploadAttachmentType.PdfForm,
                      modelId: pdfForm.id,
                      filename: pdfForm.pdfFileData?.metadata?.filename || `pdf_form_${pdfForm.id}.pdf`,
                    })
                  }
                >
                  Open
                </ManageMenuItemButton>
              )}
              {!isArchived && (
                <ManageMenuItemButton leftIcon={<Archive size={16} />} onClick={() => onArchivePdf(pdfForm.id)}>
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

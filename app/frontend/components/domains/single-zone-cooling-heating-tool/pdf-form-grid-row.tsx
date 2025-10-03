import { Button, Flex, Grid, GridItem, Menu, MenuButton, MenuList, Spinner, Text } from "@chakra-ui/react"
import { DotsThree, Download } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPdfForm } from "../../../models/pdf-form"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"

interface IPdfFormGridRowProps {
  pdfForm: IPdfForm
  onGeneratePdf: (id: string) => void
  onDownloadPdf: (id: string) => void
  isGenerating: boolean
  isDownloaded: boolean
}

export const PdfFormGridRow = observer(function PdfFormGridRow({
  pdfForm,
  onGeneratePdf,
  onDownloadPdf,
  isGenerating,
  isDownloaded,
}: IPdfFormGridRowProps) {
  const { t } = useTranslation() as any
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
        <Text fontWeight="bold">{pdfForm.formJson?.projectNumber || pdfForm.formType}</Text>
      </GridItem>

      <GridItem display="flex" alignItems="center" px={4} py={2}>
        <Text>{pdfForm.createdAt?.toLocaleDateString()}</Text>
      </GridItem>

      <GridItem display="flex" alignItems="end" justifyContent="end" px={4} py={2}>
        <Flex align="center">
          {isGenerating && <Spinner size="sm" color="blue.500" mr={2} />}
          <Menu>
            <MenuButton as={Button} variant="ghost" size="sm" aria-label="More actions" isDisabled={isGenerating}>
              <DotsThree size={16} />
            </MenuButton>
            <MenuList minW="160px">
              {!isDownloaded && (
                <ManageMenuItemButton
                  leftIcon={<Download size={16} />}
                  onClick={() => onGeneratePdf(pdfForm.id)}
                  isDisabled={isGenerating}
                >
                  {isGenerating ? "Generating PDF..." : "Generate PDF"}
                </ManageMenuItemButton>
              )}
              {isDownloaded && (
                <>
                  <ManageMenuItemButton
                    leftIcon={<Download size={16} />}
                    onClick={() => onGeneratePdf(pdfForm.id)}
                    isDisabled={isGenerating}
                  >
                    {isGenerating ? "Regenerating PDF..." : "Regenerate PDF"}
                  </ManageMenuItemButton>
                  <ManageMenuItemButton leftIcon={<Download size={16} />} onClick={() => onDownloadPdf(pdfForm.id)}>
                    Download PDF
                  </ManageMenuItemButton>
                </>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </GridItem>
    </Grid>
  )
})

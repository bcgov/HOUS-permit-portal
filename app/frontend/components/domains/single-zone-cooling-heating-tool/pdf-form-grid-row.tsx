import { Button, Flex, Grid, GridItem, Menu, MenuButton, MenuList, Spinner, Text } from "@chakra-ui/react"
import { Archive, ArrowSquareOut, DotsThree, Download } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IPdfForm } from "../../../models/pdf-form"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"

interface IPdfFormGridRowProps {
  pdfForm: IPdfForm
  onGeneratePdf: (id: string) => void
  onDownloadPdf: (id: string) => void
  onArchivePdf: (id: string) => void
  isGenerating: boolean
  isDownloaded: boolean
}

export const PdfFormGridRow = observer(function PdfFormGridRow({
  pdfForm,
  onGeneratePdf,
  onDownloadPdf,
  onArchivePdf,
  isGenerating,
  isDownloaded,
}: IPdfFormGridRowProps) {
  const { t } = useTranslation() as any
  const [hasPdf, setHasPdf] = useState(false)
  const [isArchived, setIsArchived] = useState(false)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch(`/api/pdf_forms/${pdfForm.id}/download`, { method: "HEAD" })
        if (!cancelled) setHasPdf(res.ok)
      } catch (_) {
        if (!cancelled) setHasPdf(false)
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [pdfForm.id])

  useEffect(() => {
    setIsArchived(pdfForm.status === false)
  }, [pdfForm.status])

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
          {pdfForm.formJson?.buildingLocation?.address}
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
              {!isDownloaded && (
                <ManageMenuItemButton
                  leftIcon={<Download size={16} />}
                  onClick={() => onGeneratePdf(pdfForm.id)}
                  isDisabled={isGenerating}
                >
                  {isGenerating ? "Generating PDF..." : "Download"}
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
              {hasPdf && !isArchived && (
                <>
                  <ManageMenuItemButton
                    leftIcon={<ArrowSquareOut size={16} />}
                    onClick={() => window.open(`/api/pdf_forms/${pdfForm.id}/download`, "_blank", "noopener")}
                  >
                    Open
                  </ManageMenuItemButton>
                  <ManageMenuItemButton leftIcon={<Archive size={16} />} onClick={() => onArchivePdf(pdfForm.id)}>
                    Archive
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

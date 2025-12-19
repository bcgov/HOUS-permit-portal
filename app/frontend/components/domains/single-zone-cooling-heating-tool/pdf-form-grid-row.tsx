import { Button, Flex, Grid, GridItem, Menu, MenuButton, MenuList, Spinner, Text } from "@chakra-ui/react"
import { Archive, ArrowSquareOut, DotsThree } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IPdfForm } from "../../../models/pdf-form"
import { ManageMenuItemButton } from "../../shared/base/manage-menu-item"

interface IPdfFormGridRowProps {
  pdfForm: IPdfForm
  onArchivePdf: (id: string) => void
  isGenerating: boolean
}

export const PdfFormGridRow = observer(function PdfFormGridRow({
  pdfForm,
  onArchivePdf,
  isGenerating,
}: IPdfFormGridRowProps) {
  const { t } = useTranslation() as any
  const [hasPdf, setHasPdf] = useState(false)
  const [isArchived, setIsArchived] = useState(false)

  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        // [OVERHEATING REVIEW] Mini-lesson: avoid using `HEAD` against a download endpoint.
        // Rails will route HEAD -> the same controller action, which can still do heavy work
        // (and here it may even read the file). Prefer a lightweight “status” field from the API
        // (e.g. `pdfFileData` present / `status` enum) or a dedicated metadata endpoint.
        //
        // Lead note: we also generally avoid `fetch` directly inside `useEffect` in this codebase.
        // Prefer store actions (MST flows), or a shared utility/service method, so side effects are centralized
        // and errors/loading are handled consistently.
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
              {hasPdf && !isArchived && (
                <>
                  <ManageMenuItemButton
                    leftIcon={<ArrowSquareOut size={16} />}
                    // [OVERHEATING REVIEW] Mini-lesson: reuse the centralized download component.
                    // Elsewhere we use `FileDownloadButton` -> `downloadFileFromStorage` (presigned URL + consistent errors).
                    // `window.open` bypasses that and can produce confusing blank tabs on 403/404.
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

import { Grid, GridItem, IconButton, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react"
import { ArrowSquareOut, CloudArrowDown, DotsThreeVertical, Warning } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IPreCheck } from "../../../models/pre-check"
import { downloadFileFromUrl } from "../../../utils/utility-functions"

interface IPreCheckGridRowProps {
  preCheck: IPreCheck
}

export const PreCheckGridRow = observer(({ preCheck }: IPreCheckGridRowProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleOpenInteractiveReport = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/pre-checks/${preCheck.id}/viewer`)
  }

  const handleDownloadReport = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const pdfUrl = await preCheck.fetchPdfReportUrl()
      if (pdfUrl) {
        downloadFileFromUrl(pdfUrl, `pre-check-report-${preCheck.id}.pdf`)
      } else {
        console.error("Failed to get PDF report URL")
      }
    } catch (error) {
      console.error("Error downloading PDF report:", error)
    }
  }

  return (
    <>
      <Grid
        gridColumn="1 / -1"
        templateColumns="subgrid"
        display="grid"
        onClick={() => navigate(`/pre-checks/${preCheck.id}/edit`)}
        _hover={{
          bg: "greys.grey03",
          cursor: "pointer",
        }}
        borderBottom="1px"
        borderColor="border.light"
        _last={{ borderBottom: "none" }}
      >
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{preCheck.fullAddress || "—"}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          <Text>{preCheck.title || "—"}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2}>
          {preCheck.updatedAt && format(preCheck.updatedAt, datefnsTableDateTimeFormat)}
        </GridItem>
        <GridItem display="flex" alignItems="center" px={4} py={2} textTransform="capitalize">
          <Text>{preCheck.status || "—"}</Text>
        </GridItem>
        <GridItem display="flex" alignItems="center" justifyContent="flex-end" px={4} py={2}>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label={t("ui.options")}
              icon={<DotsThreeVertical size={24} />}
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList>
              <MenuItem
                icon={<ArrowSquareOut size={16} />}
                onClick={handleOpenInteractiveReport}
                isDisabled={!preCheck.isCompleted || preCheck.expired}
              >
                {t("preCheck.index.openInteractiveReport", "Open interactive report")}
              </MenuItem>
              <MenuItem
                icon={<CloudArrowDown size={16} />}
                onClick={handleDownloadReport}
                isDisabled={!preCheck.isCompleted || preCheck.expired}
              >
                {t("preCheck.index.downloadReport", "Download report")}
              </MenuItem>
              {preCheck.expired && (
                <MenuItem
                  icon={<Warning size={16} />}
                  _hover={{ cursor: "not-allowed" }}
                  color="semantic.error"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("preCheck.index.expired", "This pre-check is expired")}
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </GridItem>
      </Grid>
    </>
  )
})

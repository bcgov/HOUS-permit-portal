import { IconButton, Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react"
import { ArrowSquareOut, CloudArrowDown, DotsThreeVertical, Warning } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { datefnsTableDateTimeFormat } from "../../../constants"
import { IPreCheck } from "../../../models/pre-check"
import { downloadFileFromUrl } from "../../../utils/utility-functions"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"

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
    <SearchGridRow onClick={() => navigate(`/pre-checks/${preCheck.id}/edit`)}>
      <SearchGridItem>{preCheck.fullAddress || "—"}</SearchGridItem>
      <SearchGridItem>{preCheck.title || "—"}</SearchGridItem>
      <SearchGridItem>{preCheck.updatedAt && format(preCheck.updatedAt, datefnsTableDateTimeFormat)}</SearchGridItem>
      <SearchGridItem textTransform="capitalize">{preCheck.status || "—"}</SearchGridItem>
      <SearchGridItem justifyContent="flex-end">
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
      </SearchGridItem>
    </SearchGridRow>
  )
})

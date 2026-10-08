import { Box, Button, Container, Flex, Heading, Menu, MenuButton, MenuList, VStack } from "@chakra-ui/react"
import { FileCsv } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EStepCodeType } from "../../../../types/enums"
import { ManageMenuItemButton } from "../../../shared/base/manage-menu-item"
import { SearchInput } from "../../../shared/base/search-input"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { GridHeaders } from "./grid-header"

type TReportGroup = "platform" | "permits" | "stepCodes" | "jurisdictions" | "users"

interface IReportRow {
  id: string
  name: string
  description: string
  href?: string
  downloads?: Array<{ text: string; onClick: () => void }>
}

const REPORT_GROUPS: { key: TReportGroup; ids: string[] }[] = [
  { key: "platform", ids: ["application_growth", "platform_health", "storage_footprint"] },
  {
    key: "permits",
    ids: [
      "jurisdiction_volume",
      "draft_completion",
      "review_process",
      "template_usage",
      "template_stall",
      "template-summary",
      "application-metrics",
    ],
  },
  {
    key: "stepCodes",
    ids: ["step_code_part_9", "step-code-data", "step-code-summary", "step-code-metrics"],
  },
  { key: "jurisdictions", ids: ["jurisdiction_enablement"] },
  { key: "users", ids: ["accounts", "submitter_adoption", "pre-check-user-consent"] },
]

const GROUPED_IDS = new Set(REPORT_GROUPS.flatMap((group) => group.ids))

export const ReportingScreen = observer(() => {
  const { t } = useTranslation()
  const { stepCodeStore, permitApplicationStore, preCheckStore, reportStore } = useMst()
  const { downloadStepCodeSummary, downloadStepCodeMetrics } = stepCodeStore
  const { downloadApplicationMetrics } = permitApplicationStore
  const { downloadPreCheckUserConsent } = preCheckStore

  const [filter, setFilter] = useState("")

  useEffect(() => {
    reportStore.fetchSummaries()
  }, [])

  const reportTypes: IReportRow[] = [
    ...reportStore.summaries.map((summary) => ({
      id: summary.key,
      name: summary.title,
      description: summary.description,
      href: summary.key,
    })),
    {
      id: "template-summary",
      name: t("reporting.templateSummary.name"),
      description: t("reporting.templateSummary.description"),
      href: "export-template-summary",
    },
    {
      id: "step-code-data",
      name: t("reporting.stepCodeData.name"),
      description: t("reporting.stepCodeData.description"),
      href: "step-code-data",
    },
    {
      id: "step-code-summary",
      name: t("reporting.stepCodeSummary.name"),
      description: t("reporting.stepCodeSummary.description"),
      downloads: [
        {
          text: t("ui.download"),
          onClick: downloadStepCodeSummary,
        },
      ],
    },
    {
      id: "application-metrics",
      name: t("reporting.applicationMetrics.name"),
      description: t("reporting.applicationMetrics.description"),
      downloads: [
        {
          text: t("ui.download"),
          onClick: downloadApplicationMetrics,
        },
      ],
    },
    {
      id: "step-code-metrics",
      name: t("reporting.stepCodeMetrics.name"),
      description: t("reporting.stepCodeMetrics.description"),
      downloads: [
        {
          text: t("reporting.stepCodeMetrics.downloadPart3"),
          onClick: () => downloadStepCodeMetrics(EStepCodeType.part3StepCode),
        },
        {
          text: t("reporting.stepCodeMetrics.downloadPart9"),
          onClick: () => downloadStepCodeMetrics(EStepCodeType.part9StepCode),
        },
      ],
    },
    {
      id: "pre-check-user-consent",
      name: t("reporting.preCheckUserConsent.name"),
      description: t("reporting.preCheckUserConsent.description"),
      downloads: [
        {
          text: t("ui.download"),
          onClick: downloadPreCheckUserConsent,
        },
      ],
    },
  ]

  const matchesFilter = (row: IReportRow) => row.name.toLowerCase().includes(filter.toLowerCase())
  const rowsById = new Map(reportTypes.map((row) => [row.id, row]))
  const groups = REPORT_GROUPS.map((group) => ({
    key: group.key,
    rows: group.ids.flatMap((id) => {
      const row = rowsById.get(id)
      return row && matchesFilter(row) ? [row] : []
    }),
  })).filter((group) => group.rows.length > 0)
  const ungrouped = reportTypes.filter((row) => !GROUPED_IDS.has(row.id) && matchesFilter(row))

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h1">{t("reporting.title")}</Heading>
          </Box>
        </Flex>

        <SearchGrid
          templateColumns="repeat(3, 1fr)"
          toolbar={
            <SearchInput
              query={filter}
              onQueryChange={(query) => setFilter(query ?? "")}
              label={t("reporting.searchLabel")}
            />
          }
        >
          <GridHeaders />

          {groups.map((group) => (
            <React.Fragment key={group.key}>
              <Box role="row" display="contents">
                <SearchGridItem gridColumn="1 / -1" bg="greys.grey03" py={2}>
                  <Heading as="h4" aria-level={2} fontSize="xxs" fontWeight="semibold" color="text.secondary">
                    {t(`reporting.groups.${group.key}`)}
                  </Heading>
                </SearchGridItem>
              </Box>
              {group.rows.map((reportType) => (
                <ReportIndexRow
                  key={reportType.id}
                  reportType={reportType}
                  viewLabel={t("ui.view")}
                  manageLabel={t("ui.manage")}
                />
              ))}
            </React.Fragment>
          ))}
          {ungrouped.map((reportType) => (
            <ReportIndexRow
              key={reportType.id}
              reportType={reportType}
              viewLabel={t("ui.view")}
              manageLabel={t("ui.manage")}
            />
          ))}
        </SearchGrid>
      </VStack>
    </Container>
  )
})

function ReportIndexRow({
  reportType,
  viewLabel,
  manageLabel,
}: {
  reportType: IReportRow
  viewLabel: string
  manageLabel: string
}) {
  return (
    <Box className={"reporting-index-grid-row"} role={"row"} display={"contents"}>
      <SearchGridItem>{reportType.name}</SearchGridItem>
      <SearchGridItem>{reportType.description}</SearchGridItem>
      <SearchGridItem>
        {reportType.href ? (
          <RouterLinkButton variant="link" to={reportType.href}>
            {viewLabel}
          </RouterLinkButton>
        ) : (
          <Menu>
            <MenuButton as={Button} aria-label="manage" variant="link">
              {manageLabel}
            </MenuButton>
            <MenuList>
              {reportType.downloads?.map((item, index) => (
                <ManageMenuItemButton key={index} leftIcon={<FileCsv size={24} />} onClick={item.onClick}>
                  {item.text}
                </ManageMenuItemButton>
              ))}
            </MenuList>
          </Menu>
        )}
      </SearchGridItem>
    </Box>
  )
}

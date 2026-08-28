import { Box, Button, Container, Flex, Heading, Input, Menu, MenuButton, MenuList, VStack } from "@chakra-ui/react"
import { FileCsv } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EStepCodeType } from "../../../../types/enums"
import { ManageMenuItemButton } from "../../../shared/base/manage-menu-item"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { GridHeaders } from "./grid-header"

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

  interface IReportRow {
    name: string
    description: string
    href?: string
    downloads?: Array<{ text: string; onClick: () => void }>
  }

  const reportTypes: IReportRow[] = [
    ...reportStore.summaries.map((summary) => ({
      name: summary.title,
      description: summary.description,
      href: summary.key,
    })),
    {
      name: t("reporting.templateSummary.name"),
      description: t("reporting.templateSummary.description"),
      href: "export-template-summary",
    },
    {
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

  const filteredReportTypes = reportTypes.filter((type) => type.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <Heading as="h1">{t("reporting.title")}</Heading>
          </Box>
        </Flex>

        <SearchGrid templateColumns="repeat(3, 1fr)">
          <GridHeaders
            renderFilterInput={() => {
              return (
                <Input
                  maxW="50%"
                  bg="white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={t("reporting.filterPlaceholder")}
                />
              )
            }}
          />

          {filteredReportTypes.map((reportType) => {
            return (
              <Box key={reportType.name} className={"reporting-index-grid-row"} role={"row"} display={"contents"}>
                <SearchGridItem>{reportType.name}</SearchGridItem>
                <SearchGridItem>{reportType.description}</SearchGridItem>
                <SearchGridItem>
                  {reportType.href ? (
                    <RouterLinkButton variant="link" to={reportType.href}>
                      {t("ui.view")}
                    </RouterLinkButton>
                  ) : (
                    <Menu>
                      <MenuButton as={Button} aria-label="manage" variant="link">
                        {t("ui.manage")}
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
          })}
        </SearchGrid>
      </VStack>
    </Container>
  )
})

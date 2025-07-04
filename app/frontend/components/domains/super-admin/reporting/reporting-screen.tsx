import { Box, Button, Container, Flex, Heading, Input, Menu, MenuButton, MenuList, VStack } from "@chakra-ui/react"
import { FileCsv } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EStepCodeType } from "../../../../types/enums"
import { ManageMenuItem, ManageMenuItemButton } from "../../../shared/base/manage-menu-item"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { GridHeaders } from "./grid-header"

export const ReportingScreen = observer(() => {
  const { t } = useTranslation()
  const { stepCodeStore, permitApplicationStore } = useMst()
  const { downloadStepCodeSummary, downloadStepCodeMetrics } = stepCodeStore
  const { downloadApplicationMetrics } = permitApplicationStore

  const [filter, setFilter] = useState("")

  interface IReportBase {
    name: string
    description: string
    dropdown: Array<{
      text: string
      onClick?: () => void
      href?: string
    }>
  }

  type TReport = IReportBase
  const reportTypes: TReport[] = [
    {
      name: t("reporting.templateSummary.name"),
      description: t("reporting.templateSummary.description"),
      dropdown: [
        {
          text: t("ui.open"),
          href: "export-template-summary",
        },
      ],
    },
    {
      name: t("reporting.stepCodeSummary.name"),
      description: t("reporting.stepCodeSummary.description"),
      dropdown: [
        {
          text: t("ui.download"),
          onClick: downloadStepCodeSummary,
        },
      ],
    },
    {
      name: t("reporting.applicationMetrics.name"),
      description: t("reporting.applicationMetrics.description"),
      dropdown: [
        {
          text: t("ui.download"),
          onClick: downloadApplicationMetrics,
        },
      ],
    },
    {
      name: t("reporting.stepCodeMetrics.name"),
      description: t("reporting.stepCodeMetrics.description"),
      dropdown: [
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
                  {
                    <Menu>
                      <MenuButton as={Button} aria-label="manage" variant="link">
                        {t("ui.manage")}
                      </MenuButton>
                      <MenuList>
                        {reportType.dropdown.map((item, index) =>
                          item.href ? (
                            <ManageMenuItem key={index} icon={<FileCsv size={24} />} to={item.href}>
                              {item.text}
                            </ManageMenuItem>
                          ) : (
                            <ManageMenuItemButton key={index} leftIcon={<FileCsv size={24} />} onClick={item.onClick}>
                              {item.text}
                            </ManageMenuItemButton>
                          )
                        )}
                      </MenuList>
                    </Menu>
                  }
                </SearchGridItem>
              </Box>
            )
          })}
        </SearchGrid>
      </VStack>
    </Container>
  )
})

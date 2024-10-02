import { Box, Button, Container, Flex, Heading, Input, Menu, MenuButton, MenuList, VStack } from "@chakra-ui/react"
import { FileCsv } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { ManageMenuItem, ManageMenuItemButton } from "../../../shared/base/manage-menu-item"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { GridHeaders } from "./grid-header"

export const ReportingScreen = observer(() => {
  const { t } = useTranslation()
  const { stepCodeStore } = useMst()
  const { downloadStepCodeSummary, downloadApplicationMetrics } = stepCodeStore

  const [filter, setFilter] = useState("")

  interface IReportBase {
    name: string
    description: string
  }

  interface IReportWithHref extends IReportBase {
    href: string
    onClick?: never
  }

  interface IReportWithOnClick extends IReportBase {
    href?: never
    onClick: () => any
  }

  type TReport = IReportWithHref | IReportWithOnClick
  const reportTypes: TReport[] = [
    {
      name: t("reporting.templateSummary.name"),
      description: t("reporting.templateSummary.description"),
      href: "export-template-summary",
    },
    {
      name: t("reporting.stepCodeSummary.name"),
      description: t("reporting.stepCodeSummary.description"),
      onClick: downloadStepCodeSummary,
    },
    {
      name: t("reporting.applicationMetrics.name"),
      description: t("reporting.applicationMetrics.description"),
      onClick: downloadApplicationMetrics,
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
              <Box key={reportType.href} className={"reporting-index-grid-row"} role={"row"} display={"contents"}>
                <SearchGridItem>{reportType.name}</SearchGridItem>
                <SearchGridItem>{reportType.description}</SearchGridItem>
                <SearchGridItem>
                  {
                    <Menu>
                      <MenuButton as={Button} aria-label="manage" variant="link">
                        {t("ui.manage")}
                      </MenuButton>
                      <MenuList>
                        {reportType.onClick ? (
                          <ManageMenuItemButton leftIcon={<FileCsv size={24} />} onClick={reportType.onClick}>
                            {t("ui.download")}
                          </ManageMenuItemButton>
                        ) : (
                          <ManageMenuItem icon={<FileCsv size={24} />} to={reportType.href}>
                            {t("ui.open")}
                          </ManageMenuItem>
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

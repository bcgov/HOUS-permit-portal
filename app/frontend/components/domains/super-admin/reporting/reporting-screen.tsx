import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react"
import { BracketsCurly, FileCsv } from "@phosphor-icons/react"
import { subDays } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EStepCodeType } from "../../../../types/enums"
import { ManageMenuItem, ManageMenuItemButton } from "../../../shared/base/manage-menu-item"
import { DatePicker } from "../../../shared/date-picker"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { GridHeaders } from "./grid-header"

export const ReportingScreen = observer(() => {
  const { t } = useTranslation()
  const { stepCodeStore, permitApplicationStore } = useMst()
  const { downloadStepCodeSummary, downloadStepCodeMetrics } = stepCodeStore
  const { downloadApplicationMetrics } = permitApplicationStore

  const [filter, setFilter] = useState("")
  const [timeframeFrom, setTimeframeFrom] = useState<Date>(subDays(new Date(), 365))
  const [timeframeTo, setTimeframeTo] = useState<Date>(new Date())

  interface IReportBase {
    name: string
    description: string
    displayTimeframe?: boolean
    dropdown: Array<{
      text: string
      onClick?: () => void
      href?: string
      icon?: React.ReactNode
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
      description: t("reporting.applicationMetrics.description"),
      displayTimeframe: true,
      dropdown: [
        {
          text: t("reporting.stepCodeMetrics.downloadPart9"),
          onClick: () =>
            downloadStepCodeMetrics(EStepCodeType.Part9, {
              timeframeFrom,
              timeframeTo,
            }),
          icon: <BracketsCurly size={24} />,
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
                        {reportType.displayTimeframe && (
                          <Box p={3} borderBottom="1px solid" borderColor="border.input">
                            <HStack spacing={2} align="stretch">
                              <Box>
                                <Text fontSize="sm" mb={1}>
                                  {t("ui.from")}
                                </Text>
                                <DatePicker
                                  selected={timeframeFrom}
                                  onChange={(date: Date) => setTimeframeFrom(date)}
                                />
                              </Box>
                              <Box>
                                <Text fontSize="sm" mb={1}>
                                  {t("ui.to")}
                                </Text>
                                <DatePicker selected={timeframeTo} onChange={(date: Date) => setTimeframeTo(date)} />
                              </Box>
                            </HStack>
                          </Box>
                        )}
                        {reportType.dropdown.map((item, index) =>
                          item.href ? (
                            <ManageMenuItem key={index} icon={item.icon || <FileCsv size={24} />} to={item.href}>
                              {item.text}
                            </ManageMenuItem>
                          ) : (
                            <ManageMenuItemButton
                              key={index}
                              leftIcon={item.icon || <FileCsv size={24} />}
                              onClick={item.onClick}
                            >
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

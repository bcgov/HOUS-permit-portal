import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Menu,
  MenuButton,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react"
import { FileCsv } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { ManageMenuItem } from "../../../shared/base/manage-menu-item"
import { SearchGrid } from "../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../shared/grid/search-grid-item"
import { GridHeaders } from "./grid-header"

export const ReportingScreen = observer(() => {
  const { t } = useTranslation()
  const {} = useMst()

  const [filter, setFilter] = useState("")

  interface IReport {
    name: string
    description: string
    href: string
  }

  const reportTypes: IReport[] = [
    {
      name: t("reporting.templateSummaryName"),
      description: t("reporting.templateSummaryDescription"),
      href: "export-template-summary",
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
                        <ManageMenuItem icon={<FileCsv size={24} />} to={reportType.href}>
                          <Text as={"span"}>{t("reporting.open")}</Text>
                        </ManageMenuItem>
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

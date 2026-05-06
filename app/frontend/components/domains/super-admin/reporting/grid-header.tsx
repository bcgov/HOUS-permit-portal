import { Box, Flex, GridItem, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { EReportingColumns } from "../../../../types/enums"
import { GridHeader } from "../../../shared/grid/grid-header"

interface IGridHeadersProps {
  renderFilterInput: () => React.ReactElement
}

export const GridHeaders: React.FC<IGridHeadersProps> = observer(function GridHeaders({ renderFilterInput }) {
  const { t } = useTranslation()

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          gridColumn={`span 3`}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
          asChild
        >
          <Flex>
            <Text role={"heading"}>{t("reporting.tableHeading")}</Text>
            {renderFilterInput()}
          </Flex>
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {[EReportingColumns.name, EReportingColumns.description].map((field) => {
          return (
            <GridHeader key={field} role={"columnheader"}>
              <Flex
                w={"full"}
                justifyContent={"space-between"}
                borderRight={"1px solid"}
                borderColor={"border.light"}
                px={4}
                asChild
              >
                <button>
                  {/* @ts-ignore */}
                  <Text textAlign="left">{t(`reporting.columnHeaders.${field}`)}</Text>
                </button>
              </Flex>
            </GridHeader>
          )
        })}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})

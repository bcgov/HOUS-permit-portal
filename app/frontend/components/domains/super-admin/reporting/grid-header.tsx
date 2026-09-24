import { Box, Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { EReportingColumns } from "../../../../types/enums"
import { GridHeader } from "../../../shared/grid/grid-header"

export const GridHeaders = observer(function GridHeaders() {
  const { t } = useTranslation()

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        {[EReportingColumns.name, EReportingColumns.description].map((field) => {
          return (
            <GridHeader key={field} role={"columnheader"}>
              <Flex
                w={"full"}
                as={"button"}
                justifyContent={"space-between"}
                borderRight={"1px solid"}
                borderColor={"border.light"}
                px={4}
              >
                {/* @ts-ignore */}
                <Text textAlign="left">{t(`reporting.columnHeaders.${field}`)}</Text>
              </Flex>
            </GridHeader>
          )
        })}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})

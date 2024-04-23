import { Box, Flex, GridItem, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { GridHeader } from "../../shared/grid/grid-header"

export const GridHeaders = observer(function GridHeaders() {
  const { t } = useTranslation()
  const columnHeaders: string[] = [
    t("externalApiKey.index.table.columnHeaders.name"),
    t("externalApiKey.index.table.columnHeaders.status"),
    t("externalApiKey.index.table.columnHeaders.createdAt"),
    t("externalApiKey.index.table.columnHeaders.expiredAt"),
    t("externalApiKey.index.table.columnHeaders.revokedAt"),
  ]

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"span 6"}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
        >
          <Text role={"heading"}>{t("externalApiKey.index.table.heading")}</Text>
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {columnHeaders.map((heading) => (
          <GridHeader key={heading} role={"columnheader"}>
            <Flex
              w={"full"}
              justifyContent={"space-between"}
              borderY={"none"}
              borderX={"none"}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              px={4}
            >
              {heading}
            </Flex>
          </GridHeader>
        ))}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})

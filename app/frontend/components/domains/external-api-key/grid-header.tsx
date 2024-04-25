import { Box, Flex, GridItem, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { GridHeader } from "../../shared/grid/grid-header"

export const GridHeaders = observer(function GridHeaders() {
  const { t } = useTranslation()
  const columnHeaders: string[] = [
    t("externalApiKey.fieldLabels.name"),
    t("externalApiKey.fieldLabels.connectingApplication"),
    t("externalApiKey.fieldLabels.status"),
    t("externalApiKey.fieldLabels.createdAt"),
    t("externalApiKey.fieldLabels.expiredAt"),
    t("externalApiKey.fieldLabels.revokedAt"),
  ]

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"span 7"}
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
              h={"full"}
              alignItems={"center"}
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

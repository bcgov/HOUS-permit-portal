import { Box, Flex, GridItem, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { GridHeader } from "../../../../shared/grid/grid-header"

export const GridHeaders = observer(function GridHeaders() {
  const { t } = useTranslation()

  const headers = [
    {
      title: t("apiMappingsSetup.edit.table.headers.localField"),

      info: "Some info",
    },
    {
      title: (
        <Text fontSize={"sm"}>
          <Trans
            i18nKey={"apiMappingsSetup.edit.table.headers.templateField"}
            components={{ 1: <Text as={"span"} fontWeight={"700"}></Text> }}
          />
        </Text>
      ),
    },
    { title: t("apiMappingsSetup.edit.table.headers.requirementDetail") },
  ]

  return (
    <Box display={"contents"} role={"rowgroup"} w={"full"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"1/-1"}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
        >
          <Text role={"heading"} fontSize={"sm"} as={"h2"}>
            {t("apiMappingsSetup.edit.table.title")}
          </Text>
          {/*<SearchInput searchModel={requirementTemplateStore} />*/}
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"} w={"full"}>
        {headers.map((header) => (
          <GridHeader key={header.title} role={"columnheader"}>
            <Flex
              w={"full"}
              h={"full"}
              alignItems={"center"}
              borderY={"none"}
              borderX={"none"}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              fontSize={"sm"}
              px={4}
            >
              {header.title}
            </Flex>
          </GridHeader>
        ))}
      </Box>
    </Box>
  )
})

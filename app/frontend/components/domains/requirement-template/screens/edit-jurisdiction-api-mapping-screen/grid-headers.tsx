import { Box, Flex, GridItem, HStack, Text } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useCallback, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { IIntegrationMapping } from "../../../../../models/integration-mapping"
import { debounce } from "../../../../../utils/utility-functions"
import { SearchInput } from "../../../../shared/base/search-input"
import { FormSwitch } from "../../../../shared/form-switch"
import { GridHeader } from "../../../../shared/grid/grid-header"
import { IconLink } from "../../../../shared/icon-link"

export const GridHeaders = observer(function GridHeaders({
  integrationMapping,
}: {
  integrationMapping: IIntegrationMapping
}) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const debouncedSetQuery = useCallback(debounce(integrationMapping.setQuery, 500), [integrationMapping.setQuery])

  const onQueryChange = (query: string) => {
    setSearchQuery(query)
    debouncedSetQuery(query)
  }

  const headers = [
    {
      title: t("apiMappingsSetup.edit.table.headers.localField"),
      info: (
        <IconLink
          accessibleText={t("apiMappingsSetup.edit.table.headers.localFieldInfo")}
          Icon={Info}
          href={"/integrations/api_docs"}
          target={"_blank"}
          rel="noopener noreferrer"
          color={"greys.grey90"}
        />
      ),
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
          <HStack>
            <Text role={"heading"} fontSize={"sm"} as={"h2"}>
              {t("apiMappingsSetup.edit.table.title")}
            </Text>
            <FormSwitch
              switchIdForAccessibility={"integrationMappingShowOnlyUnmappedSwitch"}
              isChecked={integrationMapping?.showOnlyUnmapped}
              onChange={(e) => integrationMapping?.setShowOnlyUnmapped(!!e.target.checked)}
              checkedText={t("apiMappingsSetup.edit.table.filter.showAll")}
              uncheckedText={t("apiMappingsSetup.edit.table.filter.showOnlyUnmapped")}
            />
          </HStack>

          <SearchInput query={searchQuery} onQueryChange={onQueryChange} />
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"} w={"full"}>
        {headers.map((header) => (
          // @ts-ignore
          <GridHeader key={header.title} role={"columnheader"}>
            <Flex
              w={"full"}
              h={"full"}
              alignItems={"center"}
              justifyContent={"space-between"}
              borderY={"none"}
              borderX={"none"}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              fontSize={"sm"}
              px={4}
            >
              {header.title}
              {header?.info}
            </Flex>
          </GridHeader>
        ))}
      </Box>
    </Box>
  )
})

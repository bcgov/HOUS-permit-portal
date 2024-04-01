import { Box, Flex, GridItem, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EJurisdictionSortFields } from "../../../types/enums"
import { SearchInput } from "../../shared/base/search-input"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

export const LimitedGridHeaders = observer(function GridHeaders() {
  const { jurisdictionStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = jurisdictionStore
  const { t } = useTranslation()

  enum ELimitedJurisdictionSortFields {
    reverseQualifiedName = "reverse_qualified_name",
    regionalDistrict = "regional_district_name",
  }

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"span 2"}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
        >
          <Text role={"heading"}>{t("jurisdiction.index.tableHeading")}</Text>
          <SearchInput searchModel={jurisdictionStore} />
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {Object.values(ELimitedJurisdictionSortFields).map((field) => (
          <GridHeader key={field as any as EJurisdictionSortFields} role={"columnheader"}>
            <Flex
              w={"full"}
              as={"button"}
              justifyContent={"space-between"}
              cursor="pointer"
              onClick={() => toggleSort(field as any as EJurisdictionSortFields)}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              px={4}
            >
              <Text textAlign="left">{getSortColumnHeader(field as any as EJurisdictionSortFields)}</Text>
              <SortIcon<EJurisdictionSortFields> field={field as any as EJurisdictionSortFields} currentSort={sort} />
            </Flex>
          </GridHeader>
        ))}
      </Box>
    </Box>
  )
})

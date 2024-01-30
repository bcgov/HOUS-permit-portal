import { Box, Flex, GridItem, Text, styled } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EUserSortFields } from "../../../../types/enums"
import { SearchInput } from "../../../shared/base/search-input"
import { SortIcon } from "../../../shared/sort-icon"

export const GridHeaders = observer(function GridHeaders() {
  const { jurisdictionStore } = useMst()
  const { currentJurisdiction } = jurisdictionStore
  const { userStore } = useMst()

  const getSortColumnHeader = currentJurisdiction?.getUserSortColumnHeader

  const { toggleSort, sort } = userStore

  const { t } = useTranslation()

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
          <Text role={"heading"} as={"h3"} color={"black"} fontSize={"sm"} height="fit-content">
            {t("user.index.tableHeading")}
          </Text>
          <SearchInput searchModel={userStore} />
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {Object.values(EUserSortFields).map((field) => (
          <GridHeader key={field} role={"columnheader"}>
            <Flex
              w={"full"}
              as={"button"}
              justifyContent={"space-between"}
              cursor="pointer"
              onClick={() => toggleSort(field)}
              borderRight={"1px solid"}
              borderColor={"border.light"}
              px={4}
            >
              <Text textAlign="left">{getSortColumnHeader(field)}</Text>
              <SortIcon<EUserSortFields> field={field} currentSort={sort} />
            </Flex>
          </GridHeader>
        ))}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})

const GridHeader = styled(GridItem)
GridHeader.defaultProps = {
  fontSize: "sm",
  py: 5,
  color: "text.secondary",
  fontWeight: 400,
  borderTop: "1px solid",
  borderBottom: "1px solid",
  borderColor: "border.light",
}

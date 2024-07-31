import { Box, Flex, GridItem, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EPermitApplicationReviewerSortFields, EPermitApplicationSortFields } from "../../../../types/enums"
import { ModelSearchInput } from "../../../shared/base/model-search-input"
import { GridHeader } from "../../../shared/grid/grid-header"
import { SortIcon } from "../../../shared/sort-icon"

export const GridHeaders = observer(function GridHeaders() {
  const { permitApplicationStore } = useMst()

  const getSortColumnHeader = permitApplicationStore?.getSortColumnHeader

  const { toggleSort, sort } = permitApplicationStore

  const { t } = useTranslation()

  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"span 8"}
          p={6}
          bg={"greys.grey10"}
          justifyContent={"space-between"}
          align="center"
        >
          <Text role={"heading"}>{t("permitApplication.submissionInbox.tableHeading")}</Text>
          <ModelSearchInput searchModel={permitApplicationStore} />
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {Object.keys(EPermitApplicationReviewerSortFields)
          .map((key) => {
            let castField = EPermitApplicationReviewerSortFields[key] as EPermitApplicationSortFields
            if (!EPermitApplicationReviewerSortFields[key]) return

            return (
              <GridHeader key={key} role={"columnheader"}>
                <Flex
                  w={"full"}
                  as={"button"}
                  justifyContent={"space-between"}
                  cursor="pointer"
                  onClick={() => toggleSort(castField)}
                  borderRight={"1px solid"}
                  borderColor={"border.light"}
                  px={4}
                >
                  <Text textAlign="left">{getSortColumnHeader(castField)}</Text>
                  <SortIcon<EPermitApplicationSortFields> field={castField} currentSort={sort} />
                </Flex>
              </GridHeader>
            )
          })
          .filter((outNull) => outNull)}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})

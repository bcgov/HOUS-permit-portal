import { Flex, GridItemProps, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EStepCodeSortFields } from "../../../types/enums"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

export const STEP_CODES_GRID_TEMPLATE_COLUMNS = "1fr 1fr 1fr 1fr"

export const StepCodesGridHeaders = observer((props: GridItemProps) => {
  const { t } = useTranslation()
  const { stepCodeStore } = useMst()
  const { sort, toggleSort, getSortColumnHeader } = stepCodeStore
  return (
    <>
      {Object.values(EStepCodeSortFields).map((field) => (
        <GridHeader key={field} role={"columnheader"}>
          <Flex
            w={"full"}
            as={"button"}
            justifyContent={"space-between"}
            cursor="pointer"
            onClick={() => toggleSort(field)}
            px={4}
          >
            <Text textAlign="left">{getSortColumnHeader(field)}</Text>
            <SortIcon field={field} currentSort={sort as any} />
          </Flex>
        </GridHeader>
      ))}
    </>
  )
})

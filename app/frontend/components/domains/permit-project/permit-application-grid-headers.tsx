import { Flex, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EProjectPermitApplicationSortFields } from "../../../types/enums"
import { ISort } from "../../../types/types"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

interface IPermitApplicationGridHeadersProps {
  columns: EProjectPermitApplicationSortFields[]
  includeActionColumn?: boolean
}

export const PermitApplicationGridHeaders = observer(
  ({ columns, includeActionColumn }: IPermitApplicationGridHeadersProps) => {
    const { t } = useTranslation()
    const { permitApplicationStore } = useMst()
    const { getProjectPermitApplicationSortColumnHeader, toggleSort, sort } = permitApplicationStore

    return (
      <>
        {columns.map((column) => (
          <GridHeader key={column}>
            <Flex
              w={"full"}
              as={"button"}
              justifyContent={"space-between"}
              cursor="pointer"
              onClick={() => toggleSort(column)}
              px={4}
            >
              <Text textAlign="left">{getProjectPermitApplicationSortColumnHeader(column)}</Text>
              <SortIcon<EProjectPermitApplicationSortFields>
                field={column}
                currentSort={sort as ISort<EProjectPermitApplicationSortFields>}
              />
            </Flex>
          </GridHeader>
        ))}

        {includeActionColumn && <GridHeader role={"columnheader"} />}
      </>
    )
  }
)

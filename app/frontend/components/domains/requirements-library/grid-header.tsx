import { Box, Flex, GridItem, HStack, Text, Tooltip } from "@chakra-ui/react"
import { Info } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { ERequirementLibrarySortFields } from "../../../types/enums"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { GridHeader } from "../../shared/grid/grid-header"
import { SortIcon } from "../../shared/sort-icon"

interface IProps {
  forEarlyAccess?: boolean
}

export const GridHeaders = observer(function GridHeaders({ forEarlyAccess }: IProps) {
  const { requirementBlockStore } = useMst()
  const { sort, getSortColumnHeader, toggleSort } = requirementBlockStore
  const { t } = useTranslation()

  console.log()
  return (
    <Box display={"contents"} role={"rowgroup"}>
      <Box display={"contents"} role={"row"}>
        <GridItem
          as={Flex}
          gridColumn={"span 7"}
          p={6}
          bg={forEarlyAccess ? "semantic.warningLight" : "greys.grey10"}
          justifyContent={"space-between"}
          align="center"
        >
          <Text role={"heading"}>
            {t(`${forEarlyAccess ? "earlyAccessRequirementsLibrary" : "requirementsLibrary"}.index.tableHeading`)}
          </Text>
          <ModelSearchInput
            inputGroupProps={{
              position: "sticky",
              right: 6,
            }}
            searchModel={requirementBlockStore as ISearch}
          />
        </GridItem>
      </Box>
      <Box display={"contents"} role={"row"}>
        {Object.values(ERequirementLibrarySortFields).map((field) => (
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
              <Text>{getSortColumnHeader(field)}</Text>
              {field === ERequirementLibrarySortFields.associations ? (
                <HStack w={"fit-content"} spacing={3}>
                  <SortIcon<ERequirementLibrarySortFields>
                    field={field}
                    currentSort={sort}
                    aria-label={`Sort ${getSortColumnHeader(field)} Icon`}
                  />
                  <Tooltip label={t("requirementsLibrary.associationsInfo")}>
                    <Info aria-label={"Info Icon"} />
                  </Tooltip>
                </HStack>
              ) : (
                <SortIcon<ERequirementLibrarySortFields>
                  field={field}
                  currentSort={sort}
                  aria-label={`Sort ${getSortColumnHeader(field)}`}
                />
              )}
            </Flex>
          </GridHeader>
        ))}
        <GridHeader role={"columnheader"} />
      </Box>
    </Box>
  )
})

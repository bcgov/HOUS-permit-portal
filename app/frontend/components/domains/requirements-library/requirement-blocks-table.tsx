import { Box, ButtonProps, Flex, HStack, ListItem, StackProps, Tag, UnorderedList, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { datefnsTableDateFormat } from "../../../constants"
import { useSearch } from "../../../hooks/use-search"
import { ISearch } from "../../../lib/create-search-model"
import { IRequirementBlock } from "../../../models/requirement-block"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ElectiveTag } from "../../shared/elective-tag"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { HasConditionalTag } from "../../shared/has-conditional-tag"
import { GridHeaders } from "./grid-header"
import { RequirementsBlockModal } from "./requirements-block-modal"

interface IProps extends Partial<StackProps> {
  renderActionButton?: (props: ButtonProps & { requirementBlock: IRequirementBlock }) => JSX.Element
}

export const RequirementBlocksTable = observer(function RequirementBlocksTable({
  renderActionButton,
  ...containerProps
}: IProps) {
  const { requirementBlockStore } = useMst()
  const {
    tableRequirementBlocks,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = requirementBlockStore

  useSearch(requirementBlockStore as ISearch)
  return (
    <VStack as={"article"} spacing={5} {...containerProps}>
      <SearchGrid templateColumns="repeat(4, 1fr) max(200px) 85px" pos={"relative"}>
        <GridHeaders />

        {isSearching ? (
          <Flex py={50} gridColumn={"span 6"}>
            <SharedSpinner />
          </Flex>
        ) : (
          tableRequirementBlocks.map((requirementBlock) => {
            return (
              <Box
                key={requirementBlock.id}
                className={"requirements-library-grid-row"}
                role={"row"}
                display={"contents"}
              >
                <SearchGridItem fontWeight={700} minW="250px">
                  {requirementBlock.name}
                </SearchGridItem>
                <SearchGridItem maxW="200px">
                  <HStack as={"ul"} wrap={"wrap"} spacing={1}>
                    {requirementBlock.associations.map((association) => (
                      <Tag key={association} as={"li"} bg={"greys.grey03"} color={"text.secondary"} fontSize={"xs"}>
                        {association}
                      </Tag>
                    ))}
                  </HStack>
                </SearchGridItem>
                <SearchGridItem pr={0} minW="280px">
                  <UnorderedList ml={0} pl={0} w={"full"}>
                    {requirementBlock.requirements.map((requirement) => {
                      return (
                        <ListItem key={requirement.id} color={"text.secondary"} fontSize={"xs"} mb="1">
                          {requirement.label}
                        </ListItem>
                      )
                    })}
                  </UnorderedList>
                </SearchGridItem>
                <SearchGridItem maxW="150px" fontSize={"sm"}>
                  {format(requirementBlock.updatedAt, datefnsTableDateFormat)}
                </SearchGridItem>
                <SearchGridItem maxW="200px">
                  <HStack flexWrap={"wrap"} maxW={"full"} alignSelf={"middle"}>
                    {requirementBlock.hasAnyElective && <ElectiveTag hasElective />}
                    {requirementBlock.hasAnyConditional && <HasConditionalTag />}
                  </HStack>
                </SearchGridItem>
                <SearchGridItem justifyContent={"center"}>
                  {renderActionButton ? (
                    renderActionButton({ requirementBlock })
                  ) : (
                    <RequirementsBlockModal requirementBlock={requirementBlock} />
                  )}
                </SearchGridItem>
              </Box>
            )
          })
        )}
      </SearchGrid>
      <Flex w={"full"} justifyContent={"space-between"}>
        <PerPageSelect
          handleCountPerPageChange={handleCountPerPageChange}
          countPerPage={countPerPage}
          totalCount={totalCount}
        />
        <Paginator
          current={currentPage}
          total={totalCount}
          totalPages={totalPages}
          pageSize={countPerPage}
          handlePageChange={handlePageChange}
          showLessItems={true}
        />
      </Flex>
    </VStack>
  )
})

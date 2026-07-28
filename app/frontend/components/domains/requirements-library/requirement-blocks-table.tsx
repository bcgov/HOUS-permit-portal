import {
  Box,
  ButtonProps,
  Flex,
  HStack,
  ListItem,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  StackProps,
  Tag,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { datefnsTableDateFormat } from "../../../constants"
import { useSearch } from "../../../hooks/use-search"
import { ISearch } from "../../../lib/create-search-model"
import { IRequirementBlock } from "../../../models/requirement-block"
import { IRequirementBlockPickerSearch } from "../../../models/requirement-block-picker-search"
import { useMst } from "../../../setup/root"
import { IRequirementBlockStoreModel } from "../../../stores/requirement-block-store"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { SearchGridRow } from "../../shared/grid/search-grid-row"
import { GridHeaders } from "./grid-header"
import { RequirementsBlockModal } from "./requirements-block-modal"

type TRequirementBlocksTableSearchModel = IRequirementBlockStoreModel | IRequirementBlockPickerSearch

interface IProps extends Partial<StackProps> {
  renderActionButton?: (props: ButtonProps & { requirementBlock: IRequirementBlock }) => JSX.Element
  /** When set (e.g. nested drawer), uses in-memory search and skips URL sync. */
  searchModel?: TRequirementBlocksTableSearchModel
}

export const RequirementBlocksTable = observer(function RequirementBlocksTable({
  renderActionButton,
  searchModel: searchModelProp,
  ...containerProps
}: IProps) {
  const { requirementBlockStore } = useMst()
  const searchModel = searchModelProp ?? requirementBlockStore
  const isNested = !!searchModelProp
  const {
    tableRequirementBlocks,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
    showArchived,
  } = searchModel

  useEffect(() => {
    return () => {
      searchModel.setShowArchived(false)
    }
  }, [])

  useSearch(searchModel as ISearch, isNested ? [] : [showArchived], { nested: isNested })

  return (
    <VStack as={"article"} spacing={5} {...containerProps}>
      <SearchGrid
        templateColumns="minmax(0, 3fr) minmax(140px, 1fr) 180px 170px 88px"
        pos={"relative"}
        sx={{
          "[role='row']:not(:last-child) > [role='cell']": { borderBottom: "none" },
        }}
      >
        <GridHeaders searchModel={searchModel} />

        {isSearching ? (
          <Flex py={50} gridColumn={"span 5"}>
            <SharedSpinner />
          </Flex>
        ) : (
          tableRequirementBlocks.map((requirementBlock) => {
            return (
              <SearchGridRow key={requirementBlock.id}>
                <SearchGridItem>
                  <Flex direction="column" overflow="hidden">
                    <Text as={"span"} fontWeight={700} noOfLines={2} title={requirementBlock.name}>
                      {requirementBlock.name}
                    </Text>
                    <Text as={"span"} noOfLines={2} title={requirementBlock.description || undefined}>
                      {requirementBlock.description}
                    </Text>
                  </Flex>
                </SearchGridItem>
                <SearchGridItem>
                  <HStack as={"ul"} wrap={"wrap"} spacing={1}>
                    {requirementBlock.associations.map((association) => (
                      <Tag key={association} as={"li"} bg={"greys.grey03"} color={"text.secondary"} fontSize={"xs"}>
                        {association}
                      </Tag>
                    ))}
                  </HStack>
                </SearchGridItem>
                <SearchGridItem justifyContent="center">
                  <FormFieldsCountCell requirementBlock={requirementBlock} />
                </SearchGridItem>
                <SearchGridItem fontSize={"sm"}>
                  {format(requirementBlock.updatedAt, datefnsTableDateFormat)}
                </SearchGridItem>
                <SearchGridItem justifyContent={"center"}>
                  {renderActionButton ? (
                    renderActionButton({ requirementBlock })
                  ) : (
                    <RequirementsBlockModal withOptionsMenu requirementBlock={requirementBlock} />
                  )}
                </SearchGridItem>
              </SearchGridRow>
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

function FormFieldsCountCell({ requirementBlock }: { requirementBlock: IRequirementBlock }) {
  const count = requirementBlock.requirements.length
  const countTag = (
    <Tag
      bg="greys.grey03"
      color="text.secondary"
      fontSize="xs"
      cursor={count > 0 ? "help" : undefined}
      _hover={count > 0 ? { bg: "greys.grey02" } : undefined}
    >
      {count}
    </Tag>
  )

  if (count === 0) return countTag

  return (
    <Popover trigger="hover" placement="left-start" isLazy openDelay={200} closeDelay={100}>
      <PopoverTrigger>
        <Box as="span" display="inline-block">
          {countTag}
        </Box>
      </PopoverTrigger>
      <Portal>
        <PopoverContent
          // chakra-overrides.scss sets .chakra-popover__popper to z-index 20 !important, below Drawer (1400)
          rootProps={{ sx: { zIndex: "1500 !important" } }}
          w="auto"
          minW="200px"
          maxW="320px"
          maxH="240px"
          overflowY="auto"
        >
          <PopoverBody p={3}>
            <UnorderedList ml={0} pl={4} spacing={1}>
              {requirementBlock.requirements.map((requirement) => (
                <ListItem key={requirement.id} color="text.secondary" fontSize="xs">
                  {requirement.label}
                </ListItem>
              ))}
            </UnorderedList>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

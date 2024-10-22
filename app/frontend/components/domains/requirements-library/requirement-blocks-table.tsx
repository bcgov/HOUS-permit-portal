import {
  Box,
  ButtonProps,
  Flex,
  HStack,
  ListItem,
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
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { ElectiveTag } from "../../shared/elective-tag"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { HasAutomatedComplianceTag } from "../../shared/has-automated-compliance-tag"
import { HasConditionalTag } from "../../shared/has-conditional-tag"
import { YesNoTag } from "../../shared/yes-no-tag"
import { GridHeaders } from "./grid-header"
import { RequirementsBlockModal } from "./requirements-block-modal"

interface IProps extends Partial<StackProps> {
  renderActionButton?: (props: ButtonProps & { requirementBlock: IRequirementBlock }) => JSX.Element
  forEarlyAccess?: boolean
}

const ROW_CLASS_NAME = "requirements-library-grid-row"

export const RequirementBlocksTable = observer(function RequirementBlocksTable({
  renderActionButton,
  forEarlyAccess,
  ...containerProps
}: IProps) {
  const { requirementBlockStore, earlyAccessRequirementBlockStore } = useMst()
  const storeToUse = forEarlyAccess ? earlyAccessRequirementBlockStore : requirementBlockStore
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
  } = storeToUse

  useSearch(storeToUse as ISearch, [showArchived])

  useEffect(() => {
    return () => {
      storeToUse.setShowArchived(false)
    }
  }, [])

  return (
    <VStack as={"article"} spacing={5} {...containerProps}>
      <SearchGrid gridRowClassName={ROW_CLASS_NAME} templateColumns="repeat(7, 1fr)" pos={"relative"}>
        <GridHeaders forEarlyAccess={forEarlyAccess} />

        {isSearching ? (
          <Flex py={50} gridColumn={"span 6"}>
            <SharedSpinner />
          </Flex>
        ) : (
          tableRequirementBlocks.map((requirementBlock) => {
            return (
              <Box key={requirementBlock.id} className={ROW_CLASS_NAME} role={"row"} display={"contents"}>
                <SearchGridItem minW="250px">
                  <Flex direction="column">
                    <Text as={"span"} fontWeight={700}>
                      {requirementBlock.name}
                    </Text>
                    <Text as={"span"}>{requirementBlock.description}</Text>
                  </Flex>
                </SearchGridItem>
                <SearchGridItem fontWeight={700} minW="35px">
                  <YesNoTag boolean={requirementBlock.firstNations} />
                </SearchGridItem>
                <SearchGridItem maxW="190px">
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
                <SearchGridItem maxW="230px">
                  <HStack flexWrap={"wrap"} maxW={"full"} alignSelf={"middle"}>
                    {requirementBlock.hasAnyElective && <ElectiveTag hasElective />}
                    {requirementBlock.hasAnyConditional && <HasConditionalTag />}
                    {requirementBlock.hasAutomatedCompliance && <HasAutomatedComplianceTag />}
                  </HStack>
                </SearchGridItem>
                <SearchGridItem justifyContent={"center"}>
                  {renderActionButton ? (
                    renderActionButton({ requirementBlock })
                  ) : (
                    <RequirementsBlockModal withOptionsMenu requirementBlock={requirementBlock} />
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

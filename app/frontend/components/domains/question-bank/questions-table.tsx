import { Box, Button, Flex, HStack, ListItem, StackProps, Tag, Text, UnorderedList, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateFormat } from "../../../constants"
import { useSearch } from "../../../hooks/use-search"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { HasAutomatedComplianceTag } from "../../shared/has-automated-compliance-tag"
import { HasDataValidationTag } from "../../shared/has-data-validation-tag"
import { GridHeaders } from "./grid-header"

const ROW_CLASS_NAME = "question-bank-grid-row"

export const QuestionsTable = observer(function QuestionsTable({ ...containerProps }: Partial<StackProps>) {
  const { t } = useTranslation()
  const { requirementQuestionStore } = useMst()
  const searchModel = requirementQuestionStore
  const {
    tableRequirementQuestions,
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

  useSearch(searchModel as ISearch, [showArchived])

  return (
    <VStack as={"article"} spacing={5} {...containerProps}>
      <SearchGrid gridRowClassName={ROW_CLASS_NAME} templateColumns="repeat(7, 1fr)" pos={"relative"}>
        <GridHeaders />

        {isSearching ? (
          <Flex py={50} gridColumn={"span 7"}>
            <SharedSpinner />
          </Flex>
        ) : (
          tableRequirementQuestions.map((question) => {
            return (
              <Box key={question.id} className={ROW_CLASS_NAME} role={"row"} display={"contents"}>
                <SearchGridItem minW="160px" maxW="200px">
                  <Text as={"span"} fontWeight={700} noOfLines={2} title={question.name || undefined}>
                    {question.name}
                  </Text>
                </SearchGridItem>
                <SearchGridItem minW="200px" maxW="300px">
                  <Text as={"span"} noOfLines={3} title={question.description || undefined}>
                    {question.description}
                  </Text>
                </SearchGridItem>
                <SearchGridItem maxW="180px" minW="120px">
                  <HStack as={"ul"} wrap={"wrap"} spacing={1}>
                    {question.associations.map((association) => (
                      <Tag key={association} as={"li"} bg={"greys.grey03"} color={"text.secondary"} fontSize={"xs"}>
                        {association}
                      </Tag>
                    ))}
                  </HStack>
                </SearchGridItem>
                <SearchGridItem pr={0} minW="180px" maxW="245px">
                  {question.requirementBlocks.length === 0 ? (
                    <Text color={"text.secondary"} fontSize={"xs"}>
                      {t("questionBank.fields.notConnected")}
                    </Text>
                  ) : (
                    <UnorderedList ml={0} pl={0} w={"full"}>
                      {question.requirementBlocks.slice(0, 3).map((block) => (
                        <ListItem
                          key={block.id}
                          color={"text.secondary"}
                          fontSize={"xs"}
                          mb="1"
                          noOfLines={1}
                          title={block.name}
                        >
                          {block.name}
                        </ListItem>
                      ))}
                      {question.requirementBlocks.length > 3 && (
                        <Text fontSize={"xs"} color={"text.link"}>
                          {t("questionBank.fields.seeMore")}
                        </Text>
                      )}
                    </UnorderedList>
                  )}
                </SearchGridItem>
                <SearchGridItem maxW="200px" minW="150px">
                  <HStack flexWrap={"wrap"} maxW={"full"} alignSelf={"middle"}>
                    {question.hasDataValidation && <HasDataValidationTag />}
                    {question.hasAutomatedCompliance && <HasAutomatedComplianceTag />}
                  </HStack>
                </SearchGridItem>
                <SearchGridItem maxW="150px" minW="100px" fontSize={"sm"}>
                  {format(question.updatedAt, datefnsTableDateFormat)}
                </SearchGridItem>
                <SearchGridItem justifyContent={"center"} minW="85px" flexShrink={0}>
                  <Button variant={"link"} size={"sm"} isDisabled>
                    {t("ui.edit")}
                  </Button>
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

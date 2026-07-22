import { Box, Button, Flex, HStack, ListItem, StackProps, Tag, Text, UnorderedList, VStack } from "@chakra-ui/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
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
import { QuestionBankModal } from "./question-bank-modal"

const ROW_CLASS_NAME = "question-bank-grid-row"
const PREVIEW_BLOCK_COUNT = 3

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
  const [expandedRequirementBlockRows, setExpandedRequirementBlockRows] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    return () => {
      searchModel.setShowArchived(false)
    }
  }, [])

  useSearch(searchModel as ISearch, [showArchived])

  const toggleRequirementBlocksExpanded = (questionId: string) => {
    setExpandedRequirementBlockRows((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

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
            const isBlocksExpanded = expandedRequirementBlockRows.has(question.id)
            const visibleBlocks = isBlocksExpanded
              ? question.requirementBlocks
              : question.requirementBlocks.slice(0, PREVIEW_BLOCK_COUNT)
            const hasMoreBlocks = question.requirementBlocks.length > PREVIEW_BLOCK_COUNT

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
                <SearchGridItem maxW="180px" minW="120px" justifyContent="center">
                  <HStack
                    as={"ul"}
                    wrap={"wrap"}
                    spacing={1}
                    m={0}
                    p={0}
                    listStyleType={"none"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    w={"full"}
                  >
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
                      {visibleBlocks.map((block) => (
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
                      {hasMoreBlocks && (
                        <Button
                          variant={"link"}
                          fontSize={"xs"}
                          fontWeight={"normal"}
                          height={"auto"}
                          minW={"unset"}
                          onClick={() => toggleRequirementBlocksExpanded(question.id)}
                        >
                          {t(isBlocksExpanded ? "questionBank.fields.seeLess" : "questionBank.fields.seeMore")}
                        </Button>
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
                  <QuestionBankModal
                    requirementQuestion={question}
                    triggerButtonProps={{ variant: "link", size: "sm" }}
                  />
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

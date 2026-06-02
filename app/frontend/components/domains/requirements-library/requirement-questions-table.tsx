import { Box, Button, Flex, StackProps, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { ISearch } from "../../../lib/create-search-model"
import { IRequirementQuestion } from "../../../models/requirement-question"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { SearchGridItem } from "../../shared/grid/search-grid-item"
import { RequirementTypeTag } from "../../shared/requirement-type-tag"

interface IProps extends Partial<StackProps> {
  onUse?: (question: IRequirementQuestion) => void
}

const ROW_CLASS_NAME = "requirement-questions-grid-row"

export const RequirementQuestionsTable = observer(function RequirementQuestionsTable({
  onUse,
  ...containerProps
}: IProps) {
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

  useSearch(searchModel as ISearch, [showArchived])

  return (
    <VStack as={"article"} spacing={5} {...containerProps}>
      <SearchGrid gridRowClassName={ROW_CLASS_NAME} templateColumns="repeat(4, 1fr)" pos={"relative"}>
        <SearchGridItem fontWeight={700}>{t("requirementsLibrary.sharedQuestions.question")}</SearchGridItem>
        <SearchGridItem fontWeight={700}>{t("requirementsLibrary.sharedQuestions.type")}</SearchGridItem>
        <SearchGridItem fontWeight={700}>{t("requirementsLibrary.sharedQuestions.usedBy")}</SearchGridItem>
        <SearchGridItem fontWeight={700}>{t("requirementsLibrary.sharedQuestions.actions")}</SearchGridItem>

        {isSearching ? (
          <Flex py={50} gridColumn={"span 4"}>
            <SharedSpinner />
          </Flex>
        ) : (
          tableRequirementQuestions.map((question) => (
            <Box key={question.id} className={ROW_CLASS_NAME} role={"row"} display={"contents"}>
              <SearchGridItem minW="250px">
                <Flex direction="column" overflow="hidden">
                  <Text as={"span"} fontWeight={700} noOfLines={2} title={question.label}>
                    {question.label}
                  </Text>
                  <Text as={"span"} color={"text.secondary"} fontSize={"xs"} noOfLines={1}>
                    {question.requirementCode}
                  </Text>
                </Flex>
              </SearchGridItem>
              <SearchGridItem>
                <RequirementTypeTag type={question.inputType} />
              </SearchGridItem>
              <SearchGridItem>{question.usageCount}</SearchGridItem>
              <SearchGridItem justifyContent={"center"}>
                <Button size="sm" variant="primary" onClick={() => onUse?.(question)}>
                  {t("ui.use")}
                </Button>
              </SearchGridItem>
            </Box>
          ))
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

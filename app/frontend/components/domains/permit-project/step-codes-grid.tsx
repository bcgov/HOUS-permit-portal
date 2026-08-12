import { Flex, GridItem, HStack, Text } from "@chakra-ui/react"
import { ClipboardText } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EStepCodeStageStatus } from "../../../types/enums"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { StepCodeStageIcon } from "./step-code-stage-indicators"
import { STEP_CODES_GRID_TEMPLATE_COLUMNS, StepCodesGridHeaders } from "./step-codes-grid-header"
import { StepCodesGridRow } from "./step-codes-grid-row"

export const StepCodesGrid = observer(() => {
  const { t } = useTranslation()
  const { stepCodeStore } = useMst()
  const {
    tableStepCodes,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = stepCodeStore

  return (
    <>
      <SearchGrid
        templateColumns={STEP_CODES_GRID_TEMPLATE_COLUMNS}
        gridRowClassName="step-code-grid-row"
        isEmpty={!isSearching && R.isEmpty(tableStepCodes)}
        emptyDescription={t("stepCode.noneFound")}
        emptyIcon={<ClipboardText size={18} />}
      >
        <StepCodesGridHeaders />
        {isSearching ? (
          <Flex gridColumn="span 6" justify="center" align="center" minH="200px">
            <SharedSpinner />
          </Flex>
        ) : (
          !R.isEmpty(tableStepCodes) && (
            <>
              {tableStepCodes.map((stepCode) => (
                <StepCodesGridRow key={stepCode.id} stepCode={stepCode} />
              ))}
              <GridItem gridColumn="span 6" px={4} py={3} bg="greys.grey04">
                <HStack spacing={6}>
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                    {t("ui.legend")}
                  </Text>
                  <HStack spacing={2}>
                    <StepCodeStageIcon status={EStepCodeStageStatus.complete} />
                    <Text>{t("stepCode.columns.stagesStatus.complete")}</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <StepCodeStageIcon status={EStepCodeStageStatus.inProgress} />
                    <Text>{t("stepCode.columns.stagesStatus.inProgress")}</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <StepCodeStageIcon status={EStepCodeStageStatus.notStarted} />
                    <Text>{t("stepCode.columns.stagesStatus.notStarted")}</Text>
                  </HStack>
                </HStack>
              </GridItem>
            </>
          )
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
    </>
  )
})

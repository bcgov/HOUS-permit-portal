import { Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SearchGrid } from "../../shared/grid/search-grid"
import { STEP_CODES_GRID_TEMPLATE_COLUMNS, StepCodesGridHeaders } from "./step-codes-grid-header"
import { StepCodesSelectGridRow } from "./step-codes-select-grid-row"

export const StepCodesSelectGrid = observer(({ onSelect }: { onSelect: (stepCodeId: string) => Promise<void> }) => {
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
  } = stepCodeStore

  return (
    <>
      <SearchGrid templateColumns={STEP_CODES_GRID_TEMPLATE_COLUMNS} gridRowClassName="step-code-grid-row">
        <StepCodesGridHeaders />
        {tableStepCodes.map((stepCode) => (
          <StepCodesSelectGridRow key={stepCode.id} stepCode={stepCode} onSelect={onSelect} />
        ))}
      </SearchGrid>
      <Flex w={"full"} justifyContent={"space-between"} mt={4}>
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

import { Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"
import { IStepCode } from "../../../stores/step-code-store"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SearchGrid } from "../../shared/grid/search-grid"
import { STEP_CODES_GRID_TEMPLATE_COLUMNS, StepCodesGridHeaders } from "./step-codes-grid-header"
import { StepCodesSelectGridRow } from "./step-codes-select-grid-row"

export const StepCodesSelectGrid = observer(
  ({
    onSelect,
    attachedStepCode,
  }: {
    onSelect: (stepCodeId: string) => Promise<void>
    attachedStepCode?: IStepCode | null
  }) => {
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
    const listStepCodes = attachedStepCode
      ? tableStepCodes.filter((stepCode) => stepCode.id !== attachedStepCode.id)
      : tableStepCodes

    return (
      <>
        <SearchGrid templateColumns={STEP_CODES_GRID_TEMPLATE_COLUMNS} gridRowClassName="step-code-grid-row">
          <StepCodesGridHeaders />
          {attachedStepCode && (
            <StepCodesSelectGridRow
              key={attachedStepCode.id}
              stepCode={attachedStepCode}
              onSelect={onSelect}
              isAttached
            />
          )}
          {listStepCodes.map((stepCode) => (
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
  }
)

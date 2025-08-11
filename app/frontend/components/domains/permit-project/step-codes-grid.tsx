import { Flex, FormControl, GridItem } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
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
      <RouterLinkButton to="/project-readiness-tools/check-step-code-requirements">
        {t("stepCode.createButton")}
      </RouterLinkButton>
      <Flex direction="column" gap={4} w="full">
        <FormControl w="full">
          <ModelSearchInput
            searchModel={stepCodeStore}
            inputProps={{ placeholder: t("ui.search"), width: "full" }}
            inputGroupProps={{ width: "full" }}
          />
        </FormControl>
      </Flex>

      <SearchGrid templateColumns={STEP_CODES_GRID_TEMPLATE_COLUMNS} gridRowClassName="step-code-grid-row">
        <StepCodesGridHeaders />
        {isSearching ? (
          <Flex gridColumn="span 3" justify="center" align="center" minH="200px">
            <SharedSpinner />
          </Flex>
        ) : R.isEmpty(tableStepCodes) ? (
          <GridItem gridColumn="span 3">
            <CustomMessageBox m={4} status={EFlashMessageStatus.info} description={t("stepCode.noneFound")} />
          </GridItem>
        ) : (
          tableStepCodes.map((stepCode) => <StepCodesGridRow key={stepCode.id} stepCode={stepCode} />)
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

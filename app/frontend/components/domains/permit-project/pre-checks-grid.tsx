import { Flex, FormControl, GridItem, Heading, StackProps, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPreCheck } from "../../../models/pre-check"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EPreCheckSortFields } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { PRE_CHECKS_GRID_TEMPLATE_COLUMNS, PreCheckGridHeaders } from "./pre-check-grid-header"
import { PreCheckGridRow } from "./pre-check-grid-row"

export const PreChecksGrid = observer(({ ...restProps }: StackProps) => {
  const { t } = useTranslation()
  const { preCheckStore } = useMst()
  const {
    tablePreChecks,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = preCheckStore

  return (
    <VStack align="stretch" spacing={4} w="full" {...restProps}>
      <Flex direction="column" gap={4} w="full">
        <Heading as="h3" size="lg" mb={4}>
          {t("preCheck.index.resultTitle", "Pre-checks")}
        </Heading>
        <FormControl w="full">
          <ModelSearchInput
            searchModel={preCheckStore}
            inputProps={{ placeholder: t("ui.search"), width: "full" }}
            inputGroupProps={{ width: "full" }}
          />
        </FormControl>
      </Flex>

      <SearchGrid templateColumns={PRE_CHECKS_GRID_TEMPLATE_COLUMNS} gridRowClassName="pre-check-grid-row">
        <PreCheckGridHeaders columns={Object.values(EPreCheckSortFields)} includeActionColumn />

        {isSearching ? (
          <Flex gridColumn="span 5" justify="center" align="center" minH="200px">
            <SharedSpinner />
          </Flex>
        ) : R.isEmpty(tablePreChecks) ? (
          <GridItem gridColumn="span 5">
            <CustomMessageBox
              m={4}
              status={EFlashMessageStatus.info}
              description={t("preCheck.noneFoundExplanation", "No pre-checks found")}
            />
          </GridItem>
        ) : (
          tablePreChecks.map((preCheck: IPreCheck) => <PreCheckGridRow key={preCheck.id} preCheck={preCheck} />)
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

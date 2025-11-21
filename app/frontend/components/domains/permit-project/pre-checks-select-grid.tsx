import { Flex } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EPreCheckSortFields } from "../../../types/enums"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SearchGrid } from "../../shared/grid/search-grid"
import { PRE_CHECKS_GRID_TEMPLATE_COLUMNS, PreCheckGridHeaders } from "./pre-check-grid-header"
import { PreChecksSelectGridRow } from "./pre-checks-select-grid-row"

export const PreChecksSelectGrid = observer(({ onSelect }: { onSelect: (preCheckId: string) => Promise<void> }) => {
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
  } = preCheckStore

  return (
    <>
      <SearchGrid templateColumns={PRE_CHECKS_GRID_TEMPLATE_COLUMNS} gridRowClassName="pre-check-grid-row">
        <PreCheckGridHeaders
          columns={[EPreCheckSortFields.fullAddress, EPreCheckSortFields.updatedAt]}
          includeActionColumn
        />
        {tablePreChecks.map((preCheck) => (
          <PreChecksSelectGridRow key={preCheck.id} preCheck={preCheck} onSelect={onSelect} />
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

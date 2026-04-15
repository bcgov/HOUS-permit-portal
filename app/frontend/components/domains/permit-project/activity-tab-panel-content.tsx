import { Box, Flex, HStack, Heading, Text } from "@chakra-ui/react"
import { TrendUp } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../hooks/use-search"
import { IPermitProject } from "../../../models/permit-project"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, EProjectAuditSortFields } from "../../../types/enums"
import { ISort } from "../../../types/types"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SortIcon } from "../../shared/sort-icon"
import { ActivityListItem } from "./activity-list-item"
import { AuditDateRangeFilter } from "./audit-date-range-filter"

interface IProps {
  permitProject: IPermitProject
}

export const ActivityTabPanelContent = observer(({ permitProject }: IProps) => {
  const { projectAuditStore } = useMst()
  useSearch(projectAuditStore, [permitProject.id])

  const { t } = useTranslation()
  const {
    tableProjectAudits,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = projectAuditStore

  return (
    <Flex direction="column" flex={1} bg="greys.white" p={10}>
      <Box as="section" mb={6}>
        <HStack align="center" spacing={4}>
          <TrendUp size={32} />
          <Heading as="h2" size="lg" mb={0}>
            {t("permitProject.activity.title")}
          </Heading>
        </HStack>
      </Box>
      <Text color="text.secondary" mb={8}>
        {t("permitProject.activity.description")}
      </Text>
      <Flex direction="column" w="full">
        <Flex justifyContent="space-between" align="flex-end" flexWrap="wrap" gap={4}>
          <HStack
            align="flex-end"
            spacing={4}
            flex={1}
            justifyContent="space-between"
            borderBottom="1px solid"
            borderColor="border.light"
            pb={5}
          >
            <AuditDateRangeFilter searchModel={projectAuditStore} />
            <Flex
              as="button"
              align="center"
              gap={2}
              cursor="pointer"
              onClick={() => projectAuditStore.toggleSort(EProjectAuditSortFields.createdAt)}
              fontSize="sm"
              fontWeight="bold"
              color="text.secondary"
              h="40px"
              minW="40px"
              px={3}
            >
              <Text>{t("permitProject.activity.columns.createdAt")}</Text>
              <SortIcon<EProjectAuditSortFields>
                field={EProjectAuditSortFields.createdAt}
                currentSort={projectAuditStore.sort as ISort<EProjectAuditSortFields>}
              />
            </Flex>
          </HStack>
        </Flex>
        <Box as="ul" listStyleType="none" p={0} m={0}>
          {isSearching ? (
            <Flex py={50} justify="center">
              <SharedSpinner />
            </Flex>
          ) : tableProjectAudits?.length === 0 ? (
            <Box py={8}>
              <CustomMessageBox status={EFlashMessageStatus.info} description={t("permitProject.activity.empty")} />
            </Box>
          ) : (
            tableProjectAudits?.map((projectAudit) => (
              <Box as="li" key={projectAudit.id} borderBottom="1px solid" borderColor="border.light" mb={0}>
                <ActivityListItem projectAudit={projectAudit} />
              </Box>
            ))
          )}
        </Box>
        <Flex w="full" justifyContent="space-between" mt={4}>
          <PerPageSelect
            handleCountPerPageChange={handleCountPerPageChange}
            countPerPage={countPerPage}
            totalCount={totalCount ?? 0}
          />
          <Paginator
            current={currentPage}
            total={totalCount ?? 0}
            totalPages={totalPages ?? 1}
            pageSize={countPerPage}
            handlePageChange={handlePageChange}
            showLessItems
          />
        </Flex>
      </Flex>
    </Flex>
  )
})

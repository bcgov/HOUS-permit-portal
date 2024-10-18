import { Box, Container, Flex, HStack, Heading, VStack } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearch } from "../../../../../hooks/use-search"
import { useMst } from "../../../../../setup/root"
import { IOption } from "../../../../../types/types"
import { CustomMessageBox } from "../../../../shared/base/custom-message-box"
import { Paginator } from "../../../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../../../shared/base/shared-spinner"
import { ToggleArchivedButton } from "../../../../shared/buttons/show-archived-button"
import { SearchGrid } from "../../../../shared/grid/search-grid"
import { SearchGridItem } from "../../../../shared/grid/search-grid-item"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import { AssigneeSelect } from "../../../../shared/select/selectors/assignee-select"
import { YesNoTag } from "../../../../shared/yes-no-tag"
import { CreateModal } from "./create-modal"
import { GridHeaders } from "./grid-headers"

export const EarlyAccessRequirementTemplatesIndexScreen = observer(function RequirementTemplate() {
  const { requirementTemplateStore, earlyAccessRequirementTemplateStore, userStore } = useMst()
  const {
    tableEarlyAccessRequirementTemplates,
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    handleCountPerPageChange,
    handlePageChange,
    isSearching,
  } = earlyAccessRequirementTemplateStore
  const [superAdminOptions, setSuperAdminOptions] = useState<IOption[]>([])
  const { updateRequirementTemplate } = requirementTemplateStore
  const { t } = useTranslation()

  useSearch(earlyAccessRequirementTemplateStore, [])

  const handleChangeAssignee = (requirementTemplate, assigneeId: string) => {
    updateRequirementTemplate(requirementTemplate.id, { assigneeId })
  }

  useEffect(() => {
    const fetchOptions = async () => {
      const options = await userStore.getSuperAdminOptions()
      setSuperAdminOptions(options)
    }
    fetchOptions()
  }, [userStore])

  return (
    <Container maxW="container.lg" p={8} as="main">
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"} gap={6}>
          <Box>
            <Heading as="h1" color={"text.primary"} mb={8}>
              {t("earlyAccessRequirementTemplate.index.title")}
            </Heading>

            <CustomMessageBox
              status="info"
              description={t("earlyAccessRequirementTemplate.index.invitationInfo")}
              p={1}
            />
          </Box>
          <CreateModal />
        </Flex>
        <SearchGrid templateColumns="repeat(8, 1fr)">
          <GridHeaders />

          {isSearching ? (
            <Flex py={50} gridColumn={"span 8"}>
              <SharedSpinner />
            </Flex>
          ) : (
            tableEarlyAccessRequirementTemplates.map((rt) => {
              return (
                <Box key={rt.id} className={"requirements-template-grid-row"} role={"row"} display={"contents"}>
                  <SearchGridItem>{rt.nickname}</SearchGridItem>
                  <SearchGridItem fontWeight="bold">{rt.permitType.name}</SearchGridItem>
                  <SearchGridItem fontWeight="bold">{rt.activity.name}</SearchGridItem>
                  <SearchGridItem>
                    <YesNoTag boolean={rt.firstNations} />
                  </SearchGridItem>
                  <SearchGridItem>SHARED WITH</SearchGridItem>
                  <SearchGridItem>{format(rt.updatedAt, "yyyy-MM-dd")}</SearchGridItem>
                  <SearchGridItem>
                    <AssigneeSelect
                      onChange={(userId) => handleChangeAssignee(rt, userId)}
                      defaultValue={rt.assignee && { value: rt.assignee.id, label: rt.assignee.name }}
                      options={superAdminOptions}
                      compact
                    />
                  </SearchGridItem>
                  <SearchGridItem>
                    <HStack gap={2}>
                      <RouterLinkButton to={`${rt.id}/edit`}>{t("ui.edit")}</RouterLinkButton>
                      <RouterLinkButton rightIcon={<ArrowSquareOut />} variant="secondary" to={`${rt.id}`}>
                        {t("ui.view")}
                      </RouterLinkButton>
                    </HStack>
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

        <ToggleArchivedButton searchModel={earlyAccessRequirementTemplateStore} mt={3} />
      </VStack>
    </Container>
  )
})

import { Container, ContainerProps, Tab, TabList, Tabs } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { TFilterableStatus } from "../../../stores/permit-application-store"
import { EPermitApplicationStatus, EPermitApplicationStatusGroup } from "../../../types/enums"
import { arrayEqualsAsSet } from "../../../utils/utility-functions"

interface IPermitApplicationStatusTabsProps<TSearchModel extends ISearch> extends ContainerProps {}

export const PermitApplicationStatusTabs = observer(function ToggleArchivedButton<TSearchModel extends ISearch>({
  ...rest
}: IPermitApplicationStatusTabsProps<TSearchModel>) {
  const { permitApplicationStore } = useMst()
  const queryParams = new URLSearchParams(location.search)
  const paramStatusFilterString = queryParams.get("status") as string
  const paramStatusFilter = paramStatusFilterString?.split(",") as TFilterableStatus[]

  const draftFilters = [EPermitApplicationStatus.newDraft, EPermitApplicationStatus.revisionsRequested]
  const submittedFilters = [EPermitApplicationStatus.newlySubmitted, EPermitApplicationStatus.resubmitted]

  const statusStringToIndex = (statusString: string): number => {
    const statusArray = statusString?.split(",") || []
    if (arrayEqualsAsSet(statusArray, draftFilters)) return 0
    if (arrayEqualsAsSet(statusArray, submittedFilters)) return 1
    return 0
  }

  const { statusFilter, setStatusFilter, search } = permitApplicationStore
  const [selectedIndex, setSelectedIndex] = useState(statusStringToIndex(paramStatusFilterString))

  const { t } = useTranslation()

  const indexToStatuses = (i: number): EPermitApplicationStatus[] => {
    return [draftFilters, submittedFilters][i]
  }

  const handleChange = (index: number) => {
    setSelectedIndex(index)
    setStatusFilter(indexToStatuses(index))
    search()
  }

  useEffect(() => {
    const newIndex = statusStringToIndex(paramStatusFilterString)
    if (selectedIndex != newIndex) handleChange(statusStringToIndex(paramStatusFilterString))
  }, [])

  return (
    <Container maxW="container.lg" py={3} {...rest}>
      <Tabs index={selectedIndex} onChange={handleChange}>
        <TabList>
          {Object.values(EPermitApplicationStatusGroup).map((statusGroup) => {
            return (
              <Tab key={statusGroup} px={8}>
                {t(`permitApplication.statusGroup.${statusGroup}`)}
              </Tab>
            )
          })}
        </TabList>
      </Tabs>
    </Container>
  )
})

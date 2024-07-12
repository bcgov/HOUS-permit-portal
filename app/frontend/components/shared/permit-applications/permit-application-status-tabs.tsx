import { Container, ContainerProps, Tab, TabList, Tabs } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { TFilterableStatus } from "../../../stores/permit-application-store"
import { EPermitApplicationStatusGroups } from "../../../types/enums"

interface IPermitApplicationStatusTabsProps<TSearchModel extends ISearch> extends ContainerProps {}

export const PermitApplicationStatusTabs = observer(function ToggleArchivedButton<TSearchModel extends ISearch>({
  ...rest
}: IPermitApplicationStatusTabsProps<TSearchModel>) {
  const { permitApplicationStore } = useMst()
  const queryParams = new URLSearchParams(location.search)
  const paramStatusFilter = queryParams.get("status") as TFilterableStatus

  const statusGroupToIndex = (status: EPermitApplicationStatusGroups): number => {
    const index = Object.values(EPermitApplicationStatusGroups).indexOf(status)
    return index === -1 ? 0 : index
  }

  const { statusGroupFilter, setStatusGroupFilter, search } = permitApplicationStore
  const [selectedIndex, setSelectedIndex] = useState(statusGroupToIndex(statusGroupFilter))

  const { t } = useTranslation()

  const indexToStatusGroup = (i: number): EPermitApplicationStatusGroups => {
    return Object.values(EPermitApplicationStatusGroups)[i]
  }

  const handleChange = (index: number) => {
    setSelectedIndex(index)
    setStatusGroupFilter(indexToStatusGroup(index))
    search()
  }

  useEffect(() => {
    const newIndex = statusGroupToIndex(paramStatusFilter)
    if (selectedIndex != newIndex) handleChange(statusGroupToIndex(paramStatusFilter))
  }, [])

  return (
    <Container maxW="container.lg" py={3} {...rest}>
      <Tabs index={selectedIndex} onChange={handleChange}>
        <TabList>
          {Object.values(EPermitApplicationStatusGroups).map((statusGroup) => {
            return (
              <Tab key={status} px={8}>
                {t(`permitApplication.statusGroups.${statusGroup}`)}
              </Tab>
            )
          })}
        </TabList>
      </Tabs>
    </Container>
  )
})

import { Container, ContainerProps, Tab, TabList, Tabs } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { useMst } from "../../../setup/root"
import { TFilterableStatus } from "../../../stores/permit-application-store"
import { EPermitApplicationStatus } from "../../../types/enums"

interface IPermitApplicationStatusTabsProps<TSearchModel extends ISearch> extends ContainerProps {}

export const PermitApplicationStatusTabs = observer(function ToggleArchivedButton<TSearchModel extends ISearch>({
  ...rest
}: IPermitApplicationStatusTabsProps<TSearchModel>) {
  const { permitApplicationStore } = useMst()
  const queryParams = new URLSearchParams(location.search)
  const paramStatusFilter = queryParams.get("status") as TFilterableStatus

  const statusToIndex = (status: EPermitApplicationStatus): number => {
    const index = Object.values(EPermitApplicationStatus).indexOf(status)
    return index === -1 ? 0 : index
  }

  const { statusFilter, setStatusFilter, search } = permitApplicationStore
  const [selectedIndex, setSelectedIndex] = useState(statusToIndex(statusFilter))

  const { t } = useTranslation()

  const indexToStatus = (i: number): EPermitApplicationStatus => {
    return Object.values(EPermitApplicationStatus)[i]
  }

  const handleChange = (index: number) => {
    setSelectedIndex(index)
    setStatusFilter(indexToStatus(index))
    search()
  }

  useEffect(() => {
    const newIndex = statusToIndex(paramStatusFilter)
    if (selectedIndex != newIndex) handleChange(statusToIndex(paramStatusFilter))
  }, [])

  return (
    <Container maxW="container.lg" py={3} {...rest}>
      <Tabs index={selectedIndex} onChange={handleChange}>
        <TabList>
          {Object.values(EPermitApplicationStatus).map((status) => {
            return (
              <Tab key={status} px={8}>
                {t(`permitApplication.status.${status}`)}
              </Tab>
            )
          })}
        </TabList>
      </Tabs>
    </Container>
  )
})

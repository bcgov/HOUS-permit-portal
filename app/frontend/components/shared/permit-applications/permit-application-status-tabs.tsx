import { Container, ContainerProps, Tab, TabList, Tabs } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { EPermitApplicationStatus } from "../../../types/enums"

interface IPermitApplicationStatusTabsProps<TSearchModel extends ISearch> extends ContainerProps {
  searchModel: TSearchModel
}

export const PermitApplicationStatusTabs = observer(function ToggleArchivedButton<TSearchModel extends ISearch>({
  searchModel,
  ...rest
}: IPermitApplicationStatusTabsProps<TSearchModel>) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { statusFilter, setStatusFilter, search } = searchModel

  const { t } = useTranslation()

  const indexToStatus = (i: number): EPermitApplicationStatus => {
    return Object.values(EPermitApplicationStatus)[i]
  }

  const statusToIndex = (status: EPermitApplicationStatus): number => {
    const index = Object.values(EPermitApplicationStatus).indexOf(status)
    return index === -1 ? 0 : index
  }

  const handleChange = (index: number) => {
    setSelectedIndex(index)
    setStatusFilter(indexToStatus(index))
    search()
  }

  useEffect(() => {
    setSelectedIndex(statusToIndex(statusFilter))
  }, [statusFilter])

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

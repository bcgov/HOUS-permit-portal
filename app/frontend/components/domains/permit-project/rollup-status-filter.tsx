import {
  Button,
  Checkbox,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  useCheckboxGroup,
  VStack,
} from "@chakra-ui/react"
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitProjectStore } from "../../../stores/permit-project-store"
import { EPermitProjectRollupStatus } from "../../../types/enums"

interface IProps {
  searchModel: IPermitProjectStore
}

export const RollupStatusFilter = observer(function RollupStatusFilter({ searchModel }: IProps) {
  const { t } = useTranslation()
  const { rollupStatusFilter, setRollupStatusFilter, search } = searchModel
  const [searchTerm, setSearchTerm] = useState("")

  const rollupStatuses = [
    EPermitProjectRollupStatus.empty,
    EPermitProjectRollupStatus.newDraft,
    EPermitProjectRollupStatus.revisionsRequested,
    EPermitProjectRollupStatus.newlySubmitted,
    EPermitProjectRollupStatus.resubmitted,
  ] as const

  const options = rollupStatuses.map((rollupStatus) => ({
    value: rollupStatus,
    label: t(`permitProject.rollupStatus.${rollupStatus}`),
  }))

  // @ts-ignore
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleChange = (nextValue: string[]) => {
    setRollupStatusFilter(nextValue as EPermitProjectRollupStatus[])
    search()
  }

  const handleReset = () => {
    setRollupStatusFilter([] as EPermitProjectRollupStatus[])
    search()
  }

  const { getCheckboxProps } = useCheckboxGroup({
    value: rollupStatusFilter || [],
    onChange: handleChange,
  })

  return (
    <Menu>
      <MenuButton as={Button} variant="outline" rightIcon={<CaretDown />}>
        {t("permitProject.rollupStatusFilter")}
      </MenuButton>
      <MenuList p={4} zIndex="dropdown">
        <VStack align="start" spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <MagnifyingGlass />
            </InputLeftElement>
            <Input placeholder={t("ui.search")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
          <Divider />
          {filteredOptions.map((option) => {
            const checkboxProps = getCheckboxProps({ value: option.value })
            return (
              <Checkbox key={option.value} {...checkboxProps}>
                {option.label}
              </Checkbox>
            )
          })}
          <Divider />
          <Button
            onClick={handleReset}
            variant="primary"
            size="sm"
            alignSelf="center"
            w="full"
            isDisabled={!rollupStatusFilter || rollupStatusFilter.length === 0}
          >
            {t("ui.reset")}
          </Button>
        </VStack>
      </MenuList>
    </Menu>
  )
})

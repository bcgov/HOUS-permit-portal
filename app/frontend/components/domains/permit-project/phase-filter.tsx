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
import { EPermitProjectPhase } from "../../../types/enums"

interface IProps {
  searchModel: IPermitProjectStore
}

export const PhaseFilter = observer(function PhaseFilter({ searchModel }: IProps) {
  const { t } = useTranslation()
  const { phaseFilter, setPhaseFilter, search } = searchModel
  const [searchTerm, setSearchTerm] = useState("")

  const phases = [
    EPermitProjectPhase.empty,
    EPermitProjectPhase.newDraft,
    EPermitProjectPhase.revisionsRequested,
    EPermitProjectPhase.newlySubmitted,
    EPermitProjectPhase.resubmitted,
  ] as const

  const options = phases.map((phase) => ({
    value: phase,
    label: t(`permitProject.phase.${phase}`),
  }))

  // @ts-ignore
  const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleChange = (nextValue: string[]) => {
    setPhaseFilter(nextValue as EPermitProjectPhase[])
    search()
  }

  const handleReset = () => {
    setPhaseFilter([] as EPermitProjectPhase[])
    search()
  }

  const { getCheckboxProps } = useCheckboxGroup({
    value: phaseFilter || [],
    onChange: handleChange,
  })

  return (
    <Menu>
      <MenuButton as={Button} variant="outline" rightIcon={<CaretDown />}>
        {t("permitProject.phaseFilter")}
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
            isDisabled={!phaseFilter || phaseFilter.length === 0}
          >
            {t("ui.reset")}
          </Button>
        </VStack>
      </MenuList>
    </Menu>
  )
})

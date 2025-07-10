import { Box, Button, HStack, useRadio, useRadioGroup, UseRadioProps } from "@chakra-ui/react"
import { Check } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitProjectStore } from "../../../stores/permit-project-store"
import { EPermitProjectPhase } from "../../../types/enums"

interface IProps {
  searchModel: IPermitProjectStore
}

function RadioButton(props: UseRadioProps & { children: React.ReactNode }) {
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as="label">
      <input {...input} />
      <Button
        as="div"
        {...checkbox}
        cursor="pointer"
        variant={props.isChecked ? "primary" : "greyButton"}
        size="sm"
        borderRadius="full"
        leftIcon={props.isChecked ? <Check /> : undefined}
        _focus={{
          boxShadow: "outline",
        }}
      >
        {props.children}
      </Button>
    </Box>
  )
}

export const PhaseFilter = observer(function PhaseFilter({ searchModel }: IProps) {
  const { t } = useTranslation()
  const { search } = searchModel

  const phases = [
    "all",
    EPermitProjectPhase.empty,
    EPermitProjectPhase.newDraft,
    EPermitProjectPhase.revisionsRequested,
    EPermitProjectPhase.newlySubmitted,
    EPermitProjectPhase.resubmitted,
  ] as const

  const { phaseFilter, setPhaseFilter } = searchModel

  const onFilterChange = (phase: string) => {
    setPhaseFilter(phase as EPermitProjectPhase | "all")
    search()
  }

  const selectedPhase = phaseFilter || "all"

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "phase-filter",
    value: selectedPhase,
    onChange: onFilterChange,
  })

  const group = getRootProps()

  return (
    <HStack {...group}>
      {phases.map((phase) => {
        const radio = getRadioProps({ value: phase })
        return (
          <RadioButton key={phase} {...radio}>
            {t(`permitProject.phase.${phase}`)}
          </RadioButton>
        )
      })}
    </HStack>
  )
})

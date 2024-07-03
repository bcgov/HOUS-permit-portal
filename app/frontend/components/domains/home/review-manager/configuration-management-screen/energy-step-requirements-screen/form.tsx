import { VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { useMst } from "../../../../../../setup/root"

import { EnergyStepEditableBlock } from "./energy-step-editable-block"

interface IFormProps {
  jurisdiction: IJurisdiction
}

export const Form = observer(function EnergyStepSetupForm({ jurisdiction }: IFormProps) {
  const {
    permitClassificationStore: { permitTypes },
  } = useMst()

  return (
    <VStack spacing={5}>
      {permitTypes.map((permitType) => {
        return (
          <EnergyStepEditableBlock
            key={permitType.id}
            heading={permitType.name}
            permitTypeId={permitType.id}
            jurisdiction={jurisdiction}
          />
        )
      })}
    </VStack>
  )
})

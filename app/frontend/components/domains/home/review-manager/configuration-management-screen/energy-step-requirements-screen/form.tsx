import { VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { IJurisdiction } from "../../../../../../models/jurisdiction"
import { useMst } from "../../../../../../setup/root"

import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { Part9EnergyStepEditableBlock } from "./energy-step-editable-block/part-9-energy-step-editable-block"
interface IFormProps {
  jurisdiction: IJurisdiction
}

export const Form = observer(function EnergyStepSetupForm({ jurisdiction }: IFormProps) {
  const {
    permitClassificationStore: { part9BuildingPermitType },
  } = useMst()

  if (!part9BuildingPermitType) {
    return <LoadingScreen />
  }

  return (
    <VStack spacing={5}>
      {part9BuildingPermitType && (
        <Part9EnergyStepEditableBlock
          key={part9BuildingPermitType.id}
          heading={part9BuildingPermitType.name}
          permitTypeId={part9BuildingPermitType.id}
          jurisdiction={jurisdiction}
        />
      )}
    </VStack>
  )
})

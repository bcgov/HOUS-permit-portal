import { Button, Heading, Select, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { usePermitProject } from "../../../hooks/resources/use-permit-project"
import { useMst } from "../../../setup/root"
import { IStepCode } from "../../../stores/step-code-store"
import { EStepCodeType } from "../../../types/enums"

interface IProjectReadinessTabContentProps {}

export const ProjectReadinessTabContent = observer((props: IProjectReadinessTabContentProps) => {
  const [selectedStepCodeType, setSelectedStepCodeType] = useState<EStepCodeType | "">("")
  const { stepCodeStore } = useMst()
  const { currentPermitProject } = usePermitProject()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateStepCode = async () => {
    if (!selectedStepCodeType) {
      console.warn("Please select a step code type.")
      return
    }
    const permitProjectId = currentPermitProject?.id
    if (!permitProjectId) {
      console.error("Permit Project ID is missing.")
      return
    }

    setIsCreating(true)
    let result: { ok: boolean; data?: IStepCode; error?: any } | undefined

    if (selectedStepCodeType === EStepCodeType.part3StepCode) {
      result = await stepCodeStore.createPart3StepCode({
        permitProjectId,
        checklistAttributes: { sectionCompletionStatus: {} },
      })
    } else if (selectedStepCodeType === EStepCodeType.part9StepCode) {
      result = await stepCodeStore.createPart9StepCode({
        permitProjectId,
        name: `Part 9 Step Code - ${currentPermitProject.name || permitProjectId}`.slice(0, 255),
      })
    }

    if (result && result.ok && result.data && result.data.id) {
      console.log(
        `${selectedStepCodeType} has been successfully created for project ${permitProjectId}: ID ${result.data.id}`
      )
    } else if (result) {
      console.error("Failed to Create Step Code", result.error)
    } else {
      console.error("Step code creation call did not return a result for an unknown reason.")
    }
    setIsCreating(false)
  }

  return (
    <VStack align="start" spacing={6} w="full">
      <Heading as="h4" size="md">
        Create New Step Code
      </Heading>
      <VStack align="start" spacing={3} w={{ base: "full", md: "sm" }}>
        <Select
          placeholder="Select Step Code Type"
          value={selectedStepCodeType}
          onChange={(e) => setSelectedStepCodeType(e.target.value as EStepCodeType | "")}
          isDisabled={isCreating}
        >
          <option value={EStepCodeType.part3StepCode}>Part 3 Building</option>
          <option value={EStepCodeType.part9StepCode}>Part 9 Building</option>
        </Select>
        <Button
          colorScheme="blue"
          onClick={handleCreateStepCode}
          isDisabled={!selectedStepCodeType || !currentPermitProject?.id || isCreating}
          isLoading={isCreating}
        >
          Create Step Code
        </Button>
      </VStack>
    </VStack>
  )
})

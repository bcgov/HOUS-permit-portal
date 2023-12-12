import { Box, HStack, VStack } from "@chakra-ui/react"
import React, { useState } from "react"
import { Form } from "../../shared/chefs"
import { SortableTree } from "./sortable-tree"
import stubbedForm from "./stubs/test_permit_application_schema.json"
import { TreeItems } from "./types"
import { buildDnDTreeFromFormioComponents, buildFormFromTreeItems } from "./utils"

export function PermitApplicationBuilderScreen() {
  const [form, setForm] = useState(stubbedForm)

  const dragEndCallback = (newItems: TreeItems) => {
    const newForm = buildFormFromTreeItems(newItems)

    setForm(newForm)
  }
  return (
    <VStack as={"main"} w={"full"} h={"full"}>
      <HStack spacing={10} w={"full"} h={"full"} alignItems={"flex-start"} pr={8}>
        <Box as={"section"} h={"full"} maxH={"full"}>
          <SortableTree
            collapsible
            indicator
            removable
            defaultItems={buildDnDTreeFromFormioComponents(stubbedForm.components)}
            dragEndCallback={dragEndCallback}
            indentationWidth={35}
          />
        </Box>
        <Box as={"section"} flex={1}>
          <Form form={form} onSubmit={console.log} />
        </Box>
      </HStack>
    </VStack>
  )
}

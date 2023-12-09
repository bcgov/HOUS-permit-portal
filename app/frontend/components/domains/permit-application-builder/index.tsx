import { Box, HStack, VStack } from "@chakra-ui/react"
import { Form } from "@formio/react"
import "bootstrap/dist/css/bootstrap.css"
import "formiojs/dist/formio.form.min.css"
import clone from "ramda/src/clone"
import React, { useState } from "react"
import { SortableTree } from "./sortable-tree"
import { TreeItems } from "./sortable-tree/types"
import stubbedForm from "./stubs/test_permit_application_schema.json"

function buildDnDTreeFromFormIoComponents(formIoComponents): TreeItems {
  const clonedComponents = clone(formIoComponents)

  const build = (components) => {
    components.forEach((component) => {
      component.id = component.key
      if ("components" in component) {
        component.children = component.components
        delete component.components
      } else {
        component.children = []
      }

      build(component.children)
    })
  }

  build(clonedComponents)

  return clonedComponents
}

function buildFormFromTreeItems(treeItems: TreeItems) {
  const clonedTreeItems = clone(treeItems)

  const build = (items: TreeItems) => {
    items.forEach((component) => {
      delete component.id
      if ("children" in component) {
        component.components = component.children
        delete component.children
      }

      build(component.components)
    })
  }

  build(clonedTreeItems)

  return {
    display: "form",
    components: clonedTreeItems,
  }
}

export function PermitApplicationBuilderScreen() {
  const [form, setForm] = useState(stubbedForm)

  const dragEndCallback = (newItems: TreeItems) => {
    const newForm = buildFormFromTreeItems(newItems)

    console.log("xyd 2", JSON.stringify(newForm, null, 2))
    setForm(newForm)
  }
  return (
    <VStack as={"main"} w={"full"} h={"full"}>
      <HStack spacing={10} w={"full"} h={"full"} alignItems={"flex-start"} pr={8}>
        <Box as={"section"}>
          <SortableTree
            collapsible
            indicator
            removable
            defaultItems={buildDnDTreeFromFormIoComponents(stubbedForm.components)}
            dragEndCallback={dragEndCallback}
          />
        </Box>
        <Box as={"section"} flex={1}>
          <Form form={form} onSubmit={console.log} />
        </Box>
      </HStack>
    </VStack>
  )
}

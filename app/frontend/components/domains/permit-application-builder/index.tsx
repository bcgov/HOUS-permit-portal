import { HStack, VStack } from "@chakra-ui/react"
import { Form } from "@formio/react"
import "bootstrap/dist/css/bootstrap.css"
import "formiojs/dist/formio.form.min.css"
import React from "react"
import { SortableTree } from "./sortable-tree"
import stubbedForm from "./stubs/test_permit_application_schema.json"

export function PermitApplicationBuilderScreen() {
  return (
    <VStack as={"main"} w={"full"} h={"full"}>
      <HStack spacing={10} w={"full"} h={"full"} alignItems={"flex-start"}>
        <SortableTree collapsible indicator removable />
        <Form form={stubbedForm} onSubmit={console.log} />
      </HStack>
    </VStack>
  )
}

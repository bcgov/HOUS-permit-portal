import { Box, HStack, VStack } from "@chakra-ui/react"
import React, { useState } from "react"
import stubbedForm from "../../domains/permit-application-builder/stubs/test_permit_application_schema.json"
import { Form } from "../chefs"

export function RequirementForm() {
  const [form, setForm] = useState(stubbedForm)
  //setForm to load
  return (
    <VStack as={"main"} w={"full"} h={"full"}>
      <HStack spacing={10} w={"full"} h={"full"} alignItems={"flex-start"} pr={8}>
        <Box as={"section"} flex={1}>
          <Form form={form} onSubmit={console.log} />
        </Box>
      </HStack>
    </VStack>
  )
}

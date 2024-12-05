import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../setup/root"
import { useNavigate } from "react-router-dom"
import { ErrorScreen } from "../../shared/base/error-screen"
import { TextFormControl } from "../../shared/form/input-form-control"

export type TEditJurisdictionFormData = {
  name: string
}

interface IEditJurisdictionScreenProps {}

export const EditJurisdictionScreen = observer(({}: IEditJurisdictionScreenProps) => {
  const { t } = useTranslation()
  const { currentJurisdiction, error } = useJurisdiction()
  const { jurisdictionStore } = useMst()
 // const { currentJurisdiction } = jurisdictionStore
  
  const getDefaults = () => ({ name: currentJurisdiction?.name })
  
  const formMethods = useForm<TEditJurisdictionFormData>({
    mode: "onChange",
    defaultValues: { name: currentJurisdiction?.name },
  })
  const { handleSubmit, formState, control, watch } = formMethods
  const { isSubmitting } = formState
  const nameWatch = watch('name')
  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    console.log(formData);
    //await update(formData)
  }

  
   if (error) return <ErrorScreen error={error} />
  
  return (
    <Container maxW="container.lg" p={8} as="main">
      {nameWatch}
      {/* {currentJurisdiction?.name} */}
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
            <Heading as="h1" alignSelf="center">
              {t("jurisdiction.edit.title")}
            </Heading>
                <Flex
                  direction="column"
                  as="section"
                  gap={6}
                  w="full"
                  p={6}
                  border="solid 1px"
                  borderColor="border.light"
                >
                  <Flex gap={8}>
                    <Box w="100%">
                      {/* <TextFormControl label={t("jurisdiction.new.nameLabel")} fieldName={"name"} required /> */}
                    </Box>
                  </Flex>
                </Flex>
                <Flex gap={4}>
                   <Button
                    variant="primary"
                    type="submit"
                     isLoading={isSubmitting}
                  >
                    {t("jurisdiction.edit.updateButton")}
                  </Button> 
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    {t("ui.cancel")}
                  </Button>
                </Flex>
            </VStack>
        </form>
      </FormProvider>
    </Container>
  )
})

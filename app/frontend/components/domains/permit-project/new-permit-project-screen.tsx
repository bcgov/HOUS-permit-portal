import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react"
// import { zodResolver } from "@hookform/resolvers/zod" // Removed
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
// import * as z from "zod" // Removed Zod import
import { useMst } from "../../../setup/root"

// Define the form data type manually
interface TPermitProjectFormData {
  name: string
  description?: string
  fullAddress?: string
  pid?: string
  pin?: string
  propertyPlanJurisdictionId?: string
}

export const NewPermitProjectScreen = observer(() => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TPermitProjectFormData>({
    defaultValues: {
      name: "", // Initialize name as an empty string
      description: "",
      fullAddress: "",
      pid: "",
      pin: "",
      propertyPlanJurisdictionId: "",
    },
  })
  const navigate = useNavigate()
  const { permitProjectStore } = useMst()

  const onSubmit = async (data: TPermitProjectFormData) => {
    const result = await permitProjectStore.createPermitProject(data)
    if (result.ok && result.data) {
      navigate(`/permit-projects/${result.data.id}`)
    }
  }

  return (
    <Container maxW="container.md" py={10}>
      <Heading mb={6}>{t("permitProject.newProjectTitle")}</Heading>
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.name}>
            <FormLabel htmlFor="name">{t("permitProject.name")}</FormLabel>
            <Input
              id="name"
              {...register("name", {
                required: t("ui.isRequired", { field: t("permitProject.name") }) as string,
              })}
            />
            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.description}>
            <FormLabel htmlFor="description">{t("permitProject.description")}</FormLabel>
            <Textarea id="description" {...register("description")} />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.fullAddress}>
            <FormLabel htmlFor="fullAddress">{t("permitProject.fullAddress")}</FormLabel>
            <Input id="fullAddress" {...register("fullAddress")} />
            <FormErrorMessage>{errors.fullAddress?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.pid}>
            <FormLabel htmlFor="pid">{t("permitProject.pid")}</FormLabel>
            <Input id="pid" {...register("pid")} />
            <FormErrorMessage>{errors.pid?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.pin}>
            <FormLabel htmlFor="pin">{t("permitProject.pin")}</FormLabel>
            <Input id="pin" {...register("pin")} />
            <FormErrorMessage>{errors.pin?.message}</FormErrorMessage>
          </FormControl>

          {/* Add PropertyPlanJurisdiction select if needed
          <FormControl isInvalid={!!errors.propertyPlanJurisdictionId}>
            <FormLabel htmlFor="propertyPlanJurisdictionId">{t("permitProject.propertyPlanJurisdictionId")}</FormLabel> // Ensure this translation key exists if uncommented
            <Input id="propertyPlanJurisdictionId" {...register("propertyPlanJurisdictionId")} />
            <FormErrorMessage>{errors.propertyPlanJurisdictionId?.message}</FormErrorMessage>
          </FormControl>
          */}

          <Button mt={4} colorScheme="blue" isLoading={isSubmitting} type="submit">
            {t("permitProject.createProjectButton")}
          </Button>
        </VStack>
      </Box>
    </Container>
  )
})

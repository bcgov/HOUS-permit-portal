import {
  Box,
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Plus, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { FormFooter } from "./form-footer"

interface IRoomEntry {
  roomName: string
  heating: string
  cooling: string
}

interface IRoomByRoomFormData {
  rooms: IRoomEntry[]
  ventilationLoss: string
  latentGain: string
}

export const RoomByRoom = observer(function RoomByRoom() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const existingRooms: IRoomEntry[] =
    currentOverheatingCode?.roomResults?.map((r: any) => ({
      roomName: r.roomName ?? "",
      heating: r.heating?.toString() ?? "",
      cooling: r.cooling?.toString() ?? "",
    })) ?? []

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IRoomByRoomFormData>({
    defaultValues: {
      rooms:
        existingRooms.length > 0
          ? existingRooms
          : Array.from({ length: 5 }, () => ({ roomName: "", heating: "", cooling: "" })),
      ventilationLoss: currentOverheatingCode?.ventilationLoss?.toString() ?? "",
      latentGain: currentOverheatingCode?.latentGain?.toString() ?? "",
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "rooms" })

  const onSubmit = async (data: IRoomByRoomFormData) => {
    if (!currentOverheatingCode) return
    const roomResults = data.rooms
      .filter((r) => r.roomName.trim() !== "")
      .map((r) => ({
        roomName: r.roomName,
        heating: r.heating ? parseFloat(r.heating) : null,
        cooling: r.cooling ? parseFloat(r.cooling) : null,
      }))

    await updateOverheatingCode(currentOverheatingCode.id, {
      roomResults,
      ventilationLoss: data.ventilationLoss ? parseFloat(data.ventilationLoss) : null,
      latentGain: data.latentGain ? parseFloat(data.latentGain) : null,
    })
  }

  const numberValidation = {
    validate: (value: string) => {
      if (!value) return true
      const num = parseFloat(value)
      if (isNaN(num) || num < 0) {
        return t("overheatingCode.sections.roomByRoom.invalidNumber", "Must be a valid positive number")
      }
      return true
    },
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.roomByRoom.title", "Calculation Results — Room by Room")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.roomByRoom.description",
          "Enter heat loss and heat gain for each room. This section applies when the submittal type is Room by Room."
        )}
      </Text>

      <VStack spacing={4} align="stretch" mb={6}>
        {fields.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3} px={2} display={{ base: "none", md: "grid" }}>
            <Text fontWeight="bold" fontSize="sm">
              #
            </Text>
            <Text fontWeight="bold" fontSize="sm">
              {t("overheatingCode.sections.roomByRoom.roomNameHeader", "Room Name")}
            </Text>
            <Text fontWeight="bold" fontSize="sm">
              {t("overheatingCode.sections.roomByRoom.heatingHeader", "Heating (Btu/h)")}
            </Text>
            <Text fontWeight="bold" fontSize="sm">
              {t("overheatingCode.sections.roomByRoom.coolingHeader", "Cooling (Btu/h)")}
            </Text>
          </SimpleGrid>
        )}

        {fields.map((field, index) => (
          <HStack key={field.id} spacing={3} align="flex-start">
            <Text fontWeight="semibold" fontSize="sm" minW="24px" pt={2} textAlign="right">
              {index + 1}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} flex={1}>
              <FormControl isInvalid={!!errors.rooms?.[index]?.roomName}>
                <Input
                  size="sm"
                  {...register(`rooms.${index}.roomName`, {
                    required: t("overheatingCode.sections.roomByRoom.roomNameRequired", "Room name is required"),
                  })}
                  placeholder={t("overheatingCode.sections.roomByRoom.roomNamePlaceholder", "e.g. Kitchen")}
                />
                <FormErrorMessage fontSize="xs">{errors.rooms?.[index]?.roomName?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.rooms?.[index]?.heating}>
                <InputGroup size="sm">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`rooms.${index}.heating`, numberValidation)}
                    placeholder="0"
                  />
                  <InputRightAddon>Btu/h</InputRightAddon>
                </InputGroup>
                <FormErrorMessage fontSize="xs">{errors.rooms?.[index]?.heating?.message}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.rooms?.[index]?.cooling}>
                <InputGroup size="sm">
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`rooms.${index}.cooling`, numberValidation)}
                    placeholder="0"
                  />
                  <InputRightAddon>Btu/h</InputRightAddon>
                </InputGroup>
                <FormErrorMessage fontSize="xs">{errors.rooms?.[index]?.cooling?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
            <IconButton
              aria-label={t("overheatingCode.sections.roomByRoom.removeRoom", "Remove room")}
              icon={<X />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => remove(index)}
              mt={0.5}
            />
          </HStack>
        ))}

        <Button
          size="sm"
          variant="ghost"
          leftIcon={<Plus />}
          onClick={() => append({ roomName: "", heating: "", cooling: "" })}
          alignSelf="flex-start"
        >
          {t("overheatingCode.sections.roomByRoom.addRoom", "Add Room")}
        </Button>
      </VStack>

      <Divider mb={6} />

      <Heading as="h4" size="sm" mb={4}>
        {t("overheatingCode.sections.roomByRoom.summaryTitle", "Summary Values")}
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={4}>
        <FormControl isInvalid={!!errors.ventilationLoss}>
          <FormLabel fontWeight="bold">
            {t("overheatingCode.sections.roomByRoom.ventilationLossLabel", "Ventilation Loss")}
          </FormLabel>
          <Text fontSize="xs" color="text.secondary" mb={1}>
            {t(
              "overheatingCode.sections.roomByRoom.ventilationLossHint",
              "If calculated separately from individual room losses"
            )}
          </Text>
          <InputGroup>
            <Input type="number" step="0.01" {...register("ventilationLoss", numberValidation)} placeholder="0" />
            <InputRightAddon>Btu/h</InputRightAddon>
          </InputGroup>
          <FormErrorMessage>{errors.ventilationLoss?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.latentGain}>
          <FormLabel fontWeight="bold">
            {t("overheatingCode.sections.roomByRoom.latentGainLabel", "Latent Gain")}
          </FormLabel>
          <Text fontSize="xs" color="text.secondary" mb={1}>
            {t(
              "overheatingCode.sections.roomByRoom.latentGainHint",
              "If calculated separately from individual room gains"
            )}
          </Text>
          <InputGroup>
            <Input type="number" step="0.01" {...register("latentGain", numberValidation)} placeholder="0" />
            <InputRightAddon>Btu/h</InputRightAddon>
          </InputGroup>
          <FormErrorMessage>{errors.latentGain?.message}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>

      {(currentOverheatingCode?.minimumHeatingCapacity != null ||
        currentOverheatingCode?.nominalCoolingCapacity != null) && (
        <Box bg="gray.50" border="1px solid" borderColor="border.light" borderRadius="md" p={4} mb={2}>
          <Text fontWeight="bold" fontSize="sm" mb={2}>
            {t(
              "overheatingCode.sections.roomByRoom.totalsTitle",
              "Total Building Loss (5.2.7) & Nominal Cooling Capacity (6.3.1)"
            )}
          </Text>
          <SimpleGrid columns={2} spacing={4}>
            <Text fontSize="sm">
              {t("overheatingCode.sections.roomByRoom.totalBuildingLoss", "Total Building Loss")}:{" "}
              <Text as="span" fontWeight="semibold">
                {currentOverheatingCode?.minimumHeatingCapacity != null
                  ? `${currentOverheatingCode.minimumHeatingCapacity.toLocaleString()} Btu/h`
                  : "—"}
              </Text>
            </Text>
            <Text fontSize="sm">
              {t("overheatingCode.sections.roomByRoom.nominalCoolingCapacity", "Nominal Cooling Capacity")}:{" "}
              <Text as="span" fontWeight="semibold">
                {currentOverheatingCode?.nominalCoolingCapacity != null
                  ? `${currentOverheatingCode.nominalCoolingCapacity.toLocaleString()} Btu/h`
                  : "—"}
              </Text>
            </Text>
          </SimpleGrid>
        </Box>
      )}

      <FormFooter<IRoomByRoomFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})

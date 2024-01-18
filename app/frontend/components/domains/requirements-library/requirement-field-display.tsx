import {
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  FormLabelProps,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
} from "@chakra-ui/react"
import { faCalendar, faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ERequirementType } from "../../../types/enums"

const labelProps: Partial<FormLabelProps> = {
  fontWeight: 700,
}

type TRequirementPropsMap = {
  [ERequirementType.text]: { id: string }
}

type TRequirementProps<T extends ERequirementType> = T extends keyof TRequirementPropsMap ? TRequirementPropsMap[T] : {}

const requirementsComponentMap = {
  [ERequirementType.text]({}: TRequirementProps<ERequirementType.text>) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{t("requirementsLibrary.requirementTypeLabels.address")}</FormLabel>
        <InputGroup>
          <InputLeftElement>
            <FontAwesomeIcon icon={faLocationDot} />
          </InputLeftElement>
          <Input bg={"white"} />
        </InputGroup>
      </FormControl>
    )
  },

  [ERequirementType.address]() {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{t("requirementsLibrary.requirementTypeLabels.address")}</FormLabel>
        <InputGroup>
          <InputLeftElement>
            <FontAwesomeIcon icon={faLocationDot} />
          </InputLeftElement>
          <Input bg={"white"} />
        </InputGroup>
      </FormControl>
    )
  },

  [ERequirementType.date]() {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{t("requirementsLibrary.requirementTypeLabels.date")}</FormLabel>
        <InputGroup w={"166px"}>
          <InputLeftElement>
            <FontAwesomeIcon icon={faCalendar} />
          </InputLeftElement>
          <Input bg={"white"} />
        </InputGroup>
      </FormControl>
    )
  },

  [ERequirementType.number]() {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{t("requirementsLibrary.requirementTypeLabels.number")}</FormLabel>
        <InputGroup w={"130px"}>
          <InputRightElement mr={2}>unit</InputRightElement>
          <Input bg={"white"} />
        </InputGroup>
      </FormControl>
    )
  },

  [ERequirementType.textArea]() {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{t("requirementsLibrary.requirementTypeLabels.textArea")}</FormLabel>
        <Textarea bg={"white"} _hover={{ borderColor: "border.base" }} />
      </FormControl>
    )
  },

  [ERequirementType.radio]() {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{t("requirementsLibrary.requirementTypeLabels.radio")}</FormLabel>
        <RadioGroup defaultValue="1">
          <Stack>
            <Radio value="option 1">{t("requirementsLibrary.fieldsDrawer.dummyOption")}</Radio>
            <Radio value="option 2">{t("requirementsLibrary.fieldsDrawer.dummyOption")}</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
    )
  },

  [ERequirementType.multiSelectCheckbox]() {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{t("requirementsLibrary.requirementTypeLabels.multiSelectCheckbox")}</FormLabel>
        <CheckboxGroup>
          <Stack>
            <Checkbox value="option 1">{t("requirementsLibrary.fieldsDrawer.dummyOption")}</Checkbox>
            <Checkbox value="option 2">{t("requirementsLibrary.fieldsDrawer.dummyOption")}</Checkbox>
          </Stack>
        </CheckboxGroup>
      </FormControl>
    )
  },
}

type TProps<T extends ERequirementType> = { requirementType: ERequirementType } & TRequirementProps<T>

export function hasRequirementFieldDisplayComponent(requirementType: ERequirementType): boolean {
  return !!requirementsComponentMap[requirementType]
}

export const RequirementFieldDisplay = observer(function RequirementFieldDisplay<T extends ERequirementType>({
  requirementType,
  ...rest
}: TProps<T>) {
  return requirementsComponentMap[requirementType]?.(rest) ?? null
})

import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Portal,
  StackDivider,
  VStack,
} from "@chakra-ui/react"
import { CaretDown } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../../../setup/root"
import { EStepCodeAirtightnessValue } from "../../../../../types/enums"
import { translationPrefix } from "./translation-prefix"

interface IProps {
  onChange: (event: any) => void
  value: EStepCodeAirtightnessValue
}

export const AirtightnessSelect = observer(function AirtightnessSelect({ onChange, value }: IProps) {
  const {
    stepCodeStore: { selectOptions },
  } = useMst()

  return (
    <Popover placement="bottom-end">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <InputGroup w={320}>
              <Input
                as={Flex}
                bg="white"
                cursor="pointer"
                alignItems="center"
                borderColor="gray.200"
                borderWidth={1}
                rounded="base"
                shadow="base"
              >
                {value
                  ? t(`${translationPrefix}.airtightnessValue.options.${value}`)
                  : t(`${translationPrefix}.airtightnessValue.select`)}
              </Input>
              <InputRightElement children={<CaretDown color="gray.300" />} />
            </InputGroup>
          </PopoverTrigger>
          <Portal>
            <PopoverContent minW={320}>
              <VStack align="start" spacing={0} divider={<StackDivider borderColor="border.light" />}>
                {selectOptions.airtightnessValues.map((value) => (
                  <Flex
                    key={value}
                    onClick={() => {
                      onChange(value)
                      onClose()
                    }}
                    px={2}
                    py={1.5}
                    w="full"
                    cursor="pointer"
                    _hover={{ bg: "hover.blue" }}
                  >
                    {t(`${translationPrefix}.airtightnessValue.options.${value}`)}
                  </Flex>
                ))}
              </VStack>
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  )
})

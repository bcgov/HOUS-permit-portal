import {
  Box,
  Circle,
  Flex,
  FlexProps,
  Heading,
  Image,
  Text,
  UseRadioProps,
  useRadio,
  useRadioGroup,
} from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { IPermitType } from "../../../models/permit-classification"
import { IOption } from "../../../types/types"
import { SharedSpinner } from "../base/shared-spinner"

interface IPermitTypeRadioSelect extends FlexProps {
  fetchOptions: () => Promise<IOption<IPermitType>[]>
  onChange: (value) => void
  value: string
  isLoading: boolean
}

export const PermitTypeRadioSelect = ({
  onChange,
  value,
  fetchOptions,
  isLoading,
  ...rest
}: IPermitTypeRadioSelect) => {
  const { getRadioProps } = useRadioGroup({
    name: "permitType",
    defaultValue: null,
    onChange: onChange,
  })

  const [permitTypeOptions, setPermitTypeOptions] = useState<IOption<IPermitType>[]>([])

  useEffect(() => {
    ;(async () => {
      setPermitTypeOptions(await fetchOptions())
    })()
  }, [])

  if (isLoading) return <SharedSpinner />

  return (
    <Flex gap={4} flexWrap="wrap" role="radiogroup" {...rest}>
      {permitTypeOptions.map((option) => {
        const radio = getRadioProps({ value: option.value.id })
        return <PermitTypeRadioCard key={option.value.id} permitType={option.value} {...radio} />
      })}
    </Flex>
  )
}

interface IPermitTypeRadioCardProps extends UseRadioProps {
  permitType: IPermitType
}

export const PermitTypeRadioCard = (props: IPermitTypeRadioCardProps) => {
  const { getInputProps, getRadioProps } = useRadio(props)
  const { permitType, isChecked } = props

  const input = getInputProps()
  const checkbox = getRadioProps()

  return (
    <Box as="label" role="radio">
      <input aria-label={`${permitType.name} selector`} {...input} />
      <Flex
        {...checkbox}
        direction="column"
        gap={4}
        align="center"
        cursor="pointer"
        borderWidth="1px"
        borderRadius="sm"
        borderColor="border.light"
        _checked={{
          borderColor: "theme.blueAlt",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        p={4}
      >
        <Flex direction="column" w="full">
          <Flex gap={4} flex={1}>
            <Circle size="15px" bg={isChecked ? "theme.blueAlt" : "greys.grey02"} zIndex={10} />
            <Heading as="h3" fontSize="lg" mb={0}>
              {permitType.name}
            </Heading>
          </Flex>
          <Text alignSelf="center" mt={2}>
            {permitType.description}
          </Text>
        </Flex>
        <Flex justifyContent="center" width="full" bg="semantic.infoLight">
          <Image width="40" src={permitType.imageUrl} alt={permitType.name} objectFit="contain" />
        </Flex>
      </Flex>
    </Box>
  )
}

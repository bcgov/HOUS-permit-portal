import { Box, Radio, RadioGroup, RadioGroupProps, Stack, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IOption } from "../../../../types/types"

interface ISandboxSelectProps extends Omit<RadioGroupProps, "onChange"> {
  onChange: (value: string) => void
  value?: string // Make value optional
  options: IOption[]
  includeLive?: boolean
}

export const SandboxSelect = observer(function SandboxSelect({
  onChange,
  value,
  options,
  includeLive,
  ...rest
}: ISandboxSelectProps) {
  const { t } = useTranslation()
  return (
    <RadioGroup
      id="sandbox-select"
      aria-label="Select a sandbox"
      w="full"
      onChange={onChange}
      value={value || ""}
      {...rest}
    >
      <Stack>
        {includeLive && (
          <Radio value="" size="lg" alignItems="flex-start">
            <Box transform="translateY(-4px)">
              <Text fontWeight="bold">{t("sandbox.live")}</Text>
            </Box>
          </Radio>
        )}
        {options.map((s) => (
          <Radio key={s.value} value={s.value} size="lg" alignItems="flex-start">
            <Box transform="translateY(-4px)">
              <Text fontWeight="bold" mb={1}>
                {s.label}
              </Text>
              {s.description && (
                <Text color="gray.600" fontSize="sm">
                  {s.description}
                </Text>
              )}
            </Box>
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  )
})

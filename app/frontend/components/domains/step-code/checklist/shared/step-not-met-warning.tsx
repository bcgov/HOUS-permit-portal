import { Alert, AlertProps, Box, Button } from "@chakra-ui/react"
import { WarningCircle } from "@phosphor-icons/react"
import React from "react"
import { Trans } from "react-i18next"

interface IProps extends AlertProps {
  i18nKey: "energyStepNotMet" | "zeroCarbonStepNotMet"
  scrollToSection: () => void
}

export function StepNotMetWarning({ i18nKey, scrollToSection, ...rest }: IProps) {
  return (
    <Alert
      status="error"
      rounded="lg"
      borderWidth={1}
      borderColor="semantic.error"
      bg="semantic.errorLight"
      gap={2}
      color="text.primary"
      {...rest}
    >
      <WarningCircle color="var(--chakra-colors-semantic-error)" />
      <Box>
        <Trans
          i18nKey={`stepCodeChecklist.edit.${i18nKey}`}
          components={{
            1: <Button variant="link" onClick={scrollToSection} />,
          }}
        />
      </Box>
    </Alert>
  )
}

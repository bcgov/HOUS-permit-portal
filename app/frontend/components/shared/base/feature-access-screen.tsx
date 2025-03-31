import { Box, Container, Divider, Grid, GridItem, Heading, Text } from "@chakra-ui/react"
import { ArrowRight } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

interface FeatureItem {
  label: string
  enabled?: boolean
  route: string
}

interface FeatureAccessScreenProps {
  i18nPrefix: string
  title: string
  description: string
  features: FeatureItem[]
}

export const FeatureAccessScreen: React.FC<FeatureAccessScreenProps> = ({
  i18nPrefix,
  title,
  description,
  features,
}) => {
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" p={8} as={"main"} py={8} flexGrow={1}>
      <Box w="full">
        <Heading as="h1" pt={3}>
          {title}
        </Heading>
        <Text color="text.secondary" my={6}>
          {description}
        </Text>
      </Box>
      <Grid templateColumns="90% 10%" gap={4} w="full">
        {features.map((feature, index) => (
          <FeatureRow
            key={index}
            label={feature.label}
            enabled={feature.enabled}
            route={feature.route}
            i18nPrefix={i18nPrefix}
          />
        ))}
      </Grid>
    </Container>
  )
}

// Feature row component for reuse
const FeatureRow = ({
  label,
  enabled,
  route,
  i18nPrefix,
}: {
  label: string
  enabled?: boolean
  route: string
  i18nPrefix: string
}) => {
  const { t } = useTranslation()

  return (
    <>
      <GridItem>
        <Text>{label}</Text>
      </GridItem>
      <GridItem display="flex" justifyContent="flex-end">
        <RouterLinkButton
          display="flex"
          justifyContent="space-between"
          rightIcon={<ArrowRight size={20} />}
          to={route}
          variant="tertiary"
          w={28}
        >
          {enabled ? t(`${i18nPrefix}.toggleOn`) : t(`${i18nPrefix}.toggleOff`)}
        </RouterLinkButton>
      </GridItem>
      <GridItem colSpan={2}>
        <Divider />
      </GridItem>
    </>
  )
}

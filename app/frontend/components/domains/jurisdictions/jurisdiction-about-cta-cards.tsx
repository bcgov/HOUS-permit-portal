import { Grid, GridItem } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { HighlightedCtaCard } from "../../shared/cta/highlighted-cta-card"
import { SoftCtaCard } from "../../shared/cta/soft-cta-card"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export function JurisdictionAboutCtaCards() {
  const { t } = useTranslation()

  return (
    <Grid w="full" templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={8}>
      <GridItem minW={0}>
        <HighlightedCtaCard
          title={t("jurisdiction.cta.apply.title")}
          description={t("jurisdiction.cta.apply.description")}
          action={
            <RouterLinkButton to="/projects" variant="primaryInverse">
              {t("jurisdiction.cta.apply.button")}
            </RouterLinkButton>
          }
        />
      </GridItem>
      <GridItem minW={0}>
        <SoftCtaCard
          title={t("jurisdiction.cta.tools.title")}
          description={t("jurisdiction.cta.tools.description")}
          action={
            <RouterLinkButton to="/project-readiness-tools" variant="primaryInverse">
              {t("jurisdiction.cta.tools.button")}
            </RouterLinkButton>
          }
        />
      </GridItem>
    </Grid>
  )
}

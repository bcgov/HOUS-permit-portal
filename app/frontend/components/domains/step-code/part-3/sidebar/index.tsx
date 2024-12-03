import { VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { SectionHeader } from "./section-header"
import { SectionLink } from "./section-link"
import { SubLink } from "./sub-link"

export const Sidebar = observer(function Part3StepCodeSidebar() {
  const navSections = [
    {
      title: t("stepCode.part3.sidebar.overview"),
      navLinks: [
        {
          title: t("stepCode.part3.sidebar.start"),
          location: "start",
          subLinks: [],
        },
        {
          title: t("stepCode.part3.sidebar.projectDetails"),
          location: "project-details",
          subLinks: [],
        },
        {
          title: t("stepCode.part3.sidebar.energySetup"),
          location: "energy-setup",
          subLinks: [],
        },
        {
          title: t("stepCode.part3.sidebar.districtEnergy"),
          location: "district-energy",
          subLinks: [],
        },
      ],
    },
    {
      title: t("stepCode.part3.sidebar.compliance"),
      navLinks: [
        {
          title: t("stepCode.part3.sidebar.baselineOccupancies"),
          location: "baseline-occupancies",
          subLinks: [
            {
              title: t("stepCode.part3.sidebar.baselineDetails"),
              location: "details",
            },
          ],
        },
        {
          title: t("stepCode.part3.sidebar.fuelTypes"),
          location: "fuel-types",
          subLinks: [],
        },
      ],
    },
  ]

  return (
    <VStack w="full" align="stretch">
      {navSections.map((section) => (
        <React.Fragment key={section.title}>
          <SectionHeader title={section.title} />
          {section.navLinks.map((navLink) => (
            <React.Fragment key={navLink.title}>
              <SectionLink navLink={navLink} />
              {navLink.subLinks.map((subLink) => (
                <SubLink key={subLink.title} subLink={subLink} />
              ))}
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </VStack>
  )
})

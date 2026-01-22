import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Grid,
  Heading,
  IconButton,
  Show,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { List, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { LinkProps, useLocation } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { RouterLink } from "../../shared/navigation/router-link"
import { LoggedOutMenuContent } from "./menu-content/logged-out-menu-content"
import { MenuCloseProvider } from "./menu-content/menu-link-item"
import { ReviewManagerMenuContent } from "./menu-content/review-manager-menu-content"
import { ReviewerMenuContent } from "./menu-content/reviewer-menu-content"
import { SubmitterMenuContent } from "./menu-content/submitter-menu-content"
import { SuperAdminMenuContent } from "./menu-content/super-admin-menu-content"
import { TechnicalSupportMenuContent } from "./menu-content/technical-support-menu-content"

interface INavBarMenuProps {}

interface IStaticLinkItemProps extends LinkProps {
  label: string
  to: string
  description?: string
}

const StaticLinkItem = ({ label, to, description, ...props }: IStaticLinkItemProps) => {
  return (
    <VStack align="flex-start" spacing={1} w="full">
      <RouterLink to={to} fontWeight="bold" {...props}>
        {label}
      </RouterLink>
      {description && <Text>{description}</Text>}
    </VStack>
  )
}

interface IMenuSectionProps {
  title: string
  children: React.ReactNode
}

const MenuSection = ({ title, children }: IMenuSectionProps) => {
  return (
    <VStack align="flex-start" spacing={4} w="full">
      <Heading as="h2" color="text.primary" mb={2}>
        {title}
      </Heading>
      {children}
    </VStack>
  )
}

export const NavBarMenu = observer(function NavBarMenu({}: INavBarMenuProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { sessionStore, userStore } = useMst()
  const { currentUser } = userStore
  const { loggedIn } = sessionStore
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure()
  const [menuOffset, setMenuOffset] = useState<string>("var(--app-navbar-height)")

  const handleToggle = () => {
    if (!isOpen) {
      const nav = document.getElementById("mainNav")
      if (nav) {
        setMenuOffset(`${nav.getBoundingClientRect().bottom}px`)
      }
    }
    onToggle()
  }

  // Close drawer when route changes
  useEffect(() => {
    onClose()
  }, [location.pathname])

  // Close menu when clicking outside (including the navbar above the drawer)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen) {
        const target = event.target as HTMLElement
        const isButton = target.closest('[aria-label="menu dropdown button"]')
        const isDrawer = target.closest(".chakra-modal__content")

        if (!isButton && !isDrawer) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Column 1 - Project readiness tools
  const projectReadinessColumn = (
    <VStack align="flex-start" spacing={4} w="full">
      <MenuSection title={t("home.projectReadinessTools.title")}>
        <StaticLinkItem
          label={t("site.navMenu.projectReadiness.all.label")}
          to="/project-readiness-tools"
          description={t("home.projectReadinessTools.pageDescription")}
        />
        <StaticLinkItem
          label={t("site.navMenu.projectReadiness.stepCodes.label")}
          to="/project-readiness-tools/look-up-step-codes-requirements-for-your-project"
          description={t("site.navMenu.projectReadiness.stepCodes.description")}
        />
        <StaticLinkItem
          label={t("site.navMenu.projectReadiness.bcBuildingCode.label")}
          to="/pre-checks"
          description={t("site.navMenu.projectReadiness.bcBuildingCode.description")}
        />
      </MenuSection>
    </VStack>
  )

  // Column 2 - About
  const aboutColumn = (
    <VStack align="flex-start" spacing={4} w="full">
      <MenuSection title={t("site.navMenu.sections.about")}>
        <StaticLinkItem
          label={t("site.navMenu.about.participatingCommunities.label")}
          to="/jurisdictions"
          description={t("site.navMenu.about.participatingCommunities.description")}
        />
        <StaticLinkItem
          label={t("site.navMenu.about.forLocalGovernments.label")}
          to="/onboarding-checklist-page-for-lg-adopting"
          description={t("site.navMenu.about.forLocalGovernments.description")}
        />
        <StaticLinkItem
          label={t("site.navMenu.about.standardPermitApplicationMaterials.label")}
          to="/standardization-preview"
          description={t("site.navMenu.about.standardPermitApplicationMaterials.description")}
        />
      </MenuSection>
    </VStack>
  )

  // Right column - Role-dependent content
  const renderRightColumnContent = () => {
    if (!loggedIn || currentUser?.isUnconfirmed) {
      // [HUB-4416] There's your problem right there. If the user is unconfirmed, they are getting the logged out menu content.
      // This prevents the user from being able to log out when unconfirmed, which is a problem.
      // Likely fix: just remove the isUnconfirmed check, and they can see to their role's full menu content.
      // remember you can unconfirm a user by querying the user in the rails console and setting the confirmed_at to nil:
      //
      // bundle exec rails c
      // User.find_by_omniauth_username("review_manager").update(confirmed_at: nil)
      //
      // Presenting the role specific menu content when unconfirmed is not a problem,
      // because logic in app/frontend/components/domains/navigation/index.tsx should prevent unconfirmed users from accessing the rest of the app.
      // Maybe double check that the user cant access other pages linked in this right column role content when unconfirmed
      // (once you remove the isUnconfirmed check). - Remove this whole comment in your final PR.
      return <LoggedOutMenuContent />
    }

    switch (currentUser.role) {
      case EUserRoles.superAdmin:
        return <SuperAdminMenuContent />

      case EUserRoles.reviewManager:
      case EUserRoles.regionalReviewManager:
        return <ReviewManagerMenuContent />

      case EUserRoles.reviewer:
        return <ReviewerMenuContent />

      case EUserRoles.submitter:
        return <SubmitterMenuContent />

      case EUserRoles.technicalSupport:
        return <TechnicalSupportMenuContent />

      default:
        return <LoggedOutMenuContent />
    }
  }

  return (
    <>
      <Show below="md">
        <IconButton
          borderRadius="lg"
          border={currentUser?.isSubmitter || !loggedIn ? "solid black" : "solid white"}
          borderWidth="1px"
          p={3}
          variant={currentUser?.isSubmitter || !loggedIn ? "secondary" : "primary"}
          aria-label="menu dropdown button"
          icon={<List size={16} weight="bold" />}
          onClick={handleToggle}
        />
      </Show>

      <Show above="md">
        <Button
          borderRadius="lg"
          border={currentUser?.isSubmitter || !loggedIn ? "solid black" : "solid white"}
          borderWidth="1px"
          p={3}
          variant={currentUser?.isSubmitter || !loggedIn ? "secondary" : "primary"}
          aria-label="menu dropdown button"
          leftIcon={isOpen ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
          onClick={handleToggle}
        >
          {t("site.menu")}
        </Button>
      </Show>

      <Drawer isOpen={isOpen} placement="top" onClose={onClose} size="full">
        <DrawerOverlay mt={menuOffset} zIndex={1400} />
        <DrawerContent
          mt={menuOffset}
          maxH={`calc(100vh - ${menuOffset})`}
          zIndex={1400}
          display="flex"
          flexDirection="column"
          h="auto"
        >
          <DrawerBody flex="1" minH={0} overflow="auto">
            <MenuCloseProvider value={onClose}>
              <Container maxW="container.lg" px={8}>
                <Grid templateColumns={{ base: "1fr", md: "3fr 3fr 2fr" }} gap={8} py={5}>
                  <Box order={{ base: 2, md: 1 }}>{projectReadinessColumn}</Box>
                  <Box order={{ base: 3, md: 2 }}>{aboutColumn}</Box>
                  <Box order={{ base: 1, md: 3 }}>{renderRightColumnContent()}</Box>
                </Grid>
              </Container>
            </MenuCloseProvider>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
})

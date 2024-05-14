import { extendTheme } from "@chakra-ui/react"
import { Button } from "./components/button"
import { FormLabel } from "./components/form-label"
import { Heading } from "./components/heading"
import { Input } from "./components/input"
import { Link } from "./components/link"
import { Select } from "./components/select"
import { Table } from "./components/table"
import { Text } from "./components/text"
import { radii } from "./foundations/border-radii"
import { colors } from "./foundations/colors"
import { fontSizes } from "./foundations/font-sizes"
import { fonts } from "./foundations/fonts"
import { shadows } from "./foundations/shadows"
import { sizes } from "./foundations/sizes"
import { space } from "./foundations/space"

const styles = {
  global: {
    html: {
      scrollBehaviour: "smooth",
    },
    body: {
      color: "text.primary",
    },
    h1: {
      fontSize: "var(--chakra-fontSizes-4xl)",
      color: "inherit",
    },
    h2: {
      fontSize: "var(--chakra-fontSizes-2xl)",
      color: "inherit",
    },
    h3: {
      fontSize: "var(--chakra-fontSizes-xl)",
      color: "inherit",
    },
    h4: {
      fontSize: "var(--chakra-fontSizes-lg)",
      color: "inherit",
    },
    ["ul, ol"]: {
      paddingLeft: "10",
    },
    ["ul li, ol li"]: {
      marginBottom: "var(--chakra-sizes-2)",
    },
    [".chakra-toast h3"]: {
      margin: "0",
    },
    [".chakra-breadcrumb__list"]: {
      padding: "0",
      minHeight: "46px",
    },
    [".chakra-breadcrumb__list, .chakra-breadcrumb__list-item"]: {
      margin: "0",
    },
    [".chakra-menu__menu-list .chakra-menu__group__title"]: {
      maxWidth: "250px",
      marginLeft: "var(--chakra-space-3)",
    },
    [".chakra-menu__menu-list .chakra-menu__menuitem "]: {
      borderRadius: "0",
    },
    [".requirement-block-description"]: {
      marginBottom: "var(--chakra-sizes-6)",
    },

    // Nav menu: when user clicks the Menu and the dropdown menu is opened, dim the page behind
    [".show-menu-overlay-background"]: {
      position: "relative",
      zIndex: "1000",
    },
    [".show-menu-overlay-background::after"]: {
      content: `""`,
      display: "block",
      background: "rgba(0, 0, 0, 0.25)",
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
      zIndex: "0",
    },
  },
}
const components = { Button, FormLabel, Heading, Input, Link, Select, Text, Table }
const overrides = { styles, colors, fonts, fontSizes, sizes, radii, space, shadows, components }

export const theme = extendTheme(overrides)

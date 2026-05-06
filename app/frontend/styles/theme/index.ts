import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import { Button } from "./components/button"
import { FormLabel } from "./components/form-label"
import { Heading } from "./components/heading"
import { Input } from "./components/input"
import { Link } from "./components/link"
import { Radio } from "./components/radio"
import { Select } from "./components/select"
import { Table } from "./components/table"
import { Tabs } from "./components/tabs"
import { Tag } from "./components/tag"
import { Text } from "./components/text"
import { radii } from "./foundations/border-radii"
import { colors } from "./foundations/colors"
import { fontSizes } from "./foundations/font-sizes"
import { fonts } from "./foundations/fonts"
import { shadows } from "./foundations/shadows"
import { sizes } from "./foundations/sizes"
import { space } from "./foundations/space"

const globalCss = {
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
  "ul, ol": {
    paddingLeft: "10",
  },
  "ul li, ol li": {
    marginBottom: "var(--chakra-sizes-2)",
  },
  ".chakra-toast h3": {
    margin: "0",
  },
  ".chakra-breadcrumb__list": {
    padding: "0",
    minHeight: "46px",
  },
  ".chakra-breadcrumb__list, .chakra-breadcrumb__list-item": {
    margin: "0",
  },
  ".chakra-menu__menu-list .chakra-menu__group__title": {
    maxWidth: "250px",
    marginLeft: "var(--chakra-space-3)",
  },
  ".chakra-menu__menu-list .chakra-menu__menuitem ": {
    borderRadius: "0",
  },
  ".requirement-block-description": {
    marginBottom: "var(--chakra-sizes-6)",
  },

  // Nav menu: when user clicks the Menu and the dropdown menu is opened, dim the page behind
  ".show-menu-overlay-background": {
    position: "relative",
    zIndex: "1000",
  },
  ".show-menu-overlay-background::after": {
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
}

const isTokenRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const withTokenValues = (tokens: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [key, isTokenRecord(value) ? withTokenValues(value) : { value }])
  )

export const theme = {
  colors,
  fonts,
  fontSizes,
  sizes,
  radii,
  space,
  shadows,
}

const config = defineConfig({
  globalCss,
  theme: {
    tokens: {
      colors: withTokenValues(colors),
      fonts: withTokenValues(fonts),
      fontSizes: withTokenValues(fontSizes),
      sizes: withTokenValues(sizes),
      radii: withTokenValues(radii),
      space: withTokenValues(space),
      shadows: withTokenValues(shadows),
    },
    recipes: {
      button: Button,
      heading: Heading,
      link: Link,
      text: Text,
    },
    slotRecipes: {
      field: FormLabel,
      input: Input,
      nativeSelect: Select,
      radioGroup: Radio,
      table: Table,
      tabs: Tabs,
      tag: Tag,
    },
  },
})

export const system = createSystem(defaultConfig, config)

import { extendTheme } from "@chakra-ui/react"
import { Button } from "./components/button"
import { FormLabel } from "./components/form-label"
import { Heading } from "./components/heading"
import { Input } from "./components/input"
import { Link } from "./components/link"
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
    body: {
      overflowX: "hidden",
      color: "text.primary", // Set your desired default body font color
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
    [".chakra-breadcrumb__list"]: {
      paddingLeft: "0",
    },
    ["ul li"]: {
      marginBottom: "var(--chakra-sizes-2)",
    },
  },
}
const components = { Button, FormLabel, Heading, Input, Link, Text, Table }
const overrides = { styles, colors, fonts, fontSizes, sizes, radii, space, shadows, components }

export const theme = extendTheme(overrides)

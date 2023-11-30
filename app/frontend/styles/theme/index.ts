import { extendTheme } from "@chakra-ui/react"
import { Button } from "./components/button"
import { FormLabel } from "./components/form-label"
import { Input } from "./components/input"
import { Link } from "./components/link"
import { radii } from "./foundations/border-radii"
import { colors } from "./foundations/colors"
import { fontSizes } from "./foundations/font-sizes"
import { fonts } from "./foundations/fonts"
import { sizes } from "./foundations/sizes"
import { space } from "./foundations/space"

const components = { Button, FormLabel, Input, Link }
const overrides = { colors, fonts, fontSizes, sizes, radii, space, components }

export const theme = extendTheme(overrides)

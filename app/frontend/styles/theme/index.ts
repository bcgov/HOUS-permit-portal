import { extendTheme } from "@chakra-ui/react"
import { Button } from "./components/button"
import { FormLabel } from "./components/form-label"
import { Input } from "./components/input"
import { radii } from "./foundations/border-radii"
import { colors } from "./foundations/colors"
import { fonts } from "./foundations/fonts"
import { space } from "./foundations/space"

const components = { Button, FormLabel, Input }
const overrides = { colors, fonts, radii, space, components }

export const theme = extendTheme(overrides)

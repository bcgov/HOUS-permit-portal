const disabledStyles = { bg: "greys.grey03", color: "greys.grey01", borderColor: "border.light" }
const activeStyles = { borderWidth: 2, borderColor: "focus" }

export const Button = {
  baseStyle: {
    borderRadius: "sm",
    letterSpacing: "1px",
    lineHeight: "27px",
    fontWeight: 400,
    width: "fit-content",
    px: 3,
    py: 1.5,
    _disabled: { ...disabledStyles },
    _active: { ...activeStyles },
  },
  sizes: {
    sm: {
      py: 0,
      fontSize: "md",
    },
  },
  variants: {
    primary: {
      color: "greys.white",
      borderWidth: 1,
      bg: "theme.blue",
      _hover: { bg: "theme.blueAlt", _disabled: { ...disabledStyles }, _active: { ...activeStyles } },
    },
    primaryInverse: {
      color: "theme.blue",
      borderWidth: 1,
      borderColor: "theme.blue",
      bg: "greys.white",
      _hover: { bg: "darken.100", _disabled: { ...disabledStyles }, _active: { ...activeStyles } },
    },
    secondary: {
      bg: "transparent",
      color: "text.primary",
      borderWidth: 1,
      borderColor: "border.dark",
      _hover: { bg: "lighten.100", _disabled: { ...disabledStyles }, _active: { ...activeStyles } },
    },
    secondaryInverse: {
      bg: "transparent",
      color: "greys.white",
      borderWidth: 1,
      borderColor: "greys.white",
      _hover: { bg: "lighten.100", _disabled: { ...disabledStyles }, _active: { ...activeStyles } },
    },
    tertiary: {
      color: "text.primary",
      _hover: {
        textDecoration: "underline",
        _disabled: { textDecoration: "none" },
      },
      _disabled: { ...disabledStyles, bg: "inherit" },
    },
    tertiaryInverse: {
      color: "greys.white",
      _hover: {
        bg: "lighten.100",
        _disabled: { ...disabledStyles, bg: "inherit" },
      },
      _disabled: { ...disabledStyles, bg: "transparent" },
    },
    greyButton: {
      bg: "greys.grey03",
      color: "text.primary",
      borderWidth: 1,
      borderColor: "border.light",
      _hover: {
        bg: "lighten.100",
        _disabled: { ...disabledStyles },
        _hover: { bg: "greys.grey02", borderColor: "border.base" },
      },
    },
    ghost: {
      _hover: { bg: "lighten.100", _disabled: { ...disabledStyles }, _active: { ...activeStyles } },
    },
    link: {
      color: "text.link",
      fontWeight: "normal",
      textDecoration: "underline",
      _hover: {},
      _disabled: { ...disabledStyles, bg: "inherit" },
    },
  },
}

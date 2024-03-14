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
      textDecor: "none",
      _hover: {
        textDecor: "none",
        bg: "theme.blueAlt",
        _disabled: { ...disabledStyles },
        _active: { ...activeStyles },
      },
    },
    primaryInverse: {
      color: "theme.blue",
      borderWidth: 1,
      borderColor: "theme.blue",
      bg: "greys.white",
      textDecor: "none",
      _hover: {
        textDecor: "none",
        bg: "lighten.900",
        _disabled: { ...disabledStyles },
        _active: { ...activeStyles },
      },
    },
    secondary: {
      bg: "transparent",
      color: "text.primary",
      borderWidth: 1,
      borderColor: "border.dark",
      textDecor: "none",
      _hover: { textDecor: "none", bg: "darken.60", _disabled: { ...disabledStyles }, _active: { ...activeStyles } },
    },
    secondaryInverse: {
      bg: "transparent",
      color: "greys.white",
      borderWidth: 1,
      borderColor: "greys.white",
      textDecor: "none",
      _hover: { textDecor: "none", bg: "lighten.100", _disabled: { ...disabledStyles }, _active: { ...activeStyles } },
    },
    tertiary: {
      color: "text.primary",
      textDecor: "none",
      _hover: {
        textDecoration: "underline",
        _disabled: { textDecoration: "none" },
      },
      _disabled: { ...disabledStyles, bg: "inherit" },
    },
    tertiaryInverse: {
      color: "greys.white",
      textDecor: "none",
      _hover: {
        textDecor: "underline",
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
      textDecor: "none",
      _hover: {
        textDecor: "none",
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

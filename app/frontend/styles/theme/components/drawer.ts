export const Drawer = {
  baseStyle: {
    dialogContainer: {
      position: "fixed",
      inset: 0,
      width: "auto",
      height: "auto",
      overflow: "hidden",
    },
    // DrawerCloseButton is position:absolute; content padding does not move it.
    closeButton: {
      top: "calc(var(--app-navbar-offset) + var(--chakra-space-2))",
      transition: "top var(--app-navbar-transition)",
    },
  },
}

/**
 * Geometry for regions that fill the viewport underneath the nav bar.
 *
 * Both read --app-navbar-offset rather than --app-navbar-height, so the region reclaims
 * the bar's space 1:1 as it slides away instead of leaving a strip of empty viewport behind.
 */

/** For a region pinned with `position: fixed`. */
export function belowNavBarFixed(additionalOffset: string = "0px") {
  return {
    top: `calc(var(--app-navbar-offset) + ${additionalOffset})`,
    h: `calc(100vh - var(--app-navbar-offset) - ${additionalOffset})`,
    transition: "top var(--app-navbar-transition), height var(--app-navbar-transition)",
  }
}

/**
 * For a region left in normal flow directly after the nav bar. The negative margin
 * reclaims the slot the sticky bar keeps in the document once it has scrolled out of view.
 */
export const belowNavBarInFlow = {
  h: "calc(100vh - var(--app-navbar-offset))",
  mt: "calc(var(--app-navbar-offset) - var(--app-navbar-height))",
  transition: "height var(--app-navbar-transition), margin-top var(--app-navbar-transition)",
}

/**
 * For `position: sticky` chrome that pins to the top of the viewport and must stay clear
 * of the nav bar as it peeks in, e.g. save bars, sidebars and application headers.
 * Pass an additional offset when the element sits below other sticky chrome.
 */
export function stickyBelowNavBar(additionalOffset: string = "0px") {
  return {
    top: `calc(var(--app-navbar-offset) + ${additionalOffset})`,
    transition: "top var(--app-navbar-transition), height var(--app-navbar-transition)",
  }
}

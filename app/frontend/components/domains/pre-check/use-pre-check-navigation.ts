import * as R from "ramda"
import { useLocation, useNavigate } from "react-router-dom"
import { navSections } from "./sidebar/nav-sections"

export const usePreCheckNavigation = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Get flat list of all nav links in order
  const allNavLinks = navSections.flatMap((section) => section.navLinks)

  const getCurrentSectionKey = () => {
    const currentSection = pathname.split("/").pop()
    return allNavLinks.find((link) => link.location === currentSection)?.key
  }

  const getNextSection = () => {
    const currentKey = getCurrentSectionKey()
    const currentIndex = allNavLinks.findIndex((link) => link.key === currentKey)

    if (currentIndex === -1 || currentIndex === allNavLinks.length - 1) {
      return null // No next section
    }

    return allNavLinks[currentIndex + 1]
  }

  const getPreviousSection = () => {
    const currentKey = getCurrentSectionKey()
    const currentIndex = allNavLinks.findIndex((link) => link.key === currentKey)

    if (currentIndex <= 0) {
      return null // No previous section
    }

    return allNavLinks[currentIndex - 1]
  }

  const navigateToNext = () => {
    const nextSection = getNextSection()
    if (nextSection) {
      const baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)
      navigate(`${baseUrl}/${nextSection.location}`)
    }
  }

  const navigateToPrevious = () => {
    const previousSection = getPreviousSection()
    if (previousSection) {
      const baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)
      navigate(`${baseUrl}/${previousSection.location}`)
    }
  }

  const navigateToSection = (sectionKey: string) => {
    const section = allNavLinks.find((link) => link.key === sectionKey)
    if (section) {
      const baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)
      navigate(`${baseUrl}/${section.location}`)
    }
  }

  return {
    navigateToNext,
    navigateToPrevious,
    navigateToSection,
    getNextSection,
    getPreviousSection,
    getCurrentSectionKey,
    hasNext: getNextSection() !== null,
    hasPrevious: getPreviousSection() !== null,
  }
}

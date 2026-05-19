import * as R from "ramda"
import { useLocation, useNavigate } from "react-router-dom"
import { projectMeetingNavSections } from "./nav-sections"

export const useProjectMeetingNavigation = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const getCurrentSectionKey = () => {
    const currentSection = pathname.split("/").pop()
    return projectMeetingNavSections.find((link) => link.location === currentSection)?.key
  }

  const getNextSection = () => {
    const currentKey = getCurrentSectionKey()
    const currentIndex = projectMeetingNavSections.findIndex((link) => link.key === currentKey)
    if (currentIndex === -1 || currentIndex === projectMeetingNavSections.length - 1) return null
    return projectMeetingNavSections[currentIndex + 1]
  }

  const getPreviousSection = () => {
    const currentKey = getCurrentSectionKey()
    const currentIndex = projectMeetingNavSections.findIndex((link) => link.key === currentKey)
    if (currentIndex <= 0) return null
    return projectMeetingNavSections[currentIndex - 1]
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
    const section = projectMeetingNavSections.find((link) => link.key === sectionKey)
    if (section) {
      const baseUrl = R.pipe(R.split("/"), R.dropLast(1), R.join("/"))(pathname)
      navigate(`${baseUrl}/${section.location}`)
    }
  }

  return {
    navigateToNext,
    navigateToPrevious,
    navigateToSection,
    getCurrentSectionKey,
    hasPrevious: getPreviousSection() !== null,
  }
}

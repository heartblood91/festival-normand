export const isNavActive = (itemHref: string, pathWithoutLocale: string): boolean => {
  if (itemHref === "/") {
    return pathWithoutLocale === "/" || pathWithoutLocale === ""
  }
  return (
    pathWithoutLocale.startsWith(itemHref) ||
    (itemHref === "/evenements" && pathWithoutLocale.startsWith("/evenement")) ||
    (itemHref === "/actualites" && pathWithoutLocale.startsWith("/actualite"))
  )
}

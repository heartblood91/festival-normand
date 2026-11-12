/**
 * Mapbox GL ships its control labels in English only; screen readers would
 * announce "Zoom in" or "Toggle attribution" in the middle of a French page.
 */
const FR: Record<string, string> = {
  "AttributionControl.ToggleAttribution": "Afficher ou masquer les crédits",
  "AttributionControl.MapFeedback": "Signaler une erreur sur la carte",
  "FullscreenControl.Enter": "Passer en plein écran",
  "FullscreenControl.Exit": "Quitter le plein écran",
  "GeolocateControl.FindMyLocation": "Me localiser",
  "GeolocateControl.LocationNotAvailable": "Position indisponible",
  "LogoControl.Title": "Site de Mapbox",
  "Map.Title": "Carte",
  "Marker.Title": "Repère sur la carte",
  "NavigationControl.ResetBearing": "Réorienter la carte vers le nord",
  "NavigationControl.ZoomIn": "Zoomer",
  "NavigationControl.ZoomOut": "Dézoomer",
  "Popup.Close": "Fermer",
  "ScaleControl.Feet": "pieds",
  "ScaleControl.Meters": "m",
  "ScaleControl.Kilometers": "km",
  "ScaleControl.Miles": "miles",
  "ScaleControl.NauticalMiles": "milles nautiques",
  "ScrollZoomBlocker.CtrlMessage": "Utilisez Ctrl + molette pour zoomer sur la carte",
  "ScrollZoomBlocker.CmdMessage": "Utilisez ⌘ + molette pour zoomer sur la carte",
  "TouchPanBlocker.Message": "Utilisez deux doigts pour déplacer la carte",
}

/** `locale` option of `new mapboxgl.Map`; English keeps the Mapbox defaults. */
export const mapboxLocale = (locale: string) => (locale === "fr" ? FR : undefined)

// Raw shape of a Tourinsoft V3 syndication offer. Field casing is configured
// server-side and the "flux allégé" option can drop fields, so every property is
// optional and parsing must stay defensive.

export type TourinsoftThesaurusItem = {
  ThesCode?: string | null
  ThesLibelle?: string | null
}

export type TourinsoftLieu = {
  Adresse1?: string | null
  Adresse1suite?: string | null
  Codepostal?: string | null
  Lieuprincipal?: string | null
  Commune?: string | null
}

export type TourinsoftHoraire = {
  Datedebut?: string | null
  Datefin?: string | null
  Heureouvert1?: string | null
  Heurefermeture1?: string | null
  Heureouvert2?: string | null
  Heurefermeture2?: string | null
}

export type TourinsoftTarif = {
  MinimumEuro?: number | null
  MaximumEuro?: number | null
  Complementtarif?: string | null
  Intituletarifs?: TourinsoftThesaurusItem | null
}

export type TourinsoftContact = {
  CoordonneesTelecom?: string | null
}

export type TourinsoftPhoto = {
  Ordre?: number | null
  Photo?: {
    MediaID?: string | null
    Titre?: string | null
    Credit?: string | null
    Url?: string | null
  } | null
}

export type TourinsoftOffer = {
  SyndicObjectID?: string | null
  NomOffre?: string | null
  Descriptif?: string | null
  DescriptifCourt?: string | null
  Insee?: string | null
  Categories?: TourinsoftThesaurusItem[] | null
  LieuPrincipals?: TourinsoftLieu[] | null
  DateHorairess?: TourinsoftHoraire[] | null
  Tarifs?: TourinsoftTarif[] | null
  ContactMails?: TourinsoftContact[] | null
  ContactTels?: TourinsoftContact[] | null
  ContactMobils?: TourinsoftContact[] | null
  ContactWebs?: TourinsoftContact[] | null
  Organismes?: TourinsoftLieu[] | null
  RaisonSocial?: string | null
  Latitude?: string | null
  Longitude?: string | null
  GmapLatitude?: string | null
  GmapLongitude?: string | null
  Photoss?: TourinsoftPhoto[] | null
  Published?: string | null
  Updated?: string | null
}

export type TourinsoftSyndication = {
  tisTrackingUA?: string
  value?: TourinsoftOffer[]
}

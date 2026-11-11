# Test VoiceOver — Pierres en Lumières (branche `feat/pel-design-rgaa`)

Durée : environ 30 minutes sur Mac, 20 minutes sur iPhone. Utiliser Safari, qui est le
navigateur dans lequel VoiceOver fonctionne le mieux.

**Preview :** utiliser le lien HTTPS envoyé dans la conversation. Il doit contenir
`#access=…`. Le lien d'ouverture expire au bout de 15 minutes ; une fois ouvert, l'accès
reste valable une journée. Si la page affiche « 502 », la passerelle de preview est
arrêtée : voir le rapport `goal-pel-design-rgaa.md`, section « Bloquants ».

## Démarrer VoiceOver

| | Mac | iPhone |
| --- | --- | --- |
| Activer | `Cmd + F5` | Réglages › Accessibilité › VoiceOver, ou triple clic sur le bouton latéral |
| Élément suivant | `Ctrl + Option + →` | Balayer vers la droite |
| Activer l'élément | `Ctrl + Option + Espace` | Toucher deux fois |
| Rotor (titres, liens, repères, champs) | `Ctrl + Option + U`, puis `←` et `→` | Tourner deux doigts sur l'écran |
| Arrêter la lecture | `Ctrl` | Toucher avec deux doigts |

## Ce qu'il faut vérifier

Cocher chaque ligne. Si une ligne échoue, noter la page, l'appareil et la phrase exacte
lue par VoiceOver.

### 1. Accueil (`/fr`)

- [ ] Le premier élément lu est le lien « Aller au contenu principal ». Activé, il amène au contenu.
- [ ] Dans le rotor, section « Titres » : un seul titre de niveau 1.
- [ ] Dans le rotor, section « Repères » : bannière, navigation principale, contenu principal, pied de page.
- [ ] Le compte à rebours est lu une seule fois, avec sa valeur finale. VoiceOver ne doit pas énumérer les chiffres qui défilent.
- [ ] Passer en anglais (sélecteur FR/EN) : la voix passe en anglais, ce qui confirme que la langue de la page est déclarée.

### 2. Programme (`/fr/evenements`)

- [ ] Les filtres « nuits » annoncent leur état, coché ou non.
- [ ] Les listes déroulantes « Département » et « Catégorie » annoncent leur état, développée ou réduite.
- [ ] Après un filtre, le nombre de résultats est annoncé sans déplacer le focus.
- [ ] Chaque carte est un lien qui commence par le titre de l'événement, pas par la photo.
- [ ] Les boutons « Grille » et « Carte » annoncent lequel est enfoncé. En vue carte, VoiceOver lit que la carte n'est pas entièrement accessible et renvoie à la vue grille.
- [ ] « Près de moi » : après autorisation de la position, le résultat est annoncé.

### 3. Fiche d'un événement

Prendre de préférence « Lumières au château de Pontécoulant » (`/fr/evenement/lumieres-au-chateau-de-pontecoulant`), qui a 4 photos.

- [ ] Le titre de niveau 1 est le nom de l'événement.
- [ ] Le lieu, les dates et les horaires sont lus comme des paires « intitulé : valeur ».
- [ ] Dans la galerie : « Photo suivante », puis l'annonce « Photo 2 sur 4 ».
- [ ] Sur la page anglaise, la galerie dit « Next photo », puis « Photo 2 of 4 ».
- [ ] Le bouton « Ajouter au carnet » annonce son état, enfoncé ou non, et change d'état quand on l'active.
- [ ] Les liens externes (inscription, histoire du lieu) précisent « nouvel onglet ».
- [ ] La rubrique « Le même jour, à proximité » (ou « Les sites les plus proches ») est un titre, et chaque site est un lien.

### 4. Carnet de voyage (`/fr/carnet`)

- [ ] Ajouter, puis retirer un lieu : l'action est annoncée.
- [ ] « Classer par » : le bouton du classement actif annonce qu'il est enfoncé.
- [ ] « Partager » : la copie du lien est annoncée.

### 5. Contact (`/fr/contact`)

- [ ] Chaque champ est lu avec son intitulé, et « obligatoire » quand il l'est.
- [ ] Envoyer le formulaire vide : Safari s'arrête sur le premier champ obligatoire et VoiceOver le lit.
- [ ] Une erreur renvoyée par le serveur (par exemple un message de moins de 10 caractères) est lue aussitôt, et le champ concerné est annoncé « non valide ».
- [ ] L'e-mail et le téléphone presse sont des liens.

### 6. Menu mobile (iPhone, ou Mac avec une fenêtre étroite)

- [ ] Le bouton « Ouvrir le menu » annonce son état, développé ou réduit.
- [ ] Menu ouvert, le balayage reste dans le menu.
- [ ] Le menu se ferme avec « Fermer le menu », ou avec `Échap` sur Mac. Le focus revient sur le bouton.

### 7. Pages d'information

- [ ] `/fr/accessibilite` : le rotor des titres liste les 6 rubriques de la déclaration (état de conformité … voies de recours).
- [ ] `/fr/page-inexistante` : le titre lu est « Page introuvable », avec l'en-tête et le pied de page du site.

### 8. Administration (facultatif)

Le compte éditeur de test est fourni à part ; ses identifiants ne figurent pas dans ce document.

- [ ] Connexion : en cas d'erreur, le message est lu.
- [ ] Tableau de bord : un compteur à zéro est lu « Aucun » et n'est pas un lien.
- [ ] Liste des événements : sur iPhone, chaque ligne dit son statut en mots (« Publié », « Brouillon »).
- [ ] Formulaire d'événement : un champ en erreur annonce l'erreur, par exemple un lien « Histoire du lieu » invalide.
- [ ] « Sites à récupérer » : chaque case est lue avec le titre du site. Le bouton dit « Importer en brouillon (1) » après une coche. **Ne pas cliquer sur Importer**, ou alors sur un seul site : il sera créé en brouillon dans la base locale.

## Retour attendu

Pour chaque problème, indiquer :

- la page ;
- l'appareil ;
- ce que VoiceOver a dit ;
- ce qui était attendu.

Une capture d'écran suffit si le texte du sous-titre VoiceOver est visible.

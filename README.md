# Classeur TCG

Gestion du stock de cartes **One Piece, Pokémon, Wankul et Riftbound**, et suivi de ce que tu ouvres (boosters, displays, starter decks) avec des statistiques.

| Dossier | Rôle | Techno |
| --- | --- | --- |
| [`api/`](api) | API REST, comptes, base de données | AdonisJS 7, Lucid, VineJS, SQLite |
| [`web/`](web) | Site web | Nuxt 4 (Vue 3), application monopage |

## Fonctionnalités

- **Comptes** : chaque utilisateur a son propre stock (connexion par e-mail et mot de passe, jeton d'accès).
- **Stock** : cartes avec jeu, nom, numéro, extension, rareté, langue, état (Mint → Poor), finition, quantité, emplacement, notes, prix d'achat et valeur. Tous les champs sont obligatoires sauf notes, prix d'achat et valeur. Synthèse par jeu, recherche, filtres, tri, boutons +/− sur la quantité.
- **Extensions et raretés par jeu** : une page pour gérer les listes de chaque jeu (ajout, renommage, ordre, suppression si inutilisée). Le formulaire de carte ne propose que ces valeurs. Les raretés usuelles de chaque jeu sont créées à l'inscription.
- **Ouvertures** : noter qu'on a ouvert N boosters, displays ou starter decks d'une extension, à une date, avec le prix payé et la valeur tirée (facultatifs).
- **Statistiques** : produits ouverts par type et par mois, par jeu, par extension, dépenses, prix moyen, valeur tirée et bilan, valeur du stock par jeu. Filtres par jeu et par période.
- **Import / export** : CSV (Excel, Google Sheets) ou JSON. À l'import, les extensions et raretés inconnues sont ajoutées aux listes du jeu.

## Lancer en local

Il faut **Node.js 24** (requis par AdonisJS 7).

```bash
# 1. API
cd api
npm install
cp .env.example .env
node ace generate:key
node ace migration:run      # crée tmp/db.sqlite3 et les 4 jeux
npm run dev                 # http://localhost:3333

# 2. Site (dans un autre terminal)
cd web
npm install
npm run dev                 # http://localhost:3000
```

Ouvre http://localhost:3000, crée un compte, ajoute tes extensions dans « Extensions et raretés », puis tes cartes.

## Tests

```bash
cd api && npm test          # tests fonctionnels de l'API (Japa)
cd api && npm run typecheck
cd web && npm run typecheck
```

## API

Toutes les routes sont sous `/api/v1` et, sauf l'authentification, demandent l'en-tête `Authorization: Bearer <jeton>`.

| Méthode | Route | Rôle |
| --- | --- | --- |
| POST | `/auth/signup`, `/auth/login` | Créer un compte, se connecter (renvoie un jeton) |
| GET | `/account/profile` · POST `/account/logout` | Profil, déconnexion |
| GET | `/games` | Les 4 jeux |
| GET, POST | `/games/:gameId/extensions` · `/games/:gameId/rarities` | Listes d'un jeu |
| PUT | `/games/:gameId/extensions/order` · `/games/:gameId/rarities/order` | Réordonner (`{ ids: [...] }`) |
| PATCH, DELETE | `/extensions/:id` · `/rarities/:id` | Renommer, supprimer (refusé si utilisée) |
| GET, POST | `/cards` | Lister, ajouter |
| PUT, DELETE | `/cards/:id` | Modifier, supprimer |
| POST | `/cards/:id/quantity` | `{ delta: 1 }` ou `{ delta: -1 }` |
| POST | `/cards/import` | Import en lot (`{ rows: [...] }`) |
| GET, POST | `/openings` | Lister, noter une ouverture |
| PUT, DELETE | `/openings/:id` | Modifier, supprimer |
| GET | `/stats?gameId=&from=&to=` | Statistiques |

## Mise en production

- **API** : `npm run build`, puis dans `build/` : `npm ci --omit=dev` et `node bin/server.js`. Définis `NODE_ENV=production`, `APP_KEY`, `HOST`, `PORT` et `CORS_ORIGIN` (l'adresse du site). SQLite convient pour un usage perso ; pour PostgreSQL, installe `pg` et active la connexion déjà prévue dans `config/database.ts`.
- **Site** : `NUXT_PUBLIC_API_BASE=https://ton-api/api/v1 npm run generate`, puis héberge le dossier `.output/public` sur n'importe quel hébergement statique.

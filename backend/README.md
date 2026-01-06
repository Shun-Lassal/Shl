# Backend — API Express & Prisma

Ce dossier contient l'API Node.js écrite avec Express, TypeScript et Prisma. Elle expose les points d'entrées définis dans `src/main.ts` (`/`, `/health`, `/users`) et s'appuie sur une base PostgreSQL.

## Prérequis
- Node.js 18+ (20 LTS recommandé)
- npm 9+
- Une base PostgreSQL accessible via `DATABASE_URL`

## Installation
```bash
cd backend
npm install
```

## Variables d'environnement
Copiez le fichier `.env` d'exemple si besoin et ajustez les valeurs :

```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
COOKIE_SECRET=votre_secret
JWT_SECRET=votre_secret_jwt
NODE_ENV=development
HOST=0.0.0.0
PORT=3000
CORS_ORIGIN=
ENABLE_SWAGGER=true
SEED_DEFAULT_USER=true
DEFAULT_USER_EMAIL=admin@admin.com
DEFAULT_USER_NAME=admin
DEFAULT_USER_PASSWORD=admin123456
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX=20
```

`CORS_ORIGIN` accepte une liste séparée par des virgules si plusieurs frontends doivent accéder à l'API. Laissez la valeur vide en développement : l'API reflétera automatiquement toute origine provenant de votre réseau local, ce qui permet de tester depuis d'autres machines. En production, renseignez explicitement les URL autorisées (obligatoire).

`HOST`/`PORT` contrôlent l'interface d'écoute d'Express. `HOST=0.0.0.0` est nécessaire pour rendre l'API joignable depuis un autre périphérique.

En production, `COOKIE_SECRET` et `JWT_SECRET` doivent être définis avec au moins 32 caractères. `ENABLE_SWAGGER` active ou désactive `/docs`. `SEED_DEFAULT_USER` permet d'initialiser un compte admin (désactivé par défaut en production).

## Commandes utiles
- `npm run dev` : lance le serveur en mode développement avec `ts-node` et rechargement via Nodemon.
- `npm run build` : compile les sources TypeScript dans `dist/`.
- `npm run prisma:generate` : (re)génère le client Prisma.
- `npm run prisma:sync` : génère le client puis applique le schéma à la base (utile pour synchroniser rapidement un environnement local).
- `npm run prisma:migrate` : crée ou applique des migrations Prisma (mode interactif).

Le serveur écoute par défaut sur `http://localhost:3000`. Un endpoint `/health` est disponible pour la supervision et `/users` renvoie la liste des utilisateurs stockés en base.

## Tests locaux avec Docker Compose
Depuis la racine du projet :
```bash
docker-compose up -d
```
Ceci démarre les services déclarés dans `docker-compose.yml`, notamment la base PostgreSQL accessible pour Prisma.

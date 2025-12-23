# Frontend — SPA Vue 3 + Vite

Ce dossier contient l'interface utilisateur construite avec Vue 3, Vite et Tailwind CSS. L'application consomme l'API exposée par le backend du projet.

## Prérequis
- Node.js 18+ (20 LTS recommandé)
- npm 9+

## Installation
```bash
cd frontend
npm install
```

## Variables d'environnement
Créez un fichier `.env` local si nécessaire :
```
# Laisser vide pour que le frontend résolve automatiquement http(s)://<host>:3000
VITE_API_URL=
```
Si la variable est vide, le frontend déduira automatiquement l'URL de l'API à partir du navigateur (`http(s)://<machine>:3000`). Définissez `VITE_API_URL` uniquement si l'API répond sur un autre domaine/port.

## Commandes utiles
- `npm run dev` : démarre le serveur de développement Vite sur `http://localhost:5173`.
- `npm run build` : génère un build de production dans `dist/`.
- `npm run preview` : sert le build de production localement pour validation.

## Style & lint
Tailwind est configuré via `tailwind.config.js` et PostCSS (`autoprefixer`). Ajoutez vos composants Vue dans `src/` et centralisez l'état partagé avec Pinia.

## Intégration avec le backend
En développement, assurez-vous que le backend tourne sur `http://<votre_machine>:3000`. Si vous laissez `VITE_API_URL` vide, l'URL est déduite automatiquement, ce qui permet aux personnes de votre réseau local d'utiliser le frontend sans modification supplémentaire. Pour un usage via Docker, toutes les variables d'environnement nécessaires sont définies dans `docker-compose.yml`.

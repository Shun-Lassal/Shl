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
VITE_API_URL=http://localhost:3000
```
`VITE_API_URL` doit pointer vers l'URL de l'API (variable injectée à l'exécution dans le code via `import.meta.env`).

## Commandes utiles
- `npm run dev` : démarre le serveur de développement Vite sur `http://localhost:5173`.
- `npm run build` : génère un build de production dans `dist/`.
- `npm run preview` : sert le build de production localement pour validation.

## Style & lint
Tailwind est configuré via `tailwind.config.js` et PostCSS (`autoprefixer`). Ajoutez vos composants Vue dans `src/` et centralisez l'état partagé avec Pinia.

## Intégration avec le backend
En développement, assurez-vous que le backend tourne sur `http://localhost:3000` (ou ajustez `VITE_API_URL`). Pour un usage via Docker, toutes les variables d'environnement nécessaires sont définies dans `docker-compose.yml`.

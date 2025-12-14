/**
 * @swagger
 * components:
 *   schemas:
 *     Lobby:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [WAITING, PLAYING, ENDED]
 *         name:
 *           type: string
 *         slots:
 *           type: integer
 *           minimum: 1
 *         ownerId:
 *           type: string
 *           format: uuid
 *         players:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         password:
 *           type: string
 *           nullable: true
 *     CreateLobbyRequest:
 *       type: object
 *       required:
 *         - name
 *         - slots
 *         - ownerId
 *       properties:
 *         name:
 *           type: string
 *         slots:
 *           type: integer
 *           minimum: 1
 *         ownerId:
 *           type: string
 *           format: uuid
 *         password:
 *           type: string
 *           nullable: true
 *         players:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *     UpdateLobbyRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [WAITING, PLAYING, ENDED]
 *         name:
 *           type: string
 *         slots:
 *           type: integer
 *           minimum: 1
 *         ownerId:
 *           type: string
 *           format: uuid
 *         password:
 *           type: string
 *           nullable: true
 *     LobbyPlayersRequest:
 *       type: object
 *       required:
 *         - players
 *       properties:
 *         players:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *     LobbyAddPlayerRequest:
 *       type: object
 *       required:
 *         - playerId
 *       properties:
 *         playerId:
 *           type: string
 *           format: uuid
 *     LobbyMessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Lobby deleted successfully
 *     LobbyErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Lobby not found
 */

/**
 * @swagger
 * /lobbies:
 *   get:
 *     summary: Liste tous les lobbys
 *     tags: [Lobby]
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Liste complète des lobbys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lobby'
 *       401:
 *         description: Utilisateur non authentifié
 *   post:
 *     summary: Crée un lobby
 *     description: Accessible uniquement aux administrateurs.
 *     tags: [Lobby]
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLobbyRequest'
 *     responses:
 *       201:
 *         description: Lobby créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lobby'
 *       400:
 *         description: Données invalides
 *
 * /lobbies/{id}:
 *   get:
 *     summary: Récupère un lobby par ID
 *     tags: [Lobby]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lobby trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lobby'
 *       404:
 *         description: Lobby introuvable
 *   patch:
 *     summary: Met à jour un lobby
 *     description: Accessible uniquement aux administrateurs.
 *     tags: [Lobby]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLobbyRequest'
 *     responses:
 *       200:
 *         description: Lobby mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lobby'
 *       400:
 *         description: Données invalides
 *   delete:
 *     summary: Supprime un lobby
 *     description: Accessible uniquement aux administrateurs.
 *     tags: [Lobby]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lobby supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LobbyMessageResponse'
 *
 * /lobbies/{id}/players:
 *   put:
 *     summary: Remplace les joueurs d'un lobby
 *     description: Accessible uniquement aux administrateurs.
 *     tags: [Lobby]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LobbyPlayersRequest'
 *     responses:
 *       200:
 *         description: Joueurs mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lobby'
 *   post:
 *     summary: Ajoute un joueur dans un lobby
 *     description: Accessible uniquement aux administrateurs.
 *     tags: [Lobby]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LobbyAddPlayerRequest'
 *     responses:
 *       200:
 *         description: Joueur ajouté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lobby'
 *
 * /lobbies/{id}/players/{playerId}:
 *   delete:
 *     summary: Retire un joueur d'un lobby
 *     description: Accessible uniquement aux administrateurs.
 *     tags: [Lobby]
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Joueur retiré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lobby'
 *       400:
 *         description: Joueur introuvable ou action impossible
 */
export {};

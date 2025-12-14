/**
 * @swagger
 * components:
 *   schemas:
 *     GameScore:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: 0a7f9a30-a3f8-4d22-8c6f-9e3fbfdb2d82
 *         userId:
 *           type: string
 *           format: uuid
 *           example: 45c806e3-061f-4d2a-af88-e76ddd58e3b5
 *         lobbyId:
 *           type: string
 *           format: uuid
 *           example: d8a76678-ec04-4b0d-9910-62f83c81832b
 *         position:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *               format: email
 *         lobby:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             status:
 *               type: string
 *               enum:
 *                 - WAITING
 *                 - PLAYING
 *                 - ENDED
 *     CreateGameScoreRequest:
 *       type: object
 *       required:
 *         - userId
 *         - lobbyId
 *         - position
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         lobbyId:
 *           type: string
 *           format: uuid
 *         position:
 *           type: integer
 *           minimum: 1
 *     UpdateGameScoreRequest:
 *       type: object
 *       required:
 *         - position
 *       properties:
 *         position:
 *           type: integer
 *           minimum: 1
 *     GameScoreDeletedResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: GameScore deleted successfully
 *     GameScoreErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: GameScore not found
 */

/**
 * @swagger
 * /game-scores:
 *   get:
 *     summary: Liste les scores disponibles
 *     description: Retourne l'ensemble des scores. Possibilité de filtrer par lobby via le paramètre `lobbyId`.
 *     tags:
 *       - GameScore
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: lobbyId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Identifiant du lobby pour filtrer les scores
 *     responses:
 *       200:
 *         description: Liste des scores récupérée
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GameScore'
 *       401:
 *         description: Utilisateur non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScoreErrorResponse'
 *   post:
 *     summary: Crée un nouveau score
 *     description: Ajoute un score pour un utilisateur dans un lobby. Réservé aux administrateurs.
 *     tags:
 *       - GameScore
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGameScoreRequest'
 *     responses:
 *       201:
 *         description: Score créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScore'
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScoreErrorResponse'
 *       401:
 *         description: Accès refusé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScoreErrorResponse'
 *
 * /game-scores/{id}:
 *   get:
 *     summary: Récupère un score par identifiant
 *     tags:
 *       - GameScore
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
 *         description: Score trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScore'
 *       404:
 *         description: Score introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScoreErrorResponse'
 *   patch:
 *     summary: Met à jour la position d'un score
 *     description: Réservé aux administrateurs.
 *     tags:
 *       - GameScore
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
 *             $ref: '#/components/schemas/UpdateGameScoreRequest'
 *     responses:
 *       200:
 *         description: Score mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScore'
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScoreErrorResponse'
 *   delete:
 *     summary: Supprime un score
 *     description: Réservé aux administrateurs.
 *     tags:
 *       - GameScore
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
 *         description: Score supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScoreDeletedResponse'
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GameScoreErrorResponse'
 */
export {};

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: admin@admin.com
 *         password:
 *           type: string
 *           minLength: 4
 *           example: mySecurePassword
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login successful
 *     LogoutResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Logged out successfully
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Invalid credentials
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentifie un utilisateur
 *     description: |
 *       Valide les identifiants, ouvre une session et renvoie un cookie `sid` httpOnly.
 *       Retourne une erreur si l'email ou le mot de passe est invalide.
 *     tags:
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: Cookie de session signé `sid`
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Email ou mot de passe invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /login/logout:
 *   post:
 *     summary: Déconnecte un utilisateur
 *     description: Supprime la session associée au cookie `sid` et efface le cookie côté client.
 *     tags:
 *       - Login
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion effectuée
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: 'Cookie `sid` supprimé (Set-Cookie: sid=; Max-Age=0; ...)'
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *       400:
 *         description: Session invalide ou déjà supprimée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Accès refusé (aucun cookie `sid` valide)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export {};

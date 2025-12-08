/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - name
 *         - password
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         name:
 *           type: string
 *           example: john-doe
 *         password:
 *           type: string
 *           minLength: 8
 *           example: myStrongPassword!
 *         role:
 *           type: string
 *           enum:
 *             - ADMIN
 *             - USER
 *           example: USER
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: User registered successfully
 *     RegisterErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: User registration failed
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Enregistre un utilisateur
 *     description: Crée un utilisateur avec le rôle fourni. Nécessite un utilisateur connecté et administrateur.
 *     tags:
 *       - Register
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       401:
 *         description: Accès refusé (utilisateur non connecté ou non administrateur)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterErrorResponse'
 *       400:
 *         description: Erreur côté client ou validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterErrorResponse'
 */
export {};

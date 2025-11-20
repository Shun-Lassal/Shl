/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         ipAddress:
 *           type: string
 *           nullable: true
 *         userAgent:
 *           type: string
 *           nullable: true
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     SessionListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Session'
 *     SessionsErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: No sessions created
 */

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Liste les sessions actives
 *     tags:
 *       - Sessions
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Liste des sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionListResponse'
 *       400:
 *         description: Impossible de récupérer les sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionsErrorResponse'
 *       401:
 *         description: Accès refusé (utilisateur non connecté)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SessionsErrorResponse'
 */
export {};

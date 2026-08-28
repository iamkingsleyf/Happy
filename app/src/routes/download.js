// =============================================================================
// src/routes/download.js
// Happy — GET /download?url=… streams a Fal image for Save on iPhone.
//
// @package Happy
// @since   1.0.0
// =============================================================================

'use strict';

import express from 'express';
import { assertDownloadUrl, safeFilename } from '../lib/download.js';
import { sendError } from '../lib/errors.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const url = assertDownloadUrl(req.query.url);
        const filename = safeFilename(req.query.name, 'happy.jpg');
        const upstream = await fetch(url);
        if (!upstream.ok) {
            console.error('[Happy/download] upstream', upstream.status, url);
            res.status(502).json({ error: "Couldn't save that picture. Try again." });
            return;
        }

        const type = upstream.headers.get('content-type') || 'image/jpeg';
        res.setHeader('Content-Type', type);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'private, max-age=300');

        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.send(buffer);
    } catch (err) {
        sendError(res, err);
    }
});

export default router;

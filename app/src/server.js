// =============================================================================
// src/server.js
// Happy — Express entry point. Static playground + Fal.ai proxy.
//
// @package Happy
// @since   1.0.0
// =============================================================================

'use strict';

import dns from 'node:dns';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import studioRouter from './routes/studio.js';
import downloadRouter from './routes/download.js';
import { configureFal, hasFalKey } from './lib/fal.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

dns.setDefaultResultOrder('ipv4first');

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', studioRouter);
app.use('/download', downloadRouter);

app.get('/healthz', (_req, res) => {
    res.status(200).send('ok');
});

app.use((err, _req, res, next) => {
    if (err && err.name === 'MulterError') {
        res.status(400).json({ error: 'That pic is too big. Try a smaller one.' });
        return;
    }
    next(err);
});

app.listen(PORT, () => {
    configureFal();
    console.log(`[Happy] Server running on port ${PORT}`);
    console.log(`[Happy] Fal key ${hasFalKey() ? 'loaded' : 'missing — set FAL_KEY'}`);
});

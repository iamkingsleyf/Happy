// =============================================================================
// src/routes/studio.js
// Happy — Create, Edit, and Split endpoints. Fal key never leaves the server.
//
// @package Happy
// @since   1.0.0
// =============================================================================

'use strict';

import express from 'express';
import multer from 'multer';
import { hasFalKey, configureFal, runModel, MODELS } from '../lib/fal.js';
import { buildGenerateInput, buildEditInput, buildLayerizeInput, parseUrlList } from '../lib/payloads.js';
import { uploadFilesToFal } from '../lib/upload.js';
import { HttpError, sendError, falErrorToMessage } from '../lib/errors.js';
import { createJob, getJob, completeJob, failJob, toClient, JOB_GONE } from '../lib/jobs.js';

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 30 * 1024 * 1024,
        files: 10,
    },
});

function requireStudio() {
    if (!hasFalKey()) {
        throw new HttpError(503, "Happy isn't ready yet. Try again later.");
    }
    configureFal();
}

function enqueueJob(res, work) {
    const job = createJob();
    res.json({ jobId: job.id, status: 'working' });
    setImmediate(() => {
        Promise.resolve()
            .then(work)
            .then((data) => completeJob(job.id, data))
            .catch((err) => {
                const message = err instanceof HttpError ? err.message : falErrorToMessage(err);
                failJob(job.id, message);
            });
    });
}

router.get('/ready', (_req, res) => {
    res.json({ ok: true, ready: hasFalKey() });
});

router.get('/jobs/:id', (req, res) => {
    const job = getJob(req.params.id);
    if (!job) {
        res.status(404).json({ error: JOB_GONE });
        return;
    }
    res.set('Cache-Control', 'no-store');
    res.json(toClient(job));
});

router.post('/generate', async (req, res) => {
    try {
        const input = buildGenerateInput(req.body);
        requireStudio();
        enqueueJob(res, () => runModel(MODELS.generate, input));
    } catch (err) {
        sendError(res, err);
    }
});

router.post('/edit', upload.array('images', 10), async (req, res) => {
    try {
        requireStudio();
        const existing = parseUrlList(req.body.image_urls);
        const uploaded = await uploadFilesToFal(req.files);
        const input = buildEditInput(req.body, existing.concat(uploaded));
        enqueueJob(res, () => runModel(MODELS.edit, input));
    } catch (err) {
        sendError(res, err);
    }
});

router.post('/layerize', upload.single('image'), async (req, res) => {
    try {
        requireStudio();
        let imageUrl = typeof req.body.image_url === 'string' ? req.body.image_url.trim() : '';
        if (req.file) {
            const uploaded = await uploadFilesToFal([req.file]);
            imageUrl = uploaded[0] || imageUrl;
        }
        const input = buildLayerizeInput(req.body, imageUrl);
        enqueueJob(res, () => runModel(MODELS.layerize, input));
    } catch (err) {
        sendError(res, err);
    }
});

export default router;

// =============================================================================
// src/lib/upload.js
// Happy — convert iPhone HEIC uploads and send files to Fal storage.
//
// @package Happy
// @since   1.0.0
// =============================================================================

'use strict';

import convert from 'heic-convert';
import { uploadToFal } from './fal.js';
import { HttpError } from './errors.js';

const HEIC_TYPES = new Set(['image/heic', 'image/heif', 'image/heic-sequence']);

function isHeic(file) {
    const type = (file.mimetype || '').toLowerCase();
    const name = (file.originalname || '').toLowerCase();
    return HEIC_TYPES.has(type) || name.endsWith('.heic') || name.endsWith('.heif');
}

async function toJpegIfNeeded(file) {
    if (!isHeic(file)) {
        return {
            buffer: file.buffer,
            filename: file.originalname || 'image.jpg',
            mimeType: file.mimetype || 'image/jpeg',
        };
    }

    try {
        const jpeg = await convert({
            buffer: file.buffer,
            format: 'JPEG',
            quality: 0.9,
        });
        const filename = (file.originalname || 'photo.heic').replace(/\.hei[cf]$/i, '.jpg');
        return {
            buffer: Buffer.from(jpeg),
            filename,
            mimeType: 'image/jpeg',
        };
    } catch (err) {
        console.error('[Happy/upload] HEIC convert failed:', err.message);
        throw new HttpError(400, "Couldn't read that iPhone pic. Try choosing it again.");
    }
}

export async function uploadFilesToFal(files) {
    const list = Array.isArray(files) ? files : files ? [files] : [];
    if (list.length === 0) {
        return [];
    }

    const urls = [];
    for (const file of list) {
        if (!file?.buffer) {
            continue;
        }
        const prepared = await toJpegIfNeeded(file);
        const uploaded = await uploadToFal(prepared.buffer, prepared.filename, prepared.mimeType);
        const url = typeof uploaded === 'string' ? uploaded : uploaded?.url;
        if (!url) {
            throw new HttpError(502, "Couldn't make that picture. Try again.");
        }
        urls.push(url);
    }
    return urls;
}

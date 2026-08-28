// =============================================================================
// src/lib/download.js
// Happy — stream a Fal result so the phone can save it.
// Only fal.media / fal.ai hosts are allowed.
//
// @package Happy
// @since   1.0.0
// =============================================================================

'use strict';

import { HttpError } from './errors.js';

const ALLOWED_HOSTS = ['fal.media', 'fal.ai'];

export function assertDownloadUrl(rawUrl) {
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new HttpError(400, "Couldn't save that picture. Try again.");
    }

    if (parsed.protocol !== 'https:') {
        throw new HttpError(400, "Couldn't save that picture. Try again.");
    }

    const host = parsed.hostname.toLowerCase();
    const allowed = ALLOWED_HOSTS.some((suffix) => host === suffix || host.endsWith('.' + suffix));
    if (!allowed) {
        throw new HttpError(400, "Couldn't save that picture. Try again.");
    }

    return parsed.toString();
}

export function safeFilename(name, fallback = 'happy.jpg') {
    const cleaned = String(name || '')
        .replace(/[^\w.\-]+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
    return cleaned || fallback;
}

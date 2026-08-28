// =============================================================================
// src/lib/errors.js
// Happy — HTTP error helper and Fal.ai error mapping.
//
// @package Happy
// @since   1.0.0
// =============================================================================

'use strict';

export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

export function falErrorToMessage(err) {
    const raw = [
        err?.body?.detail,
        err?.body?.message,
        err?.message,
        typeof err === 'string' ? err : '',
    ]
        .flat()
        .filter(Boolean)
        .map((part) => (typeof part === 'string' ? part : JSON.stringify(part)))
        .join(' ');

    console.error('[Happy/fal]', raw || err);

    if (/safety|nsfw|content policy|moderation/i.test(raw)) {
        return "That prompt or pic isn't allowed. Try different words or another pic.";
    }
    if (/401|403|unauthorized|forbidden|invalid.*key/i.test(raw)) {
        return "Happy isn't ready yet. Try again later.";
    }
    if (/timeout|timed out|ETIMEDOUT/i.test(raw)) {
        return 'That took too long. Try again.';
    }
    if (/too many|rate limit|429/i.test(raw)) {
        return 'The studio is busy. Wait a few seconds and try again.';
    }

    return "Couldn't make that picture. Try again.";
}

export function sendError(res, err) {
    if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message });
        return;
    }

    console.error('[Happy]', err);
    res.status(502).json({ error: falErrorToMessage(err) });
}

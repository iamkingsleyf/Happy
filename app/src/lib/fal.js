// =============================================================================
// src/lib/fal.js
// Happy — Fal.ai client wrapper. Key stays on the server.
//
// @package Happy
// @since   1.0.0
// =============================================================================

'use strict';

import { fal } from '@fal-ai/client';

export const MODELS = {
    generate: 'bytedance/seedream/v5/pro/text-to-image',
    edit: 'bytedance/seedream/v5/pro/edit',
    layerize: 'bytedance/seedream/v5/pro/layerize',
};

export function hasFalKey() {
    return Boolean(process.env.FAL_KEY && process.env.FAL_KEY.trim());
}

export function configureFal() {
    if (!hasFalKey()) {
        return false;
    }
    fal.config({ credentials: process.env.FAL_KEY.trim() });
    return true;
}

export async function runModel(modelId, input) {
    const result = await fal.subscribe(modelId, {
        input,
        logs: false,
    });
    return result.data;
}

export async function uploadToFal(buffer, filename, mimeType) {
    const file = new File([buffer], filename, { type: mimeType });
    return fal.storage.upload(file);
}

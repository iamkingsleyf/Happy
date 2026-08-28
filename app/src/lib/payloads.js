// =============================================================================
// src/lib/payloads.js
// Happy — validate playground input and build Fal.ai request bodies.
//
// @package Happy
// @since   1.0.0
// =============================================================================

'use strict';

import { HttpError } from './errors.js';

export const GENERATE_SIZES = [
    'auto_2K',
    'auto_1K',
    'square_hd',
    'square',
    'portrait_16_9',
    'portrait_4_3',
    'landscape_16_9',
    'landscape_4_3',
];

export const LAYERIZE_SIZES = ['auto', 'auto_1K', 'auto_1.5K', 'auto_2K'];

export const OUTPUT_FORMATS = ['jpeg', 'png'];

export const ENHANCE_MODES = ['standard', 'fast'];

export const MAX_EDIT_IMAGES = 10;

function asTrimmedString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function pickEnum(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
}

function clampNumImages(value) {
    const n = Number.parseInt(value, 10);
    if (Number.isNaN(n)) {
        return 1;
    }
    return Math.min(6, Math.max(1, n));
}

export function buildGenerateInput(body) {
    const prompt = asTrimmedString(body?.prompt);
    if (!prompt) {
        throw new HttpError(400, 'Tell me what picture you want.');
    }

    return {
        prompt,
        image_size: pickEnum(body?.image_size, GENERATE_SIZES, 'auto_2K'),
        num_images: clampNumImages(body?.num_images),
        output_format: pickEnum(body?.output_format, OUTPUT_FORMATS, 'jpeg'),
        enable_safety_checker: true,
    };
}

export function withPhotoNumbers(prompt, count) {
    if (count < 2) {
        return prompt;
    }

    const list = Array.from({ length: count }, (_, i) => `Figure ${i + 1} (Pic ${i + 1})`).join(', ');
    return (
        'The attached pics are numbered in order from first to last: ' +
        list +
        '. When the user says Pic 1 they mean Figure 1, Pic 2 means Figure 2, and so on.\n\n' +
        prompt
    );
}

export function buildEditInput(body, imageUrls) {
    const prompt = asTrimmedString(body?.prompt);
    if (!prompt) {
        throw new HttpError(400, 'Tell me what to change in the pic.');
    }

    const urls = (imageUrls || []).filter((url) => typeof url === 'string' && url.trim());
    if (urls.length === 0) {
        throw new HttpError(400, 'Add a pic first.');
    }
    if (urls.length > MAX_EDIT_IMAGES) {
        throw new HttpError(400, 'You can add up to 10 pics.');
    }

    return {
        prompt: withPhotoNumbers(prompt, urls.length),
        image_urls: urls.slice(-MAX_EDIT_IMAGES),
        image_size: pickEnum(body?.image_size, GENERATE_SIZES, 'auto_2K'),
        num_images: clampNumImages(body?.num_images),
        output_format: pickEnum(body?.output_format, OUTPUT_FORMATS, 'jpeg'),
        enable_safety_checker: true,
    };
}

export function buildLayerizeInput(body, imageUrl) {
    const url = asTrimmedString(imageUrl);
    if (!url) {
        throw new HttpError(400, 'Add a pic first.');
    }

    const input = {
        image_url: url,
        image_size: pickEnum(body?.image_size, LAYERIZE_SIZES, 'auto'),
        enhance_prompt_mode: pickEnum(body?.enhance_prompt_mode, ENHANCE_MODES, 'standard'),
        enable_safety_checker: true,
    };

    const prompt = asTrimmedString(body?.prompt);
    if (prompt) {
        input.prompt = prompt;
    }

    return input;
}

export function parseUrlList(value) {
    if (Array.isArray(value)) {
        return value.map((item) => asTrimmedString(item)).filter(Boolean);
    }
    if (typeof value === 'string' && value.trim()) {
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.map((item) => asTrimmedString(item)).filter(Boolean);
            }
        } catch {
            return value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);
        }
        return [value.trim()];
    }
    return [];
}

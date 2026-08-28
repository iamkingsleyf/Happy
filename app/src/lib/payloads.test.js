// =============================================================================
// src/lib/payloads.test.js
// Happy — unit tests for Fal request body builders.
//
// @package Happy
// @since   1.0.0
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGenerateInput, buildEditInput, buildLayerizeInput } from './payloads.js';
import { HttpError } from './errors.js';

test('buildGenerateInput requires a prompt', () => {
    assert.throws(() => buildGenerateInput({}), (err) => err instanceof HttpError && err.status === 400);
});

test('buildGenerateInput applies defaults and clamps image count', () => {
    const input = buildGenerateInput({ prompt: '  a red bicycle  ', num_images: 99, image_size: 'nope' });
    assert.equal(input.prompt, 'a red bicycle');
    assert.equal(input.num_images, 6);
    assert.equal(input.image_size, 'auto_2K');
    assert.equal(input.output_format, 'jpeg');
    assert.equal(input.enable_safety_checker, true);
});

test('buildEditInput requires photos and a prompt', () => {
    assert.throws(() => buildEditInput({ prompt: 'make it blue' }, []), (err) => err instanceof HttpError);
    assert.throws(() => buildEditInput({}, ['https://example.com/a.jpg']), (err) => err instanceof HttpError);
});

test('buildEditInput keeps the last 10 urls', () => {
    const urls = Array.from({ length: 12 }, (_, i) => `https://example.com/${i}.jpg`);
    assert.throws(() => buildEditInput({ prompt: 'edit' }, urls), (err) => err instanceof HttpError && /10 pics/.test(err.message));
});

test('buildEditInput numbers pics for the model', () => {
    const input = buildEditInput(
        { prompt: 'put Pic 2 onto Pic 1' },
        ['https://example.com/a.jpg', 'https://example.com/b.jpg']
    );
    assert.match(input.prompt, /Figure 1 \(Pic 1\)/);
    assert.match(input.prompt, /put Pic 2 onto Pic 1/);
});

test('buildLayerizeInput allows an empty prompt', () => {
    const input = buildLayerizeInput({}, 'https://example.com/photo.jpg');
    assert.equal(input.image_url, 'https://example.com/photo.jpg');
    assert.equal(input.image_size, 'auto');
    assert.equal(input.prompt, undefined);
});

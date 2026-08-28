// =============================================================================
// src/lib/errors.test.js
// Happy — unit tests for Fal error mapping.
//
// @package Happy
// @since   1.0.0
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { falErrorToMessage, HttpError } from './errors.js';

test('maps safety-checker failures to a friendly message', () => {
    const message = falErrorToMessage({ message: 'NSFW content detected by safety checker' });
    assert.match(message, /isn't allowed/i);
});

test('maps unauthorized Fal keys to a simple later-try message', () => {
    const message = falErrorToMessage({ message: '401 Unauthorized' });
    assert.match(message, /isn't ready yet/i);
});

test('HttpError keeps status and message', () => {
    const err = new HttpError(400, 'Tell me what picture you want.');
    assert.equal(err.status, 400);
    assert.equal(err.message, 'Tell me what picture you want.');
});

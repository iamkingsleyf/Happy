// =============================================================================
// src/lib/download.test.js
// Happy — unit tests for download URL allowlist.
//
// @package Happy
// @since   1.0.0
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertDownloadUrl } from './download.js';
import { HttpError } from './errors.js';

test('allows fal.media result URLs', () => {
    const url = assertDownloadUrl('https://v3b.fal.media/files/b/abc/photo.png');
    assert.match(url, /fal\.media/);
});

test('rejects non-Fal URLs', () => {
    assert.throws(
        () => assertDownloadUrl('https://example.com/photo.png'),
        (err) => err instanceof HttpError && err.status === 400
    );
});

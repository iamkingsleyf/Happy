// =============================================================================
// src/lib/jobs.test.js
// Happy — unit tests for in-memory studio jobs.
//
// @package Happy
// @since   1.0.4
// =============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    JOB_TTL_MS,
    clearJobs,
    completeJob,
    createJob,
    failJob,
    getJob,
    toClient,
} from './jobs.js';

test('createJob starts as working and can finish with images', () => {
    clearJobs();
    const job = createJob();
    assert.equal(job.status, 'working');
    assert.ok(getJob(job.id));
    completeJob(job.id, { images: [{ url: 'https://fal.media/a.jpg' }] });
    const payload = toClient(getJob(job.id));
    assert.equal(payload.status, 'done');
    assert.equal(payload.images[0].url, 'https://fal.media/a.jpg');
});

test('failJob stores a friendly error', () => {
    clearJobs();
    const job = createJob();
    failJob(job.id, 'The studio is busy. Wait a few seconds and try again.');
    const payload = toClient(getJob(job.id));
    assert.equal(payload.status, 'error');
    assert.match(payload.error, /busy/i);
});

test('expired jobs are removed', () => {
    clearJobs();
    const job = createJob();
    job.createdAt = Date.now() - JOB_TTL_MS - 1;
    assert.equal(getJob(job.id), null);
});

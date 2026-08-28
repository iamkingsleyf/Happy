// =============================================================================
// src/lib/jobs.js
// Happy — in-memory studio jobs so a dropped iPhone connection does not lose the pic.
//
// @package Happy
// @since   1.0.4
// =============================================================================

'use strict';

export const JOB_TTL_MS = 30 * 60 * 1000;
export const JOB_GONE = "That picture isn't here anymore. Try again.";

const jobs = new Map();

function prune(now = Date.now()) {
    for (const [id, job] of jobs) {
        if (now - job.createdAt > JOB_TTL_MS) {
            jobs.delete(id);
        }
    }
}

export function createJob() {
    prune();
    const job = {
        id: crypto.randomUUID(),
        status: 'working',
        data: null,
        error: null,
        createdAt: Date.now(),
    };
    jobs.set(job.id, job);
    return job;
}

export function getJob(id) {
    prune();
    return jobs.get(id) || null;
}

export function completeJob(id, data) {
    const job = jobs.get(id);
    if (!job || job.status !== 'working') {
        return;
    }
    job.status = 'done';
    job.data = data;
}

export function failJob(id, message) {
    const job = jobs.get(id);
    if (!job || job.status !== 'working') {
        return;
    }
    job.status = 'error';
    job.error = message || "Couldn't make that picture. Try again.";
}

export function toClient(job) {
    if (job.status === 'done') {
        return Object.assign({ jobId: job.id, status: 'done' }, job.data || {});
    }
    if (job.status === 'error') {
        return { jobId: job.id, status: 'error', error: job.error };
    }
    return { jobId: job.id, status: 'working' };
}

export function clearJobs() {
    jobs.clear();
}

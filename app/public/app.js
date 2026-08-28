/**
 * app.js
 * Happy — production playground. Talks to /api on this same host.
 *
 * @package Happy
 * @since   1.0.0
 */

'use strict';

const state = {
    mode: 'generate',
    photos: [],
    size: 'auto_2K',
    count: 1,
    running: false,
    results: [],
};

const els = {
    prompt: document.getElementById('prompt'),
    error: document.getElementById('error'),
    empty: document.getElementById('empty-state'),
    result: document.getElementById('result-state'),
    busy: document.getElementById('busy-state'),
    addPhoto: document.getElementById('btn-add-photo'),
    fileInput: document.getElementById('file-input'),
    refs: document.getElementById('refs'),
    photoGuide: document.getElementById('photo-guide'),
    emptyTitle: document.getElementById('empty-title'),
    emptyCopy: document.getElementById('empty-copy'),
    emptyAdd: document.getElementById('btn-empty-add'),
    options: document.getElementById('options'),
    elapsed: document.getElementById('busy-elapsed'),
    countBlock: document.getElementById('count-block'),
    btnRun: document.getElementById('btn-run'),
    btnPhoto: document.getElementById('btn-add-photo'),
    btnOptions: document.getElementById('btn-options'),
};

const copy = {
    generate: {
        title: 'Make a new picture',
        hint: 'Type what you want in the box below. Then tap Make and wait about a minute.',
        placeholder: 'Example: a birthday cake with pink flowers',
        run: 'Make',
    },
    edit: {
        title: 'Change a pic',
        hint: 'Tap the plus or Pic and pick one or more pictures (up to 10). Each one gets a number. Then say what to swap, like: put the jacket from Pic 2 on the person in Pic 1. Then tap Change.',
        placeholder: 'Example: make the sky more blue',
        run: 'Change',
    },
    layerize: {
        title: 'Cut a pic into pieces',
        hint: 'Tap the plus or Pic, pick a picture, then tap Split. Happy will separate the pieces for you.',
        placeholder: 'Optional: keep the person and the background apart',
        run: 'Split',
    },
};

function showError(message) {
    els.error.textContent = message;
    els.error.classList.remove('hidden');
}

function clearError() {
    els.error.classList.add('hidden');
    els.error.textContent = '';
}

function photoSrc(photo) {
    return photo.preview || photo.url || '';
}

function toPhoto(value) {
    if (typeof value === 'string') {
        return { preview: value, url: value };
    }
    return value;
}

function canAddPhotos() {
    if (state.mode === 'edit') {
        return state.photos.length < 10;
    }
    if (state.mode === 'layerize') {
        return state.photos.length < 1;
    }
    return false;
}

function openPhotoPicker() {
    if (state.running || state.mode === 'generate') {
        return;
    }
    if (state.mode === 'edit' && state.photos.length >= 10) {
        showError('You can add up to 10 pics.');
        return;
    }
    els.fileInput.click();
}

function syncEmptyAdd() {
    const canAdd = state.mode !== 'generate';
    els.emptyAdd.classList.toggle('pointer-events-none', !canAdd);
    els.emptyAdd.tabIndex = canAdd ? 0 : -1;
    els.emptyAdd.setAttribute('aria-hidden', canAdd ? 'false' : 'true');
    if (canAdd) {
        els.emptyAdd.setAttribute('aria-label', 'Add a pic from your phone');
    } else {
        els.emptyAdd.removeAttribute('aria-label');
    }
}

function setMode(mode) {
    state.mode = mode;
    document.querySelectorAll('.mode-btn').forEach((btn) => {
        const active = btn.dataset.mode === mode;
        btn.className = active
            ? 'mode-btn rounded-xl px-2 py-2.5 text-sm font-semibold text-ink-950 bg-sand-50'
            : 'mode-btn rounded-xl px-2 py-2.5 text-sm font-semibold text-sand-400';
    });
    els.addPhoto.classList.toggle('hidden', mode === 'generate');
    els.addPhoto.classList.toggle('flex', mode !== 'generate');
    els.fileInput.multiple = mode === 'edit';
    els.countBlock.classList.toggle('hidden', mode === 'layerize');
    els.emptyTitle.textContent = copy[mode].title;
    els.emptyCopy.textContent = copy[mode].hint;
    els.prompt.placeholder = copy[mode].placeholder;
    els.btnRun.textContent = copy[mode].run;
    syncEmptyAdd();
    renderRefs();
    clearError();
}

function updateEditPlaceholder() {
    if (state.mode !== 'edit') {
        return;
    }
    els.prompt.placeholder = state.photos.length >= 2
        ? 'Example: put the jacket from Pic 2 on the person in Pic 1'
        : copy.edit.placeholder;
}

function renderRefs() {
    if (state.mode === 'generate' || state.photos.length === 0) {
        els.refs.className = 'mb-2 hidden';
        els.refs.innerHTML = '';
        els.photoGuide.className = 'mb-3 hidden';
        els.photoGuide.textContent = '';
        updateEditPlaceholder();
        return;
    }

    els.refs.className = 'mb-2 flex gap-2 overflow-x-auto pb-1';
    els.refs.innerHTML = state.photos.map((photo, i) => (
        '<div class="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl bg-ink-800">' +
            '<img src="' + photoSrc(photo) + '" alt="Pic ' + (i + 1) + '" class="h-full w-full object-cover">' +
            '<span class="absolute bottom-1 left-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-bold leading-none">Pic ' + (i + 1) + '</span>' +
            '<button type="button" data-remove="' + i + '" class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-xs" aria-label="Remove Pic ' + (i + 1) + '">×</button>' +
        '</div>'
    )).join('') + (canAddPhotos()
        ? '<button type="button" data-add-photo class="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-ink-800 text-peach-400" aria-label="Add another pic">' +
            '<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>' +
          '</button>'
        : '');

    if (state.mode === 'edit' && state.photos.length >= 2) {
        els.photoGuide.className = 'mb-3 px-0.5 text-[13px] leading-snug text-sand-400';
        els.photoGuide.textContent = 'Call them Pic 1, Pic 2, and so on. Example: put Pic 2 onto Pic 1.';
    } else if (state.mode === 'edit') {
        els.photoGuide.className = 'mb-3 px-0.5 text-[13px] leading-snug text-sand-400';
        els.photoGuide.textContent = 'This is Pic 1. Add another pic if you want to swap something in.';
    } else {
        els.photoGuide.className = 'mb-3 hidden';
        els.photoGuide.textContent = '';
    }
    updateEditPlaceholder();
}

function showStage(name) {
    els.empty.classList.toggle('hidden', name !== 'empty');
    els.empty.classList.toggle('flex', name === 'empty');
    els.result.classList.toggle('hidden', name !== 'result');
    els.busy.classList.toggle('hidden', name !== 'busy');
    els.busy.classList.toggle('flex', name === 'busy');
}

function setRunning(running) {
    state.running = running;
    els.prompt.disabled = running;
    els.btnRun.disabled = running;
    els.btnPhoto.disabled = running;
    els.emptyAdd.disabled = running;
    els.btnOptions.disabled = running;
    els.btnRun.classList.toggle('opacity-60', running);
    els.btnRun.textContent = running ? 'Working…' : copy[state.mode].run;
    document.querySelectorAll('.mode-btn').forEach((btn) => {
        btn.disabled = running;
        btn.classList.toggle('opacity-50', running);
    });
}

function escapeAttr(value) {
    return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function renderResults(urls) {
    state.results = urls;
    els.result.innerHTML = urls.map((url, i) => (
        '<article class="overflow-hidden rounded-3xl bg-ink-800">' +
            '<img src="' + escapeAttr(url) + '" alt="Finished pic ' + (i + 1) + '" class="w-full object-cover">' +
            '<p class="px-4 pt-3 text-[13px] leading-snug text-sand-400">Tap <strong class="font-semibold text-sand-50">Save pic</strong>. On iPhone choose Save Image. You can also press and hold the picture.</p>' +
            '<div class="grid grid-cols-1 gap-2 p-3">' +
                '<button type="button" class="js-save h-12 rounded-2xl bg-peach-500 text-base font-bold text-ink-950" data-index="' + i + '">Save pic</button>' +
                '<div class="grid grid-cols-2 gap-2">' +
                    '<button type="button" class="js-edit rounded-2xl bg-white/5 py-3 text-sm font-semibold" data-index="' + i + '">Change this</button>' +
                    '<button type="button" class="js-split rounded-2xl bg-white/5 py-3 text-sm font-semibold" data-index="' + i + '">Split this</button>' +
                '</div>' +
            '</div>' +
        '</article>'
    )).join('');
}

function urlsFromResponse(data) {
    const list = Array.isArray(data.images) ? data.images : [];
    return list
        .map((item) => (typeof item === 'string' ? item : item && item.url))
        .filter(Boolean);
}

async function readJson(res) {
    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error("Couldn't make that picture. Try again.");
    }
    if (!res.ok) {
        throw new Error(data.error || "Couldn't make that picture. Try again.");
    }
    return data;
}

function layerizeSize(size) {
    if (size === 'auto_2K' || size === 'auto_1K') {
        return size;
    }
    return 'auto';
}

async function runStudio() {
    const prompt = els.prompt.value.trim();

    if (state.mode === 'generate') {
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                image_size: state.size,
                num_images: state.count,
                output_format: 'jpeg',
            }),
        });
        return readJson(res);
    }

    if (state.mode === 'edit') {
        const body = new FormData();
        body.append('prompt', prompt);
        body.append('image_size', state.size);
        body.append('num_images', String(state.count));
        body.append('output_format', 'jpeg');
        const remote = [];
        state.photos.forEach((photo) => {
            if (photo.file) {
                body.append('images', photo.file, photo.file.name || 'pic.jpg');
            } else if (photo.url) {
                remote.push(photo.url);
            }
        });
        if (remote.length) {
            body.append('image_urls', JSON.stringify(remote));
        }
        const res = await fetch('/api/edit', { method: 'POST', body });
        return readJson(res);
    }

    const body = new FormData();
    if (prompt) {
        body.append('prompt', prompt);
    }
    body.append('image_size', layerizeSize(state.size));
    const first = state.photos[0];
    if (first && first.file) {
        body.append('image', first.file, first.file.name || 'pic.jpg');
    } else if (first && first.url) {
        body.append('image_url', first.url);
    }
    const res = await fetch('/api/layerize', { method: 'POST', body });
    return readJson(res);
}

async function savePicture(url, btn) {
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Preparing…';
    }
    try {
        const fetchUrl = '/download?url=' + encodeURIComponent(url) + '&name=happy.jpg';
        const res = await fetch(fetchUrl);
        if (!res.ok) {
            throw new Error('download failed');
        }
        const blob = await res.blob();
        const ext = (blob.type || '').includes('png') ? 'png' : 'jpg';
        const file = new File([blob], 'happy.' + ext, { type: blob.type || 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'Happy' });
            return;
        }

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'happy.' + ext;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (err) {
        window.open(url, '_blank', 'noopener');
        showError('Press and hold the picture, then tap Add to Photos.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Save pic';
        }
    }
}

function useResult(url, mode) {
    state.photos = [toPhoto(url)];
    setMode(mode);
    showStage('empty');
}

els.result.addEventListener('click', (event) => {
    const save = event.target.closest('.js-save');
    const edit = event.target.closest('.js-edit');
    const split = event.target.closest('.js-split');
    const index = Number((save || edit || split)?.dataset.index);
    const url = state.results[index];
    if (!url) {
        return;
    }
    if (save) {
        savePicture(url, save);
        return;
    }
    if (edit) {
        useResult(url, 'edit');
        return;
    }
    if (split) {
        useResult(url, 'layerize');
    }
});

document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        if (state.running) {
            return;
        }
        setMode(btn.dataset.mode);
    });
});

els.btnOptions.addEventListener('click', () => els.options.showModal());
els.btnPhoto.addEventListener('click', openPhotoPicker);
els.emptyAdd.addEventListener('click', openPhotoPicker);

els.fileInput.addEventListener('change', () => {
    const files = Array.from(els.fileInput.files || []);
    files.forEach((file) => {
        state.photos.push({
            preview: URL.createObjectURL(file),
            file,
        });
    });
    if (state.mode === 'layerize') {
        state.photos = state.photos.slice(-1);
    }
    if (state.mode === 'edit' && state.photos.length > 10) {
        state.photos = state.photos.slice(0, 10);
        showError('You can add up to 10 pics.');
    }
    renderRefs();
    if (state.photos.length <= 10) {
        clearError();
    }
    els.fileInput.value = '';
});

els.refs.addEventListener('click', (event) => {
    if (event.target.closest('[data-add-photo]')) {
        openPhotoPicker();
        return;
    }
    const btn = event.target.closest('[data-remove]');
    if (!btn) {
        return;
    }
    state.photos.splice(Number(btn.dataset.remove), 1);
    renderRefs();
});

document.querySelectorAll('.size-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
        state.size = btn.dataset.size;
        document.querySelectorAll('.size-pill').forEach((pill) => {
            const on = pill === btn;
            pill.className = on
                ? 'size-pill rounded-full bg-sand-50 px-3 py-2 text-sm font-semibold text-ink-950'
                : 'size-pill rounded-full bg-white/5 px-3 py-2 text-sm font-semibold';
        });
    });
});

document.querySelectorAll('.count-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
        state.count = Number(btn.dataset.count);
        document.querySelectorAll('.count-pill').forEach((pill) => {
            const on = pill === btn;
            pill.className = on
                ? 'count-pill flex-1 rounded-2xl bg-sand-50 py-3 text-sm font-semibold text-ink-950'
                : 'count-pill flex-1 rounded-2xl bg-white/5 py-3 text-sm font-semibold';
        });
    });
});

els.btnRun.addEventListener('click', async () => {
    if (state.running) {
        return;
    }

    const prompt = els.prompt.value.trim();
    clearError();

    if (state.mode === 'generate' && !prompt) {
        showError('Tell me what picture you want.');
        els.prompt.focus();
        return;
    }
    if (state.mode === 'edit' && state.photos.length === 0) {
        showError('Add a pic first.');
        return;
    }
    if (state.mode === 'edit' && !prompt) {
        showError('Tell me what to change in the pic.');
        els.prompt.focus();
        return;
    }
    if (state.mode === 'layerize' && state.photos.length === 0) {
        showError('Add a pic first.');
        return;
    }

    setRunning(true);
    showStage('busy');
    const started = Date.now();
    const tick = setInterval(() => {
        const sec = Math.round((Date.now() - started) / 1000);
        els.elapsed.textContent = 'Keep this page open. ' + sec + 's so far · usually about a minute.';
    }, 250);

    try {
        const data = await runStudio();
        const urls = urlsFromResponse(data);
        if (!urls.length) {
            throw new Error("Couldn't make that picture. Try again.");
        }
        renderResults(urls);
        showStage('result');
    } catch (err) {
        showError(err.message || "Couldn't make that picture. Try again.");
        showStage(state.results.length ? 'result' : 'empty');
    } finally {
        clearInterval(tick);
        setRunning(false);
    }
});

els.prompt.addEventListener('input', clearError);

fetch('/api/ready')
    .then((res) => res.json())
    .then((data) => {
        if (!data.ready) {
            showError("Happy isn't ready yet. Try again later.");
        }
    })
    .catch(() => {});

setMode('generate');

import axios from '../lib/axios';
import {
    getRawSubjects,
    getRawFlashcards,
    getRawReviewLogs,
    saveRawSubject,
    saveRawFlashcard,
    saveRawReviewLog,
    getSyncMetadata,
    saveSyncMetadata
} from './localDb';

/**
 * Converts a base64 DataURL to a File object
 */
function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return null;
    const mime = mimeMatch[1];
    const bstr = atob(arr[arr.length - 1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

/**
 * Pushes local changes (where is_synced === false) to the backend.
 * This includes created, updated, and soft-deleted items.
 */
export const pushToServer = async () => {
    try {
        const localSubjects = await getRawSubjects();
        const localFlashcards = await getRawFlashcards();
        const localReviewLogs = await getRawReviewLogs();

        // Filter only items that are not synced yet
        const unSyncedSubjects = localSubjects.filter(sub => !sub.is_synced);
        const unSyncedFlashcards = localFlashcards.filter(card => !card.is_synced);
        const unSyncedReviewLogs = localReviewLogs.filter(log => !log.is_synced);

        if (unSyncedSubjects.length === 0 && unSyncedFlashcards.length === 0 && unSyncedReviewLogs.length === 0) {
            return; // Nothing to push
        }

        // ===================================
        // PRE-SYNC: Upload Base64 Images
        // ===================================
        for (let card of unSyncedFlashcards) {
            // Front Image Upload
            if (card.front_image && card.front_image.startsWith('data:image')) {
                const file = dataURLtoFile(card.front_image, `front_${card.id}.webp`);
                if (file) {
                    const formData = new FormData();
                    formData.append('image', file);
                    const res = await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                    card.front_image = res.data.image_url;
                    await saveRawFlashcard(card); // Save the URL locally so it's not repeatedly uploaded
                }
            }
            // Back Image Upload
            if (card.back_image && card.back_image.startsWith('data:image')) {
                const file = dataURLtoFile(card.back_image, `back_${card.id}.webp`);
                if (file) {
                    const formData = new FormData();
                    formData.append('image', file);
                    const res = await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                    card.back_image = res.data.image_url;
                    await saveRawFlashcard(card);
                }
            }
        }

        const payload = {
            subjects: unSyncedSubjects,
            flashcards: unSyncedFlashcards,
            review_logs: unSyncedReviewLogs
        };

        const response = await axios.post('/api/sync/push', payload);

        if (response.data.status === 'success') {
            // Mark all pushed items as synced locally
            for (const sub of unSyncedSubjects) {
                sub.is_synced = true;
                await saveRawSubject(sub);
            }
            for (const card of unSyncedFlashcards) {
                card.is_synced = true;
                await saveRawFlashcard(card);
            }
            for (const log of unSyncedReviewLogs) {
                log.is_synced = true;
                await saveRawReviewLog(log);
            }
        }
    } catch (error) {
        console.error('Error during push sync:', error);
        throw error;
    }
};

/**
 * Pulls changes from the server that occurred after `last_pulled_at`.
 * Merges the incoming subjects, flashcards, and review logs into the local IndexedDB.
 */
export const pullFromServer = async () => {
    try {
        const lastPulledAt = await getSyncMetadata('last_pulled_at');
        const url = lastPulledAt
            ? `/api/sync/pull?last_pulled_at=${encodeURIComponent(lastPulledAt)}`
            : '/api/sync/pull';

        const response = await axios.get(url);
        const { subjects, flashcards, review_logs, timestamp } = response.data;

        // Merge Subjects
        if (subjects && subjects.length > 0) {
            for (const serverSub of subjects) {
                serverSub.is_synced = true;
                await saveRawSubject(serverSub);
            }
        }

        // Merge Flashcards
        if (flashcards && flashcards.length > 0) {
            for (const serverCard of flashcards) {
                serverCard.is_synced = true;
                await saveRawFlashcard(serverCard);
            }
        }

        // Merge Review Logs
        if (review_logs && review_logs.length > 0) {
            for (const serverLog of review_logs) {
                serverLog.is_synced = true;
                await saveRawReviewLog(serverLog);
            }
        }

        // Save the new timestamp
        if (timestamp) {
            await saveSyncMetadata('last_pulled_at', timestamp);
        }
    } catch (error) {
        console.error('Error during pull sync:', error);
        throw error;
    }
};

/**
 * Coordinated Sync Cycle
 * 1. Push local changes first
 * 2. Pull server updates
 */
export const syncAll = async () => {
    try {
        await pushToServer();
        await pullFromServer();
    } catch (error) {
        console.error('Sync cycle failed:', error);
        throw error;
    }
};

/**
 * Utility for debounced pushing (useful for auto-syncing during typing/studying)
 */
let debounceTimer;
export const debouncedPushToServer = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (navigator.onLine) {
            pushToServer().catch(e => console.error("Auto-sync push failed", e));
        }
    }, 2000); // 2 seconds debounce
};


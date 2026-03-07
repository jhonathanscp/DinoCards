import axios from '../lib/axios';
import {
    getRawSubjects,
    getRawFlashcards,
    saveRawSubject,
    saveRawFlashcard,
    getSyncMetadata,
    saveSyncMetadata
} from './localDb';

/**
 * Pushes local changes (where is_synced === false) to the backend.
 * This includes created, updated, and soft-deleted items.
 */
export const pushToServer = async () => {
    try {
        const localSubjects = await getRawSubjects();
        const localFlashcards = await getRawFlashcards();

        // Filter only items that are not synced yet
        const unSyncedSubjects = localSubjects.filter(sub => !sub.is_synced);
        const unSyncedFlashcards = localFlashcards.filter(card => !card.is_synced);

        if (unSyncedSubjects.length === 0 && unSyncedFlashcards.length === 0) {
            return; // Nothing to push
        }

        const payload = {
            subjects: unSyncedSubjects,
            flashcards: unSyncedFlashcards
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
        }
    } catch (error) {
        console.error('Error during push sync:', error);
        throw error;
    }
};

/**
 * Pulls changes from the server that occurred after `last_pulled_at`.
 * Merges the incoming subjects and flashcards into the local IndexedDB.
 */
export const pullFromServer = async () => {
    try {
        const lastPulledAt = await getSyncMetadata('last_pulled_at');
        const url = lastPulledAt
            ? `/api/sync/pull?last_pulled_at=${encodeURIComponent(lastPulledAt)}`
            : '/api/sync/pull';

        const response = await axios.get(url);
        const { subjects, flashcards, timestamp } = response.data;

        // Merge Subjects
        if (subjects && subjects.length > 0) {
            for (const serverSub of subjects) {
                // For the offline engine, we just overwrite the local copy with the server copy
                // because the server is the source of truth for pulls.
                // It also brings down SoftDeletes (deleted_at != null)
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

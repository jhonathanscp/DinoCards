import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

// Configure stores
const subjectsStore = localforage.createInstance({
    name: 'FlashcardApp',
    storeName: 'subjects'
});

const flashcardsStore = localforage.createInstance({
    name: 'FlashcardApp',
    storeName: 'flashcards'
});

const metaStore = localforage.createInstance({
    name: 'FlashcardApp',
    storeName: 'sync_metadata'
});

const reviewLogsStore = localforage.createInstance({
    name: 'FlashcardApp',
    storeName: 'review_logs'
});

/**
 * Generic helper to get all items from a store
 */
const getAllItems = async (store) => {
    const items = [];
    await store.iterate((value) => {
        items.push(value);
    });
    return items;
};

/**
 * Triggers a custom event so the app knows local data changed and a sync can be scheduled
 */
const triggerLocalDbChanged = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('localDbChanged'));
    }
};

// ============================================
// Review Logs
// ============================================

export const logReview = async (flashcardId, grade) => {
    const card = await getFlashcard(flashcardId);
    if (!card) throw new Error('Card not found');

    const log = {
        id: uuidv4(),
        flashcard_id: flashcardId,
        grade: grade, // 1 (Again), 3 (Good), 5 (Easy)
        reviewed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        is_synced: false
    };
    await reviewLogsStore.setItem(log.id, log);

    let quality = Math.max(0, Math.min(5, grade));
    let easeFactor = card.ease_factor ?? 2.5;
    let interval = card.interval ?? 0;
    let repetitions = card.repetitions ?? 0;

    if (quality < 3) {
        repetitions = 0;
        interval = 1;
    } else {
        if (repetitions === 0) {
            interval = 1;
        } else if (repetitions === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetitions++;
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);

    let nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    const updatedCard = {
        ...card,
        ease_factor: easeFactor,
        interval: interval,
        repetitions: repetitions,
        next_review_at: nextReviewDate.toISOString(),
        updated_at: new Date().toISOString(),
        is_synced: false
    };
    await flashcardsStore.setItem(updatedCard.id, updatedCard);

    triggerLocalDbChanged();
    return log;
};

export const getReviewLogs = async () => {
    const logs = await getAllItems(reviewLogsStore);
    return logs.filter(log => !log.deleted_at);
};

// ============================================
// Subjects
// ============================================

export const getSubjects = async () => {
    const subjects = await getAllItems(subjectsStore);
    // Return only non-deleted subjects
    return subjects.filter(subject => !subject.deleted_at);
};

export const getSubject = async (id) => {
    return await subjectsStore.getItem(id);
};

export const createSubject = async (data) => {
    const newSubject = {
        ...data,
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        is_synced: false
    };
    await subjectsStore.setItem(newSubject.id, newSubject);
    triggerLocalDbChanged();
    return newSubject;
};

export const updateSubject = async (id, data) => {
    const existing = await subjectsStore.getItem(id);
    if (!existing) throw new Error('Subject not found locally');

    const updatedSubject = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
        is_synced: false
    };
    await subjectsStore.setItem(id, updatedSubject);
    triggerLocalDbChanged();
    return updatedSubject;
};

export const deleteSubject = async (id) => {
    const existing = await subjectsStore.getItem(id);
    if (!existing) return;

    // Soft delete local
    const deletedSubject = {
        ...existing,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_synced: false
    };
    await subjectsStore.setItem(id, deletedSubject);
    triggerLocalDbChanged();
    return deletedSubject;
};

// ============================================
// Flashcards
// ============================================

export const getFlashcards = async (subjectId = null) => {
    let flashcards = await getAllItems(flashcardsStore);
    // Filter out deleted
    flashcards = flashcards.filter(card => !card.deleted_at);

    if (subjectId) {
        flashcards = flashcards.filter(card => card.subject_id === subjectId);
    }
    return flashcards;
};

export const getFlashcard = async (id) => {
    return await flashcardsStore.getItem(id);
};

export const createFlashcard = async (data) => {
    const newCard = {
        ...data,
        id: uuidv4(),
        next_review_at: null,
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        is_synced: false
    };
    await flashcardsStore.setItem(newCard.id, newCard);
    triggerLocalDbChanged();
    return newCard;
};

export const updateFlashcard = async (id, data) => {
    const existing = await flashcardsStore.getItem(id);
    if (!existing) throw new Error('Flashcard not found locally');

    const updatedCard = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
        is_synced: false
    };
    await flashcardsStore.setItem(id, updatedCard);
    triggerLocalDbChanged();
    return updatedCard;
};

export const deleteFlashcard = async (id) => {
    const existing = await flashcardsStore.getItem(id);
    if (!existing) return;

    // Soft delete local
    const deletedCard = {
        ...existing,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_synced: false
    };
    await flashcardsStore.setItem(id, deletedCard);
    triggerLocalDbChanged();
    return deletedCard;
};

// ============================================
// Raw Store Access (for SyncService)
// ============================================

export const getRawSubjects = async () => await getAllItems(subjectsStore);
export const getRawFlashcards = async () => await getAllItems(flashcardsStore);
export const getRawReviewLogs = async () => await getAllItems(reviewLogsStore);
export const saveRawSubject = async (subject) => await subjectsStore.setItem(subject.id, subject);
export const saveRawFlashcard = async (flashcard) => await flashcardsStore.setItem(flashcard.id, flashcard);
export const saveRawReviewLog = async (log) => await reviewLogsStore.setItem(log.id, log);

export const getSyncMetadata = async (key) => await metaStore.getItem(key);
export const saveSyncMetadata = async (key, value) => await metaStore.setItem(key, value);

export const getActiveUserId = async () => await metaStore.getItem('active_user_id');
export const setActiveUserId = async (id) => await metaStore.setItem('active_user_id', id);

// ============================================
// Auth Helpers
// ============================================

export const clearDatabase = async () => {
    await subjectsStore.clear();
    await flashcardsStore.clear();
    await metaStore.clear();
    await reviewLogsStore.clear();
    triggerLocalDbChanged();
};

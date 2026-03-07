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
    return deletedCard;
};

// ============================================
// Raw Store Access (for SyncService)
// ============================================

export const getRawSubjects = async () => await getAllItems(subjectsStore);
export const getRawFlashcards = async () => await getAllItems(flashcardsStore);
export const saveRawSubject = async (subject) => await subjectsStore.setItem(subject.id, subject);
export const saveRawFlashcard = async (flashcard) => await flashcardsStore.setItem(flashcard.id, flashcard);

export const getSyncMetadata = async (key) => await metaStore.getItem(key);
export const saveSyncMetadata = async (key, value) => await metaStore.setItem(key, value);

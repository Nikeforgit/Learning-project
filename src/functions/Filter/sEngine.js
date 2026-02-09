import Search from "./search";

export function createIndex(data) {
    const index = {};
    data.forEach((doc, docId) => {
        const words = doc.content.toLowerCase().split(/\W+/);
        words.forEach(word => {
            if (!index[word]) index[word] = [];
            index[word].push(docId);
        });
    });
    return index;
};

export function sEngine(searchTerm, index, data) {
    const queryWords = searchTerm.toLowerCase().split(/\W+/);
    const results = new Set();
    queryWords.forEach(word => {
        if (index[word]) {
            index[word].forEach(docId => results.add(data[docId]));
        }
    });
    return Array.from(results);
};
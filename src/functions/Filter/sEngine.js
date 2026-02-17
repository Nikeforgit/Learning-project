
export function createIndex(data) {
  const index = {};

  data.forEach((doc, docId) => {
    const titleWords = (doc.title || "")
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);

    const bodyWords = (doc.selftext || "")
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean);

    titleWords.forEach(word => {
      if (!index[word]) index[word] = new Map();
      index[word].set(docId, (index[word].get(docId) || 0) + 2);
    });

    bodyWords.forEach(word => {
      if (!index[word]) index[word] = new Map();
      index[word].set(docId, (index[word].get(docId) || 0) + 1);
    });
  });

  return index;
};

export function sEngine(searchTerm, index, data, localIds = new Set(), mode = "OR") {
  const queryWords = searchTerm
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);
  if (!queryWords.length) return [];
  const score = {};
  const matchCount = {};
  queryWords.forEach(word => {
    if (index[word]) {
      index[word].forEach((weight, docId) => {
        score[docId] = (score[docId] || 0) + weight;
        matchCount[docId] = (matchCount[docId] || 0) + 1;
        if (localIds.has(docId)) {
          score[docId] += 2;
        }
      });
    }
    });
    let entries = Object.entries(score);
    if (mode === "AND") {
        entries = entries.filter(
            ([docId]) => matchCount[docId] === queryWords.length
        );
    }
    entries.forEach(([docId]) => {
    const doc = data[docId];
    score[docId] += Math.log1p(doc.score || 0);
    const age = Date.now()/1000 - data[docId].created_utc;
    score[docId] += 1 / (1 + age / 86400);
  });

  return entries
  .sort((a, b) => score[b[0]] - score[a[0]])
  .map(([docId]) => data[docId]);
};

export function createIndex(data) {
  const index = {};
  const docFreq = {};

  data.forEach((doc, docId) => {
    const seen = new Set();
    const words = [
    ...(doc.title || "").toLowerCase().split(/\W+/),
    ...(doc.selftext || "").toLowerCase().split(/\W+/)
].filter(Boolean);

    words.forEach(word => {
      if (!index[word]) index[word] = new Map();
      const titleWord = (doc.title || "").toLowerCase().split(/\W+/);
      const isTitle = titleWord.includes(word);
      const weight = isTitle ? 3 : 1;
      index[word].set(docId, (index[word].get(docId) || 0) + weight);
      if (!seen.has(word)) {
        docFreq[word] = (docFreq[word] || 0) + 1;
        seen.add(word);
      }
    });
  });
  return { index, docFreq };
};

export function sEngine(searchTerm, indexData, data, localIds = new Set(), mode = "OR") {
  const { index, docFreq } = indexData;
  const queryWords = searchTerm
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);
  if (!queryWords.length) return [];
  const score = {};
  const matchCount = {};
  const totalDocs = data.length;
  queryWords.forEach(word => {
    if (!index[word]) return;
    const df = docFreq[word] || 1;
    const idf = Math.log((totalDocs + 1) / df);

      index[word].forEach((tf, docId) => {
        const tfWeight = 1 + Math.log(tf);
        score[docId] = (score[docId] || 0) + tfWeight * idf;
        matchCount[docId] = (matchCount[docId] || 0) + 1;
        if (localIds.has(docId)) {
          score[docId] += 3;
        }
      });
    });
    let entries = Object.entries(score);
    if (mode === "AND") {
        entries = entries.filter(
            ([docId]) => matchCount[docId] === queryWords.length
        );
    }
    entries.forEach(([docId]) => {
      const doc = data[docId];
      score[docId] += Math.log1p(doc.score || 0) * 1.5;
      score[docId] += Math.log1p(doc.num_comments || 0);
      const age = Date.now()/1000 - doc.created_utc;
      const ageHours = age / 3600;
      score[docId] += 1 / (1 + ageHours / 24);
      const title = (doc.title || "").toLowerCase();
      const queryStr = queryWords.join(" ");
      if (title === queryStr) score[docId] += 20;
      else if (title.startsWith(queryStr)) score[docId] += 15;
      else if (title.includes(queryStr)) score[docId] += 10;
  });

  return entries
  .sort((a, b) => score[b[0]] - score[a[0]])
  .map(([docId]) => data[docId]);
};
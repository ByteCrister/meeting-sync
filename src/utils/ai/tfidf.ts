// * src>utils>ai>tfidf.ts
"use server";

import { removeStopwords } from "stopword";
import { PartialSlot } from "@/app/api/ai-insights/trending/route";

// Tokenizer
const tokenize = (text: string): string[] => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
};

// Compute TF (term frequency)
const computeTF = (tokens: string[]) => {
    const tf: Record<string, number> = {};
    const total = tokens.length;

    for (const token of tokens) {
        tf[token] = (tf[token] || 0) + 1;
    }

    for (const word in tf) {
        tf[word] /= total;
    }

    return tf;
};

// Compute IDF (inverse document frequency)
const computeIDF = (docs: string[][]) => {
    const idf: Record<string, number> = {};
    const N = docs.length;

    for (const doc of docs) {
        const unique = new Set(doc);
        for (const word of unique) {
            idf[word] = (idf[word] || 0) + 1;
        }
    }

    for (const word in idf) {
        idf[word] = Math.log(N / idf[word]);
    }

    return idf;
};

// Main keyword extraction
export const extractTopKeywords = async (slots: PartialSlot[], topN = 10) => {
    const processedDocs = slots.map(slot => {
        const rawText = `${slot.title} ${slot.description} ${slot.tags.join(" ")}`;
        const tokens = tokenize(rawText);
        return removeStopwords(tokens);
    });

    const idf = computeIDF(processedDocs);
    const wordScores: Record<string, number> = {};

    processedDocs.forEach(doc => {
        const tf = computeTF(doc);
        for (const word in tf) {
            const score = tf[word] * (idf[word] || 0);
            wordScores[word] = (wordScores[word] || 0) + score;
        }
    });

    const sorted = Object.entries(wordScores)
        .filter(([word]) => word.length > 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    return sorted.map(([word, score]) => ({ word, score }));
};

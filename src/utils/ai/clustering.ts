// * src>utils>ai>clustering.ts
"use server"

import * as kmeans from "ml-kmeans";
import { PartialSlot } from "@/app/api/ai-insights/trending/route";

// Euclidean distance function
const euclideanDistance = (p: number[], q: number[]): number => {
    let sum = 0;
    for (let i = 0; i < p.length; i++) {
        sum += Math.pow(p[i] - q[i], 2);
    }
    return Math.sqrt(sum);
};

// Tokenizer (simple whitespace + lowercase)
const tokenize = (text: string) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
};

// Compute term frequency (TF)
const computeTF = (tokens: string[]) => {
    const tf: Record<string, number> = {};
    const totalTokens = tokens.length;

    for (const token of tokens) {
        tf[token] = (tf[token] || 0) + 1;
    }

    // Normalize by total terms
    for (const key in tf) {
        tf[key] /= totalTokens;
    }

    return tf;
};

// Compute inverse document frequency (IDF)
const computeIDF = (docs: string[][]) => {
    const idf: Record<string, number> = {};
    const N = docs.length;

    for (const doc of docs) {
        const uniqueTokens = new Set(doc);
        for (const token of uniqueTokens) {
            idf[token] = (idf[token] || 0) + 1;
        }
    }

    for (const key in idf) {
        idf[key] = Math.log(N / idf[key]);
    }

    return idf;
};

// Convert documents to TF-IDF vectors
const computeTFIDFVectors = (documents: string[][]) => {
    const idf = computeIDF(documents);
    const allTerms = Object.keys(idf);

    const vectors = documents.map((tokens) => {
        const tf = computeTF(tokens);
        return allTerms.map((term) => (tf[term] || 0) * idf[term]);
    });

    return vectors;
};

// Main clustering function
export const clusterMeetings = async (slots: PartialSlot[], numClusters = 4) => {
    const numSlots = slots.length;
    if (numSlots === 0) return [];

    const validNumClusters = Math.min(numClusters, numSlots);
    if (validNumClusters <= 0) {
        throw new Error("Number of clusters must be greater than 0 and smaller than the number of slots.");
    }

    // Prepare documents
    const documents = slots.map(slot =>
        tokenize(`${slot.title} ${slot.description} ${slot.tags.join(" ")}`)
    );

    // Convert to TF-IDF vectors
    const vectors = computeTFIDFVectors(documents);

    // K-means clustering
    const options = {
        maxIterations: 100,
        tolerance: 0.0001,
        distanceFunction: euclideanDistance,
        initialization: "kmeans++" as kmeans.InitializationMethod,
    };

    const result = kmeans.kmeans(vectors, validNumClusters, options);
    return result.clusters;
};

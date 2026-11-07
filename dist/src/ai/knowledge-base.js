"use strict";
/**
 * Knowledge Base Access Layer
 * Handles retrieval of stored knowledge for RAG pipeline
 * Supports file-based knowledge with optional vector search integration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeBase = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fs_2 = require("fs");
/**
 * Knowledge Base - In-memory store with file persistence
 * In production, this would connect to a vector database
 */
class KnowledgeBase {
    documents = [];
    basePath;
    constructor(basePath = 'knowledge') {
        this.basePath = basePath;
        this.loadAllDocuments();
    }
    /**
     * Load all documents from the knowledge base directory
     */
    loadAllDocuments() {
        const types = ['requirements', 'test-cases', 'defects', 'patterns'];
        for (const type of types) {
            const typeDir = path_1.default.join(this.basePath, type);
            if (!fs_1.default.existsSync(typeDir))
                continue;
            const files = fs_1.default.readdirSync(typeDir).filter(f => f.endsWith('.md'));
            for (const file of files) {
                const filePath = path_1.default.join(typeDir, file);
                const content = (0, fs_2.readFileSync)(filePath, 'utf-8');
                const doc = {
                    id: `${type}-${path_1.default.basename(file, '.md')}`,
                    title: path_1.default.basename(file, '.md').replace(/-/g, ' '),
                    content,
                    type: type,
                    tags: this.extractTags(file),
                    metadata: {
                        sourceFile: filePath,
                        loadedAt: new Date().toISOString(),
                    },
                };
                this.documents.push(doc);
            }
        }
    }
    /**
     * Extract tags from filename
     */
    extractTags(filename) {
        const base = path_1.default.basename(filename, '.md');
        return base.split('-').map(tag => tag.toLowerCase());
    }
    /**
     * Search documents by query string
     * @param query - Search query (matches against title and content)
     * @param options - Search options
     * @returns Matching documents sorted by relevance
     */
    search(query, options = {}) {
        const { includeTypes, minRelevance = 0.3 } = options;
        const queryLower = query.toLowerCase();
        return this.documents
            .filter(doc => includeTypes ? includeTypes.includes(doc.type) : true)
            .filter(doc => doc.title.toLowerCase().includes(queryLower) ||
            doc.content.toLowerCase().includes(queryLower))
            .sort((a, b) => {
            // Simple relevance scoring: title matches > content matches
            const aScore = a.title.toLowerCase().includes(queryLower) ? 2 : 0 +
                a.content.toLowerCase().includes(queryLower) ? 1 : 0;
            const bScore = b.title.toLowerCase().includes(queryLower) ? 2 : 0 +
                b.content.toLowerCase().includes(queryLower) ? 1 : 0;
            return bScore - aScore;
        })
            .filter(doc => docScore(doc, minRelevance))
            .slice(0, 10); // Return top 10 results
    }
    /**
     * Get documents by type
     */
    getByType(type) {
        return this.documents.filter(doc => doc.type === type);
    }
    /**
     * Get a document by ID
     */
    getById(id) {
        return this.documents.find(doc => doc.id === id);
    }
    /**
     * Get all documents
     */
    getAll() {
        return this.documents;
    }
    /**
     * Calculate relevance score for a document
     */
    docScore(doc, minRelevance) {
        const queryTerms = this.lastQuery?.split(' ') || [];
        if (!queryTerms.length)
            return true;
        let score = 0;
        const contentLower = doc.content.toLowerCase();
        const titleLower = doc.title.toLowerCase();
        for (const term of queryTerms) {
            if (titleLower.includes(term))
                score += 2;
            if (contentLower.includes(term))
                score += 1;
        }
        return score >= (minRelevance * 3);
    }
}
/**
 * Singleton instance - in production would be injected
 */
exports.knowledgeBase = new KnowledgeBase();
exports.default = exports.knowledgeBase;

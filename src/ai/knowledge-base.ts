/**
 * Knowledge Base Access Layer
 * Handles retrieval of stored knowledge for RAG pipeline
 * Supports file-based knowledge with optional vector search integration
 */

import fs from 'fs';
import path from 'path';
import { readFileSync } from 'fs';

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  type: 'requirement' | 'test-case' | 'defect' | 'pattern' | 'other';
  tags: string[];
  metadata?: Record<string, any>;
}

/**
 * Knowledge Base - In-memory store with file persistence
 * In production, this would connect to a vector database
 */
class KnowledgeBase {
  private documents: KnowledgeDocument[] = [];
  private basePath: string;

  constructor(basePath: string = 'knowledge') {
    this.basePath = basePath;
    this.loadAllDocuments();
  }

  /**
   * Load all documents from the knowledge base directory
   */
  private loadAllDocuments(): void {
    const types = ['requirements', 'test-cases', 'defects', 'patterns'];

    for (const type of types) {
      const typeDir = path.join(this.basePath, type);
      if (!fs.existsSync(typeDir)) continue;

      const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.md'));

      for (const file of files) {
        const filePath = path.join(typeDir, file);
        const content = readFileSync(filePath, 'utf-8');

        const doc: KnowledgeDocument = {
          id: `${type}-${path.basename(file, '.md')}`,
          title: path.basename(file, '.md').replace(/-/g, ' '),
          content,
          type: type as KnowledgeDocument['type'],
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
  private extractTags(filename: string): string[] {
    const base = path.basename(filename, '.md');
    return base.split('-').map(tag => tag.toLowerCase());
  }

  /**
   * Search documents by query string
   * @param query - Search query (matches against title and content)
   * @param options - Search options
   * @returns Matching documents sorted by relevance
   */
  search(query: string, options: {
    includeTypes?: KnowledgeDocument['type'][];
    minRelevance?: number;
  } = {}): KnowledgeDocument[] {
    const { includeTypes, minRelevance = 0.3 } = options;
    const queryLower = query.toLowerCase();

    return this.documents
      .filter(doc =>
        includeTypes ? includeTypes.includes(doc.type) : true
      )
      .filter(doc =>
        doc.title.toLowerCase().includes(queryLower) ||
        doc.content.toLowerCase().includes(queryLower)
      )
      .sort((a, b) => {
        // Simple relevance scoring: title matches > content matches
        const aScore =
          a.title.toLowerCase().includes(queryLower) ? 2 : 0 +
          a.content.toLowerCase().includes(queryLower) ? 1 : 0;
        const bScore =
          b.title.toLowerCase().includes(queryLower) ? 2 : 0 +
          b.content.toLowerCase().includes(queryLower) ? 1 : 0;
        return bScore - aScore;
      })
      .filter(doc => docScore(doc, minRelevance))
      .slice(0, 10); // Return top 10 results
  }

  /**
   * Get documents by type
   */
  getByType(type: KnowledgeDocument['type']): KnowledgeDocument[] {
    return this.documents.filter(doc => doc.type === type);
  }

  /**
   * Get a document by ID
   */
  getById(id: string): KnowledgeDocument | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  /**
   * Get all documents
   */
  getAll(): KnowledgeDocument[] {
    return this.documents;
  }

  /**
   * Calculate relevance score for a document
   */
  private docScore(doc: KnowledgeDocument, minRelevance: number): boolean {
    const queryTerms = (this as any).lastQuery?.split(' ') || [];
    if (!queryTerms.length) return true;

    let score = 0;
    const contentLower = doc.content.toLowerCase();
    const titleLower = doc.title.toLowerCase();

    for (const term of queryTerms) {
      if (titleLower.includes(term)) score += 2;
      if (contentLower.includes(term)) score += 1;
    }

    return score >= (minRelevance * 3);
  }
}

/**
 * Singleton instance - in production would be injected
 */
export const knowledgeBase = new KnowledgeBase();

export default knowledgeBase;
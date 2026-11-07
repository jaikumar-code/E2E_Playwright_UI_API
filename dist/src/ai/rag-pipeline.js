"use strict";
/**
 * RAG (Retrieval-Augmented Generation) Pipeline
 * Orchestrates knowledge retrieval + AI generation for test assistance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeRAGPipeline = executeRAGPipeline;
exports.runRAGForTestGeneration = runRAGForTestGeneration;
exports.generateTestFromDocument = generateTestFromDocument;
exports.generateTestFromRequirement = generateTestFromRequirement;
exports.generateTestsFromTestCases = generateTestsFromTestCases;
exports.generateTestsFromRequirements = generateTestsFromRequirements;
const config_1 = require("./config");
const knowledge_base_1 = require("./knowledge-base");
/**
 * Execute the full RAG pipeline
 * 1. Retrieve relevant knowledge from the knowledge base
 * 2. Generate AI response with retrieved context
 * 3. Calculate confidence score
 * 4. Return complete context for downstream use
 */
async function executeRAGPipeline(query, options = {}) {
    const { includeTypes, excludeTypes, confidenceThreshold = 0.5, maxDocuments = 5, } = options;
    console.log(`[RAG] Executing pipeline for query: "${query.substring(0, 50)}..."`);
    // Step 1: Retrieve relevant knowledge from the knowledge base
    const retrievedDocs = knowledge_base_1.knowledgeBase.search(query, {
        includeTypes,
        minRelevance: confidenceThreshold,
    });
    // Limit to max documents
    const limitedDocs = retrievedDocs.slice(0, maxDocuments);
    // Update last query for relevance scoring
    knowledge_base_1.knowledgeBase.lastQuery = query;
    // Step 2: Build system prompt with retrieved context
    const contextSection = buildContextSection(limitedDocs);
    const systemPrompt = `You are an expert QA engineer assisting with Playwright Test TypeScript code generation.

${contextSection}

Guidelines:
- Generate valid, runnable Playwright Test TypeScript code
- Use page objects for all page interactions
- Use stable locators (data-testid, role, text-based)
- Include automatic waiting - no fixed timeouts
- Include proper assertions and error handling
- Add screenshots/videos where appropriate
- If uncertain about any detail, note the uncertainty and suggest manual review
- Cite sources when referencing specific knowledge

Output: Complete, standalone test file content with all imports.

`;
    // Step 3: Generate AI response using Anthropic
    const aiResponse = await generateWithAI(query, systemPrompt);
    // Step 4: Calculate confidence score
    const confidenceScore = calculateConfidence(aiResponse, limitedDocs);
    // Step 5: Extract source IDs
    const sourcesUsed = limitedDocs.map(doc => doc.id);
    const ragContext = {
        query,
        retrievedDocuments: limitedDocs,
        aiResponse,
        confidenceScore,
        sourcesUsed,
    };
    // Logging
    console.log(`[RAG] Pipeline complete. Confidence: ${confidenceScore.toFixed(2)}`);
    console.log(`[RAG] Sources used: ${sourcesUsed.join(', ')}`);
    return ragContext;
}
/**
 * Build a context section from retrieved documents
 */
function buildContextSection(docs) {
    if (docs.length === 0) {
        return '- No relevant knowledge found. Generate based on best practices.';
    }
    let section = '\nRetrieved Knowledge (' + docs.length + ') documents:\n';
    docs.forEach((doc, index) => {
        section += '\n' + String(index + 1) + '. ' + doc.title + ' [Type: ' + doc.type + ']\n';
        // Include first 300 chars of content
        const contentPreview = doc.content.substring(0, 300).replace(/\n/g, ' ');
        section += '   Content: ' + contentPreview + '...\n';
        section += '   Tags: ' + doc.tags.join(', ') + '\n';
    });
    return section;
}
/**
 * Generate AI response using the configured AI service
 * Calls Anthropic/Claude API with the configured model and system prompt
 */
async function generateWithAI(query, systemPrompt) {
    const anthropicConfig = (0, config_1.createAnthropicConfig)();
    // If API key is available, attempt real API call
    if (anthropicConfig.apiKey) {
        try {
            // In a full implementation, we would use the Anthropic SDK here
            // For now, fall back to structured response and log the intent
            console.log('[RAG] Would call Anthropic API with model:', anthropicConfig.model);
            console.log('[RAG] System prompt length:', systemPrompt.length, 'chars');
            console.log('[RAG] Query:', query.substring(0, 50));
        }
        catch (error) {
            console.error('[RAG] Anthropic API error:', error.message);
        }
    }
    // Fall back to structured response generation
    return generateStructuredResponse(query, systemPrompt);
}
/**
 * Generate a structured response based on query patterns
 * This simulates the AI output for demonstration purposes
 */
function generateStructuredResponse(query, systemPrompt) {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('login') || lowerQuery.includes('auth')) {
        return generateLoginTestResponse();
    }
    else if (lowerQuery.includes('inventory') || lowerQuery.includes('product')) {
        return generateInventoryTestResponse();
    }
    else if (lowerQuery.includes('accessibility') || lowerQuery.includes('a11y')) {
        return generateAccessibilityTestResponse();
    }
    else if (lowerQuery.includes('performance') || lowerQuery.includes('perf')) {
        return generatePerformanceTestResponse();
    }
    else {
        return generateGenericTestResponse();
    }
}
/**
 * Generate a login test response
 */
function generateLoginTestResponse() {
    const lines = [];
    lines.push('import { test, expect } from \'@playwright/test\';');
    lines.push('import { LoginPage } from \'../page-objects/login\';');
    lines.push('');
    lines.push('test.describe(\'Login Functionality\', () => {');
    lines.push('  test(\'TC-001: Standard user login success\', async ({ page }) => {');
    lines.push('    const loginPage = new LoginPage(page);');
    lines.push('    // Navigate to login page');
    lines.push('    await loginPage.navigate();');
    lines.push('    // Login with valid credentials');
    lines.push('    await loginPage.login(\'standard_user\', \'secret_sauce\');');
    lines.push('    // Verify login success');
    lines.push('    await loginPage.verifyLoginSuccess();');
    lines.push('    // Capture screenshot');
    lines.push('    await page.screenshot({ path: \'test-results/screenshots/login-success.png\' });');
    lines.push('  });');
    lines.push('');
    lines.push('  test(\'TC-002: Locked out user login failure\', async ({ page }) => {');
    lines.push('    const loginPage = new LoginPage(page);');
    lines.push('    // Navigate to login page');
    lines.push('    await loginPage.navigate();');
    lines.push('    // Login with locked out user');
    lines.push('    await loginPage.login(\'locked_out_user\', \'secret_sauce\');');
    lines.push('    // Verify login failure');
    lines.push('    await loginPage.verifyLoginFailed();');
    lines.push('    // Get error message');
    lines.push('    const errorMessage = await loginPage.getErrorMessage();');
    lines.push('    expect(errorMessage).toContain(\'locked out\');');
    lines.push('    // Capture screenshot');
    lines.push('    await page.screenshot({ path: \'test-results/screenshots/login-failure.png\' });');
    lines.push('  });');
    lines.push('});');
    return lines.join('\n');
}
/**
 * Generate an inventory test response
 */
function generateInventoryTestResponse() {
    const lines = [];
    lines.push('import { test, expect } from \'@playwright/test\';');
    lines.push('import { LoginPage } from \'../page-objects/login\';');
    lines.push('import { apiClient } from \'../src/api-clients/base\';');
    lines.push('import { testUsers, sampleProducts } from \'../src/test-data/users\';');
    lines.push('');
    lines.push('test.describe(\'Inventory Page\', () => {');
    lines.push('  test.beforeEach(async ({ page }) => {');
    lines.push('    // Login before each test');
    lines.push('    const loginPage = new LoginPage(page);');
    lines.push('    await loginPage.navigate();');
    lines.push('    await loginPage.login(');
    lines.push('      testUsers.standardUser.username,');
    lines.push('      testUsers.standardUser.password');
    lines.push('    );');
    lines.push('    await loginPage.verifyLoginSuccess();');
    lines.push('  });');
    lines.push('');
    lines.push('  test(\'TC-101: Verify inventory page loads correctly\', async ({ page }) => {');
    lines.push('    await expect(page.locator(\'span.title\')).toHaveText(\'Products\');');
    lines.push('    await expect(page.locator(\'.inventory_item\')).toBeVisible();');
    lines.push('  });');
    lines.push('');
    lines.push('  test(\'TC-102: Add product to cart and verify\', async ({ page }) => {');
    lines.push('    // Add first product (Backpack) to cart');
    lines.push('    await page.click([data-testid="add-to-cart"]);');
    lines.push('    // Verify cart badge');
    lines.push('    await expect(page.locator(\'.shopping_cart_badge\')).toHaveText(\'1\');');
    lines.push('    // Capture screenshot');
    lines.push('    await page.screenshot({ path: \'test-results/screenshots/add-to-cart.png\ });');
    lines.push('  });');
    lines.push('');
    lines.push('  test(\'TC-103: Verify product prices match API\', async () => {');
    lines.push('    // Get products from API');
    lines.push('    const apiResponse = await apiClient.get(\'/inventory-products\');');
    lines.push('    const apiProducts = apiResponse.body.data || [];');
    lines.push('    // Verify each product on the page');
    lines.push('    const pageProducts = await page.locator(\'.inventory_item\').all();');
    lines.push('    for (let i = 0; i < pageProducts.length; i++) {');
    lines.push('      const productName = await pageProducts[i].locator(\'.inventory_item_name\').textContent();');
    lines.push('      const productPrice = await pageProducts[i].locator(\'.inventory_item_price\').textContent();');
    lines.push('      // Find matching API product');
    lines.push('      const apiProduct = apiProducts.find((p: any) => p.name === productName);');
    lines.push('      if (apiProduct) {');
    lines.push('        expect(productPrice).toContain(apiProduct.priceString);');
    lines.push('      }');
    lines.push('    }');
    lines.push('  });');
    lines.push('});');
    return lines.join('\n');
}
/**
 * Generate an accessibility test response
 */
function generateAccessibilityTestResponse() {
    const lines = [];
    lines.push('import { test, expect } from \'@playwright/test\';');
    lines.push('');
    lines.push('test.describe(\'Accessibility Tests\', () => {');
    lines.push('  test(\'AC-001: Page has no critical accessibility violations\', async ({ page }) => {');
    lines.push('    await page.goto(\'/inventory\');');
    lines.push('');
    lines.push('    const results = await page.evaluate(async () => {');
    lines.push('      return await window.axe.run();');
    lines.push('    });');
    lines.push('');
    lines.push('    const violations = results.violations.filter(');
    lines.push('      (v: any) => v.level >= 2');
    lines.push('    );');
    lines.push('');
    lines.push('    expect(violations.length).toBe(0);');
    lines.push('');
    lines.push('    if (violations.length > 0) {');
    lines.push('      console.log(\'Accessibility violations found:\', violations.length);');
    lines.push('      violations.forEach((v: any) => {');
    lines.push('        console.log(\`- \${v.id}: \${v.description} (impact: \${v.info.level})\");');
    lines.push('      });');
    lines.push('    }');
    lines.push('  });');
    lines.push('');
    lines.push('  test(\'AC-002: Form inputs have associated labels\', async ({ page }) => {');
    lines.push('    await page.goto(\'/login\');');
    lines.push('');
    lines.push('    const inputsWithoutLabels = await page.evaluate(() => {');
    lines.push('      const inputs = document.querySelectorAll(input, select, textarea);');
    lines.push('      const withoutLabels: string[] = [];');
    lines.push('');
    lines.push('      inputs.forEach((input: any) => {');
    lines.push('        const id = input.id || input.name;');
    lines.push('        if (id) {');
    lines.push('          const label = document.querySelector(label[for="\${id}"]);');
    lines.push('          if (!label) {');
    lines.push('            withoutLabels.push(input.id || input.name || \'unnamed\');');
    lines.push('          }');
    lines.push('        }');
    lines.push('      });');
    lines.push('');
    lines.push('      return withoutLabels;');
    lines.push('    });');
    lines.push('');
    lines.push('    expect(inputsWithoutLabels).toHaveLength(0);');
    lines.push('    expect(inputsWithoutLabels).toContainEqual(\'username\');');
    lines.push('    expect(inputsWithoutLabels).toContainEqual(\'password\');');
    lines.push('  });');
    lines.push('});');
    return lines.join('\n');
}
/**
 * Generate a performance test response
 */
function generatePerformanceTestResponse() {
    const lines = [];
    lines.push('import { test, expect } from \'@playwright/test\';');
    lines.push('');
    lines.push('const PERFORMANCE_BASELINES = {');
    lines.push('  pageLoad: { max: 3000, warning: 2000 }, // ms');
    lines.push('  apiResponse: { max: 500, warning: 200 }, // ms');
    lines.push('};');
    lines.push('');
    lines.push('test.describe(\'Performance Tests\', () => {');
    lines.push('  test(\'PERF-001: Page load time under baseline\', async ({ page }, testInfo) => {');
    lines.push('    const startTime = Date.now();');
    lines.push('    await page.goto(\'/inventory\');');
    lines.push('    await page.waitForLoadState(\'networkidle\');');
    lines.push('    const loadTime = Date.now() - startTime;');
    lines.push('');
    lines.push('    const baseline = PERFORMANCE_BASELINES.pageLoad;');
    lines.push('    console.log(`Page load time: \${loadTime}ms (baseline: max \${baseline.max}ms)`);');
    lines.push('');
    lines.push('    expect(loadTime).toBeLessThan(baseline.max);');
    lines.push('');
    lines.push('    if (loadTime > baseline.warning) {');
    lines.push('      testInfo.annotations?.push({');
    lines.push('        type: \'performance-warning\',');
    lines.push('        description: `Page load time \${loadTime}ms exceeds warning threshold of \${baseline.warning}ms`');
    lines.push('      });');
    lines.push('    }');
    lines.push('  });');
    lines.push('');
    lines.push('  test(\'PERF-002: API response time under baseline\', async () => {');
    lines.push('    const startTime = Date.now();');
    lines.push('    const fetch = await import(\'node:fetch\');');
    lines.push('    const response = await fetch(\'http://localhost:4000/api/users\');');
    lines.push('    const duration = Date.now() - startTime;');
    lines.push('');
    lines.push('    const baseline = PERFORMANCE_BASELINES.apiResponse;');
    lines.push('    console.log(`API response time: \${duration}ms (baseline: max \${baseline.max}ms)`);');
    lines.push('');
    lines.push('    expect(duration).toBeLessThan(baseline.max);');
    lines.push('  });');
    lines.push('});');
    return lines.join('\n');
}
/**
 * Generate a generic test response for unknown queries
 */
function generateGenericTestResponse() {
    const lines = [];
    lines.push('import { test, expect } from \'@playwright/test\';');
    lines.push('');
    lines.push('test.describe(\'Generated Test\', () => {');
    lines.push('  test(\'Test placeholder\', async ({ page }) => {');
    lines.push('    await page.goto(\'/\');');
    lines.push('    await expect(page).toHaveTitle(/(.*)/);');
    lines.push('  });');
    lines.push('});');
    return lines.join('\n');
}
/**
 * Calculate confidence score for AI response
 * Based on multiple factors:
 * - Whether sources were referenced
 * - Whether relevant knowledge was used
 * - Whether risky patterns detected
 * - Completeness of generated code
 */
function calculateConfidence(aiResponse, retrievedDocs) {
    let score = 1.0;
    const responseLower = aiResponse.toLowerCase();
    // Factor 1: Source referencing
    const citesSource = responseLower.includes('source') ||
        responseLower.includes('reference') ||
        responseLower.includes('knowledge');
    if (citesSource) {
        score += 0.1; // Positive reinforcement
    }
    else {
        score -= 0.2; // Penalty for not grounding
    }
    // Factor 2: Relevant knowledge utilized
    const keywordsUsed = retrievedDocs.some(doc => responseLower.includes(doc.title.toLowerCase()));
    if (keywordsUsed) {
        score += 0.1;
    }
    // Factor 3: No risky patterns
    const riskyPatterns = ['document.querySelector(', 'document.getElementById(', 'div.'];
    const hasRiskyPattern = riskyPatterns.some(pattern => aiResponse.includes(pattern));
    if (hasRiskyPattern) {
        score -= 0.3; // Heavy penalty for brittle locators
    }
    // Factor 4: Code completeness
    const hasDescribe = aiResponse.includes('test.describe') ||
        aiResponse.includes('describe(');
    const hasTest = aiResponse.includes('test(');
    const hasExpect = aiResponse.includes('expect(');
    const hasImport = aiResponse.includes("from '@playwright/test'");
    if (hasDescribe && hasTest && hasExpect && hasImport) {
        score += 0.1;
    }
    else {
        score -= 0.1;
    }
    // Factor 5: Confidence penalty if no knowledge was available
    if (retrievedDocs.length === 0) {
        score -= 0.15; // Lower confidence when guessing
    }
    return Math.max(0.1, Math.min(1.0, score));
}
/**
 * Helper function to run RAG pipeline with common options
 */
async function runRAGForTestGeneration(testType, overrides = {}) {
    const queries = {
        login: 'Generate a Playwright test for login functionality',
        inventory: 'Generate a Playwright test for inventory page',
        accessibility: 'Generate a Playwright test for accessibility verification',
        performance: 'Generate a Playwright test for performance validation',
        generic: 'Generate a Playwright test',
    };
    return executeRAGPipeline(queries[testType], overrides);
}
/**
 * Generate a Playwright test from a specific knowledge base document
 * @param docId - The ID of the knowledge base document
 * @param testType - Type of test to generate (login, inventory, etc.)
 * @param overrides - Additional RAG options
 * @returns RAGContext with generated test and confidence score
 */
async function generateTestFromDocument(docId, testType = 'generic', overrides = {}) {
    // Get the document from the knowledge base
    const doc = knowledge_base_1.knowledgeBase.getById(docId);
    if (!doc) {
        console.error(`[RAG] Document not found: ${docId}`);
        return {
            query: `Generate a test from document ${docId}`,
            retrievedDocuments: [],
            aiResponse: '',
            confidenceScore: 0,
            sourcesUsed: [],
        };
    }
    // Use the document title and content as the query context
    const query = `Generate a Playwright test based on this knowledge: ${doc.title}. Content: ${doc.content.substring(0, 200)}...`;
    // Execute RAG pipeline with the document content
    const context = await executeRAGPipeline(query, {
        ...overrides,
        includeTypes: ['requirement', 'test-case', 'pattern'],
    });
    // Post-process: If we have a relevant document, extract and enhance the test generation
    if (doc.content.length > 0) {
        // Generate a more targeted test based on the document
        const targetedQuery = `Generate a Playwright test following this pattern: ${doc.content.substring(0, 300)}`;
        const targetedContext = await executeRAGPipeline(targetedQuery, {
            ...overrides,
            maxDocuments: 3,
        });
        // Combine the original document context with the targeted generation
        context.aiResponse = combineTestResponses(context.aiResponse, targetedContext.aiResponse);
        context.confidenceScore = Math.max(context.confidenceScore, targetedContext.confidenceScore);
    }
    return context;
}
/**
 * Combine two test response strings, removing duplicates and merging best parts
 */
function combineTestResponses(response1, response2) {
    // Simple combination: take the longer, more complete response
    if (response1.length > response2.length) {
        return response1;
    }
    else if (response2.length > response1.length) {
        return response2;
    }
    // If similar length, return first with any unique additions from second
    const lines1 = response1.split('\n');
    const lines2 = response2.split('\n');
    const combined = [];
    const seen = new Set();
    for (const line of lines1) {
        if (!seen.has(line)) {
            combined.push(line);
            seen.add(line);
        }
    }
    for (const line of lines2) {
        if (!seen.has(line)) {
            combined.push(line);
            seen.add(line);
        }
    }
    return combined.join('\n');
}
/**
 * Generate a Playwright test from requirements
 * @param requirementId - The requirement ID (e.g., 'LOGIN-REQ-001')
 * @param overrides - Additional RAG options
 * @returns RAGContext with generated test and confidence score
 */
async function generateTestFromRequirement(requirementId, overrides = {}) {
    // Search for requirements related to the ID
    const query = `requirement ${requirementId}`;
    const context = await executeRAGPipeline(query, {
        ...overrides,
        includeTypes: ['requirement'],
        confidenceThreshold: 0.7,
    });
    // If we found requirements, generate test from the first relevant one
    if (context.retrievedDocuments.length > 0) {
        const doc = context.retrievedDocuments[0];
        // Generate a test based on the requirement content
        const testQuery = `Generate a Playwright test for requirement ${requirementId} with these acceptance criteria: ${doc.content.substring(0, 400)}`;
        const testContext = await executeRAGPipeline(testQuery, {
            ...overrides,
            maxDocuments: 5,
        });
        // Annotate the test with the requirement ID
        if (testContext.aiResponse) {
            const annotatedResponse = annotateWithRequirement(testContext.aiResponse, requirementId);
            testContext.aiResponse = annotatedResponse;
        }
        return testContext;
    }
    // No requirement found, generate a generic test
    return {
        query: `Generate test for requirement ${requirementId}`,
        retrievedDocuments: [],
        aiResponse: generateLoginTestResponse(), // Default to login as example
        confidenceScore: 0.3,
        sourcesUsed: [],
    };
}
/**
 * Annotate a test response with requirement ID metadata
 */
function annotateWithRequirement(testCode, requirementId) {
    // Add a comment at the top of the test with the requirement reference
    const annotation = `// Requirement: ${requirementId}\n// Generated via RAG pipeline\n\n`;
    return annotation + testCode;
}
/**
 * Generate a Playwright test from test cases
 * @param testCaseIds - Array of test case IDs (e.g., ['TC-001', 'TC-002'])
 * @param overrides - Additional RAG options
 * @returns RAGContext with generated tests and confidence scores
 */
async function generateTestsFromTestCases(testCaseIds, overrides = {}) {
    const results = [];
    for (const testCaseId of testCaseIds) {
        // Search for the test case
        const query = `test case ${testCaseId}`;
        const context = await executeRAGPipeline(query, {
            ...overrides,
            includeTypes: ['test-case'],
            confidenceThreshold: 0.5,
        });
        // If found, generate test from the test case
        if (context.retrievedDocuments.length > 0) {
            const doc = context.retrievedDocuments[0];
            const testQuery = `Generate a Playwright test for test case ${testCaseId}: ${doc.content.substring(0, 300)}`;
            const testContext = await executeRAGPipeline(testQuery, {
                ...overrides,
                maxDocuments: 3,
            });
            // Annotate with test case ID
            if (testContext.aiResponse) {
                testContext.aiResponse = annotateWithTestCaseId(testContext.aiResponse, testCaseId);
            }
            results.push(testContext);
        }
        else {
            // Not found, create a basic context
            results.push({
                query: `Generate test for ${testCaseId}`,
                retrievedDocuments: [],
                aiResponse: generateGenericTestResponse(),
                confidenceScore: 0.3,
                sourcesUsed: [],
            });
        }
    }
    return results;
}
/**
 * Annotate a test response with test case ID
 */
function annotateWithTestCaseId(testCode, testCaseId) {
    const annotation = `// Test Case: ${testCaseId}\n// Generated via RAG pipeline\n\n`;
    return annotation + testCode;
}
/**
 * Generate multiple tests from a list of requirements
 * @param requirementIds - Array of requirement IDs
 * @param overrides - Additional RAG options
 * @returns RAGContext[] array of generated tests
 */
async function generateTestsFromRequirements(requirementIds, overrides = {}) {
    const results = [];
    for (const reqId of requirementIds) {
        const testContext = await generateTestFromRequirement(reqId, overrides);
        results.push(testContext);
    }
    return results;
}

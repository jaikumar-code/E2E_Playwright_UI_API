"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiConfig = void 0;
exports.createAnthropicConfig = createAnthropicConfig;
exports.validateAIConfig = validateAIConfig;
/**
 * Default AI configuration using Claude 3.5 Sonnet
 * Temperature set low (0.1) for deterministic test generation
 */
exports.aiConfig = {
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620',
    temperature: 0.1,
    maxTokens: 4000,
    systemPrompt: `You are an expert QA engineer assisting with Playwright Test TypeScript code generation.

Follow these guidelines strictly:
1. Use the established Playwright Test framework patterns
2. Generate valid, runnable TypeScript test code
3. Use page objects for all page interactions
4. Use stable locators (data-testid, role, text-based) - never generate brittle XPath/CSS
5. Include automatic waiting - do not use fixed timeouts
6. Include proper assertions and error handling
7. Add screenshots/videos where appropriate
8. If uncertain about any detail, note the uncertainty and suggest manual review
9. Cite any knowledge sources you reference
10. Keep tests focused and single-purpose

Output format:
- Complete, standalone test file content
- Import all required modules
- Include test.describe() block
- Use async/await pattern
- Follow the project's ESLint/Prettier configuration
`,
    timeoutMs: 30000,
};
/**
 * Creates an Anthropic client instance
 * In production, this would integrate with the Anthropic API
 * For now, returns a configuration object for the AI service
 */
function createAnthropicConfig() {
    return {
        model: exports.aiConfig.model,
        temperature: exports.aiConfig.temperature,
        maxTokens: exports.aiConfig.maxTokens,
        systemPrompt: exports.aiConfig.systemPrompt,
        apiKey: process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY,
        baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
    };
}
/**
 * Validates that the AI configuration is correct
 */
function validateAIConfig(config) {
    return !!config.model && config.temperature >= 0 && config.temperature <= 1;
}
exports.default = exports.aiConfig;

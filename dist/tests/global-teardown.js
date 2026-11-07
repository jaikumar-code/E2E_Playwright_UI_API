"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalTeardown;
const logger_1 = require("../src/utils/logger");
async function globalTeardown() {
    console.log('\n=== Global Teardown Starting ===');
    // Log summary of test execution
    logger_1.logger.info('Test suite teardown initiated');
    // Clean up any temporary resources
    // - Close database connections
    // - Clean up temporary files
    // - Close browser contexts
    console.log('=== Global Teardown Complete ===\n');
}

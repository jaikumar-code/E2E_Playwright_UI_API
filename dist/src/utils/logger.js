"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.TestLogger = void 0;
class TestLogger {
    indentLevel = 0;
    info(message, context) {
        const timestamp = new Date().toISOString();
        const indent = '  '.repeat(this.indentLevel);
        console.log(`${timestamp} ${indent}INFO: ${message}`);
        if (context) {
            console.log(`${timestamp} ${indent}  Context:`, context);
        }
    }
    debug(message, context) {
        const timestamp = new Date().toISOString();
        const indent = '  '.repeat(this.indentLevel);
        console.log(`${timestamp} ${indent}DEBUG: ${message}`);
        if (context) {
            console.log(`${timestamp} ${indent}  Context:`, context);
        }
    }
    warn(message, context) {
        const timestamp = new Date().toISOString();
        const indent = '  '.repeat(this.indentLevel);
        console.warn(`${timestamp} ${indent}WARN: ${message}`);
        if (context) {
            console.warn(`${timestamp} ${indent}  Context:`, context);
        }
    }
    error(message, context) {
        const timestamp = new Date().toISOString();
        const indent = '  '.repeat(this.indentLevel);
        console.error(`${timestamp} ${indent}ERROR: ${message}`);
        if (context) {
            console.error(`${timestamp} ${indent}  Context:`, context);
        }
    }
    /**
     * Increase indentation level (for nested operations)
     */
    enterSection(sectionName) {
        this.indentLevel++;
        console.log(`\n${'  '.repeat(this.indentLevel)}Entering section: "${sectionName}"`);
    }
    /**
     * Decrease indentation level (after nested operation)
     */
    leaveSection(sectionName) {
        console.log(`${'  '.repeat(this.indentLevel)}Exiting section: "${sectionName}"`);
        this.indentLevel--;
    }
    /**
     * Log test start
     */
    testStart(testName, testInfo) {
        console.log(`\n=== Test Started: ${testName} ===`);
        console.log(`Test ID: ${testInfo?.project?.id}`);
        console.log(`Test title: ${testInfo?.title}`);
    }
    /**
     * Log test end
     */
    testEnd(testName, testInfo, severity) {
        const status = severity === 'pass' ? 'PASSED' : severity === 'fail' ? 'FAILED' : 'SKIPPED';
        console.log(`=== Test ${status}: ${testName} ===`);
    }
}
exports.TestLogger = TestLogger;
exports.logger = new TestLogger();

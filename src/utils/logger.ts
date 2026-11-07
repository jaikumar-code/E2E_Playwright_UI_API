/**
 * Test Logger utility
 * Provides structured logging for test execution
 */
import { test } from '@playwright/test';

export class TestLogger {
  private indentLevel = 0;

  info(message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    const indent = '  '.repeat(this.indentLevel);
    console.log(`${timestamp} ${indent}INFO: ${message}`);
    if (context) {
      console.log(`${timestamp} ${indent}  Context:`, context);
    }
  }

  debug(message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    const indent = '  '.repeat(this.indentLevel);
    console.log(`${timestamp} ${indent}DEBUG: ${message}`);
    if (context) {
      console.log(`${timestamp} ${indent}  Context:`, context);
    }
  }

  warn(message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    const indent = '  '.repeat(this.indentLevel);
    console.warn(`${timestamp} ${indent}WARN: ${message}`);
    if (context) {
      console.warn(`${timestamp} ${indent}  Context:`, context);
    }
  }

  error(message: string, context?: any): void {
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
  enterSection(sectionName: string): void {
    this.indentLevel++;
    console.log(`\n${'  '.repeat(this.indentLevel)}Entering section: "${sectionName}"`);
  }

  /**
   * Decrease indentation level (after nested operation)
   */
  leaveSection(sectionName: string): void {
    console.log(`${'  '.repeat(this.indentLevel)}Exiting section: "${sectionName}"`);
    this.indentLevel--;
  }

  /**
   * Log test start
   */
  testStart(testName: string, testInfo: any): void {
    console.log(`\n=== Test Started: ${testName} ===`);
    console.log(`Test ID: ${testInfo?.project?.id}`);
    console.log(`Test title: ${testInfo?.title}`);
  }

  /**
   * Log test end
   */
  testEnd(testName: string, testInfo: any, severity: 'pass' | 'fail' | 'skip'): void {
    const status = severity === 'pass' ? 'PASSED' : severity === 'fail' ? 'FAILED' : 'SKIPPED';
    console.log(`=== Test ${status}: ${testName} ===`);
  }
}

export const logger = new TestLogger();
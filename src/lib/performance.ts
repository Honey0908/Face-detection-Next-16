/**
 * Performance Monitoring Utilities
 *
 * Track and log performance metrics for face recognition operations.
 */

export interface PerformanceMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface PerformanceReport {
  operation: string;
  totalDuration: number;
  marks: PerformanceMark[];
  target?: number;
  withinTarget: boolean;
}

/**
 * Performance tracker for face recognition operations
 */
export class PerformanceTracker {
  private marks: Map<string, PerformanceMark> = new Map();
  private startTime: number;
  private operation: string;
  private target?: number;

  constructor(operation: string, target?: number) {
    this.operation = operation;
    this.target = target;
    this.startTime = performance.now();
  }

  /**
   * Mark start of a sub-operation
   */
  mark(name: string): void {
    this.marks.set(name, {
      name,
      startTime: performance.now(),
    });
  }

  /**
   * Mark end of a sub-operation
   */
  end(name: string): number | undefined {
    const mark = this.marks.get(name);
    if (!mark) {
      console.warn(`Performance mark "${name}" not found`);
      return undefined;
    }

    const endTime = performance.now();
    const duration = endTime - mark.startTime;

    mark.endTime = endTime;
    mark.duration = duration;

    return duration;
  }

  /**
   * Get report of all performance metrics
   */
  report(): PerformanceReport {
    const endTime = performance.now();
    const totalDuration = endTime - this.startTime;

    const marks = Array.from(this.marks.values());

    return {
      operation: this.operation,
      totalDuration,
      marks,
      target: this.target,
      withinTarget: this.target ? totalDuration < this.target : true,
    };
  }

  /**
   * Log performance report to console
   */
  log(): void {
    const report = this.report();

    const status = report.withinTarget ? '✓' : '⚠️';
    const targetInfo = report.target ? ` (target: ${report.target}ms)` : '';

    console.log(
      `${status} ${report.operation}: ${report.totalDuration.toFixed(2)}ms${targetInfo}`,
    );

    // Log individual marks if total duration exceeds target
    if (report.target && !report.withinTarget) {
      report.marks.forEach((mark) => {
        if (mark.duration) {
          console.log(`  - ${mark.name}: ${mark.duration.toFixed(2)}ms`);
        }
      });
    }
  }
}

/**
 * Track scan performance (target: <300ms)
 */
export function createScanTracker(): PerformanceTracker {
  return new PerformanceTracker('Face Scan', 300);
}

/**
 * Track registration performance (target: <500ms per capture)
 */
export function createRegistrationTracker(): PerformanceTracker {
  return new PerformanceTracker('Face Registration', 500);
}

/**
 * Track model loading performance
 */
export function createModelLoadTracker(): PerformanceTracker {
  return new PerformanceTracker('Model Loading');
}

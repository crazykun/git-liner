import * as vscode from 'vscode';

export class TelemetryReporter {
    private static instance: TelemetryReporter;

    public static getInstance(): TelemetryReporter {
        if (!TelemetryReporter.instance) {
            TelemetryReporter.instance = new TelemetryReporter();
        }
        return TelemetryReporter.instance;
    }

    public reportError(error: Error, context?: string): void {
        console.error(`[Git Liner] ${context || 'Error'}:`, error);

        // 在开发模式下显示错误详情
        if (process.env.NODE_ENV === 'development') {
            vscode.window.showErrorMessage(`Git Liner Error: ${error.message}`);
        }
    }

    public reportPerformance(operation: string, duration: number): void {
        console.log(`[Git Liner] Performance: ${operation} took ${duration}ms`);

        // 如果操作耗时过长，记录警告
        if (duration > 5000) {
            console.warn(`[Git Liner] Slow operation detected: ${operation} (${duration}ms)`);
        }
    }

    public reportUsage(feature: string): void {
        console.log(`[Git Liner] Feature used: ${feature}`);
    }
}

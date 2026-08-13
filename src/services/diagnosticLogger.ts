/**
 * Temporary diagnostic logger - will be removed after analysis
 * Captures render sequence, effect execution, and state changes
 */

interface DiagnosticEvent {
  timestamp: number;
  type: string;
  component?: string;
  data: Record<string, any>;
}

class DiagnosticLogger {
  private events: DiagnosticEvent[] = [];
  private renderCounts: Record<string, number> = {};
  private effectCounts: Record<string, number> = {};
  private setterCalls: Record<string, number> = {};

  log(type: string, data: Record<string, any>, component?: string) {
    const event: DiagnosticEvent = {
      timestamp: performance.now(),
      type,
      component,
      data,
    };
    this.events.push(event);
    console.log(`[DIAG] [${event.timestamp.toFixed(1)}ms] ${type}${component ? ` (${component})` : ''}`, data);
  }

  recordRender(component: string) {
    this.renderCounts[component] = (this.renderCounts[component] || 0) + 1;
    this.log('RENDER', { count: this.renderCounts[component] }, component);
  }

  recordEffectExecution(component: string, effectName: string, deps?: string[]) {
    const key = `${component}:${effectName}`;
    this.effectCounts[key] = (this.effectCounts[key] || 0) + 1;
    this.log('EFFECT_EXECUTE', { effectName, count: this.effectCounts[key], deps }, component);
  }

  recordSetterCall(component: string, setterName: string, value: any) {
    const key = `${component}:${setterName}`;
    this.setterCalls[key] = (this.setterCalls[key] || 0) + 1;
    this.log('SETTER', { setter: setterName, count: this.setterCalls[key], value }, component);
  }

  recordStateChange(component: string, stateName: string, oldValue: any, newValue: any) {
    this.log('STATE_CHANGE', {
      state: stateName,
      old: oldValue,
      new: newValue,
      changed: oldValue !== newValue,
    }, component);
  }

  getReport() {
    return {
      totalEvents: this.events.length,
      events: this.events,
      renderCounts: this.renderCounts,
      effectCounts: this.effectCounts,
      setterCalls: this.setterCalls,
      chronology: this.events
        .map(e => `[${e.timestamp.toFixed(1)}ms] ${e.type}${e.component ? ` (${e.component})` : ''}: ${JSON.stringify(e.data)}`)
        .join('\n'),
    };
  }

  clear() {
    this.events = [];
    this.renderCounts = {};
    this.effectCounts = {};
    this.setterCalls = {};
  }

  exportToWindow() {
    (window as any).__diagnosticLogger = this;
  }
}

export const diagnosticLogger = new DiagnosticLogger();
diagnosticLogger.exportToWindow();

import type { ILogger } from '../../domain/ports/iLogger';

export class ConsoleLogger implements ILogger {
  info(message: string): void {
    console.log(message);
  }

  error(error: Error): void {
    console.error(`\x1b[31m❌ Error: ${error.message}\x1b[0m`);
    if (error.stack) {
      console.error(error.stack);
    }
  }

  table(entries: ReadonlyArray<{ label: string; value: string }>): void {
    const maxLabel = Math.max(...entries.map((e) => e.label.length));
    const maxValue = Math.max(...entries.map((e) => e.value.length));
    const tableWidth = maxLabel + maxValue + 6;
    const header = ' 📁 Deployment Info ';
    const padding = Math.max(0, tableWidth - header.length - 2);

    console.log(`\n╭─${header}${'─'.repeat(padding)}╮`);
    for (const { label, value } of entries) {
      console.log(`│ ${label.padEnd(maxLabel)} │ ${value.padEnd(maxValue)} │`);
    }
    console.log(`╰${'─'.repeat(maxLabel + 2)}┴${'─'.repeat(maxValue + 2)}╯\n`);
  }
}

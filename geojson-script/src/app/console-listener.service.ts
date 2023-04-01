import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { DataUtils } from './data-utils'

export enum ConsoleEventType {
  log = 'log',
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error'
}

export interface ConsoleEvent {
  type: string;
  value: any;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ConsoleListenerService {

  private consoleEvents$ = new Subject<ConsoleEvent>();

  initialize() {
    Object.keys(ConsoleEventType).forEach(consoleEventType => {

      // Override console outputs
      const originalOutput = (console as any)[consoleEventType];
      (console as any)[consoleEventType] = (...args: any[]) => {

        // Send to original console output
        originalOutput.apply(console, args);

        const argStrings: string[] = [];
        for (let outputValue of args) {

          // Display error details
          if (outputValue instanceof Error) {
            if (outputValue.stack) {
              argStrings.push(outputValue.stack)
            } else {
              argStrings.push(outputValue.message)
            }
          } else {

            // Display simple objects
            const outputString = typeof outputValue === 'object' ?
              JSON.stringify(
                outputValue,
                (outputValue instanceof Error) ? undefined : DataUtils.simpleObjectReplacerFn(),
                2
              ) :
              outputValue;
            argStrings.push(outputString);
          }
        }
        
        // Broadcast console message
        if (argStrings.length >= 1) {
          this.consoleEvents$.next({
            type: consoleEventType,
            value: argStrings.join(' '),
            date: new Date()
          });
        }

      }
    });
  }

  getConsoleEvents(): Observable<ConsoleEvent> {
    return this.consoleEvents$.asObservable();
  }

}

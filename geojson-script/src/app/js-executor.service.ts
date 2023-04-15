import { Injectable } from '@angular/core';

import { ConsoleListenerService } from './console-listener.service';
import { JsExecutorMessageType } from './js-executor-message';

@Injectable({
  providedIn: 'root'
})
export class JsExecutorService {

  _this: any = Object.create({});

  constructor(
    private consoleListenerService: ConsoleListenerService
  ) { }

  run(script: string): Promise<any> {
    return this.execute(script, this._this)
  }

  getThis(): any {
    return this._this;
  }

  /**
   * Execute the provided JavaScript code on a worker thread
   *
   * @param {*} sourceCode 
   * @param  {*} thisObject 
   */
  async execute(sourceCode: any, thisObject: any): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      if (typeof Worker !== 'undefined') {
        const worker = new Worker(new URL('./js-executor.worker', import.meta.url));
        worker.onmessage = ({ data }) => {
          const type = data.type;
          const content = data.content;
          if (type === JsExecutorMessageType.CONSOLE_EVENT) {
            this.consoleListenerService.postConsoleEvent(content);
          } else if (type === JsExecutorMessageType.RESULT) {
            resolve(content);
          } else if (type === JsExecutorMessageType.ERROR) {
            reject(content);
          } else {
            reject(`Unknown JS executor message type: ${type}`);
          }
        };
        worker.onerror = (error) => {
          reject(error);
        };
        const jsExecutorEvent = {
          sourceCode: sourceCode,
          thisObject: thisObject
        };
        worker.postMessage(jsExecutorEvent);
      } else {
        reject('Web workers are not supported in this environment.')
      }
    });
    return promise;
  }

}

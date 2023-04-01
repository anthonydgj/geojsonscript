import { Injectable } from '@angular/core';

declare var JsUtils: {
  AsyncFunction: any;
};

@Injectable({
  providedIn: 'root'
})
export class JsExecutorService {

  _this: any = Object.create({});

  run(script: string): Promise<any> {
    return this.execute(script, this._this)
  }

  getThis(): any {
    return this._this;
  }

  /**
   * Execute the provided JavaScript code.
   *
   * @param {*} sourceCode 
   * @param  {...any} args 
   */
  async execute(sourceCode: any, thisObject: any): Promise<any> {

    // Store list of variable names
    var variables = [];
    var identifiers = [];

    // Iterate through each variable
    for (let identifier in thisObject) {
      if (thisObject.hasOwnProperty(identifier)) {

        // Add identifier to list of variables
        identifiers.push(identifier);

        // Add variable to argument list
        variables.push(thisObject[identifier])
      }
    }

    // Create the executable script from the provided source code
    const strictSourceCode = `"use strict"; ${sourceCode}`
    const script = new JsUtils.AsyncFunction(...identifiers, strictSourceCode);

    // Execute the script and store the result
    const result = script.call(thisObject, ...variables);

    // Return the execution result
    return result;
  }

}

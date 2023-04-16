/// <reference lib="webworker" />

import { DataUtils } from "./data-utils";
import { JsExecutorMessageType } from "./js-executor-message";
import { getDefaultThisObjects } from "./this-object";

self.importScripts('assets/utils.js');

declare var JsUtils: {
	AsyncFunction: any;
};

addEventListener('message', ({ data }) => {
	runScript(data.thisObject, data.sourceCode);
});

async function runScript(thisObject: any, sourceCode: string) {

	// Add default 'this' properties
	thisObject = {
		...getDefaultThisObjects(),
		...thisObject
	};

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

	try {
		// Create the executable script from the provided source code
		const strictSourceCode = `"use strict"; ${sourceCode}`;
		const script = JsUtils.AsyncFunction(...identifiers, strictSourceCode);

		// Execute the script and store the result
		const result = await script.call(thisObject, ...variables);
		postMessage({
			type: JsExecutorMessageType.RESULT,
			content: result
		});
	} catch (err) {
		console.error(err);
		postMessage({
			type: JsExecutorMessageType.ERROR,
			content: err
		});
	}
}

// Register console event listeners
enum ConsoleEventType {
	log = 'log',
	trace = 'trace',
	debug = 'debug',
	info = 'info',
	warn = 'warn',
	error = 'error'
}
(function registerConsoleListeners() {
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
				const consoleEvent = {
					type: consoleEventType,
					value: argStrings.join(' '),
					date: new Date()
				};
				postMessage({
					type: JsExecutorMessageType.CONSOLE_EVENT,
					content: consoleEvent
				});
			}

		}
	});
})();

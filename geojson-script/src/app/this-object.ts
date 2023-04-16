import { Constants } from "./constants";

declare var JsUtils: {
	AsyncFunction: any;
};

export function getDefaultThisObjects() {
	const thisObject = Object.create({});
	thisObject[Constants.HELPER_NAME_IMPORT] = importHelper;
	return thisObject;
}

// Package import helper function
function importHelper(packageName: string, select = 'default', baseUrl = 'https://cdn.skypack.dev/'): Promise<any> {
	const returnStatement = `return ${select ? `result['${select}']` : `result`}`;
	const script = `
        const result = await import(\`${baseUrl}${packageName}\`);
        ${returnStatement};
    `;
	const importHelperFn = JsUtils.AsyncFunction(script);
	return importHelperFn.call();
}



var JsUtils = (function() { 
    return { 
        AsyncFunction: Object.getPrototypeOf(async function(){}).constructor
    } 
})(JsUtils||{})

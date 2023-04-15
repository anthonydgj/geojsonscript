export enum JsExecutorMessageType {
    CONSOLE_EVENT = 'CONSOLE_EVENT',
    RESULT = 'RESULT',
    ERROR = 'ERROR'
}

export interface JsExecutorMessage {
    type: JsExecutorMessageType;
    content: any;
}

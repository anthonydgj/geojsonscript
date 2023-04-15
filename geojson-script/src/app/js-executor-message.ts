export enum JsExecutorMessageType {
    CONSOLE_EVENT = 'CONSOLE_EVENT',
    RESULT = 'RESULT'
}

export interface JsExecutorMessage {
    type: JsExecutorMessageType;
    content: any;
}

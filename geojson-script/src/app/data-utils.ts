import * as FileSaver from 'file-saver';

export namespace DataUtils {

    const SIMPLE_OBJECT_CONSTRUCTOR_NAMES = ['Object', 'Array'];

    export const simpleObjectReplacerFn = () => {
        return (_: string, value: any) => {
            if (typeof value === "object" && value !== null) {
                const constructorName = value.constructor && value.constructor.name;
                if (!!constructorName && SIMPLE_OBJECT_CONSTRUCTOR_NAMES.indexOf(constructorName) === -1) {
                return `[object ${constructorName}]`;
                }
            }
          return value;
        };
    };

    export const getSimpleObjectString = (obj: any) => {
        return JSON.stringify(
            obj,
            simpleObjectReplacerFn(),
            2
        );
    }

    export const saveFile = (filename: string, content: string) => {
        var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, filename);    
    }
      
}
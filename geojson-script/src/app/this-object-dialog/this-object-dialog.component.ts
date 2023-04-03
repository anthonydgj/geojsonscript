import { Component } from '@angular/core';

import { CodeViewerOptions } from '../code-viewer/code-viewer.component';
import { DataUtils } from '../data-utils';
import { JsExecutorService } from '../js-executor.service';

@Component({
  selector: 'app-this-object-dialog',
  templateUrl: './this-object-dialog.component.html',
  styleUrls: ['./this-object-dialog.component.scss']
})
export class ThisObjectDialogComponent {

  options: CodeViewerOptions;

  constructor(jsExecutorService: JsExecutorService) {
    const thisObject = jsExecutorService.getThis();
    const thisObjectConstructors: { [name: string]: string } = {};
    for (const prop of Object.keys(thisObject)) {
      if (thisObject.hasOwnProperty(prop)) {
        const constructorName = DataUtils.getConstructorName(thisObject[prop]);
        thisObjectConstructors[prop] = constructorName || 'Object';
      }
    }

    const formattedData = JSON.stringify(thisObjectConstructors, null, 2);
    this.options = {
      initialValue: formattedData,
      collapsed: true,
      monacoEditorOptions: {
        language: 'json',
        automaticLayout: true,
        readOnly: true
      }
    }
  }

}

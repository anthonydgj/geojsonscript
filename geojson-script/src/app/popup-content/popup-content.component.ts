import { Component, Input, OnInit } from '@angular/core';

import { CodeViewerOptions } from '../code-viewer/code-viewer.component';
import { DataUtils } from '../data-utils';

@Component({
  selector: 'app-popup-content',
  templateUrl: './popup-content.component.html',
  styleUrls: ['./popup-content.component.scss']
})
export class PopupContentComponent implements OnInit {

  @Input() layerName?: string;
  @Input() data: any;

  options: CodeViewerOptions = {};

  ngOnInit() {
    const formattedData = DataUtils.getSimpleObjectString(this.data)
    this.options = {
      initialValue: formattedData,
      monacoEditorOptions: {
        language: 'json',
        automaticLayout: true,
        readOnly: true,
        minimap: {
          enabled: true,
          autohide: false
        }
      }
    }
  }

}

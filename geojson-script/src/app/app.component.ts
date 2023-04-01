import { Component } from '@angular/core';
import { ConsoleListenerService } from './console-listener.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'geojson-script';

  constructor(
    private consoleListenerService: ConsoleListenerService
  ) { }

  ngOnInit(): void {
    this.consoleListenerService.initialize();
  }
}

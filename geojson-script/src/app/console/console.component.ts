import { AfterContentInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription, tap } from 'rxjs';

import { ConsoleEvent, ConsoleListenerService } from '../console-listener.service';
import { UserEvent, UserEventService } from '../user-event.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements AfterContentInit, OnDestroy {

  @ViewChild('consoleLogs', { static: false }) consoleLogs?: ElementRef;

  readonly DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SS'

  consoleEvents: ConsoleEvent[] = [];
  consoleEventSubscription?: Subscription;
  userEventSubscription?: Subscription;

  constructor(
    private consoleListenerService: ConsoleListenerService,
    private userEventService: UserEventService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngAfterContentInit() {
    this.consoleEventSubscription = this.consoleListenerService.getConsoleEvents().pipe(
      tap(consoleEvent => {
        this.consoleEvents.push(consoleEvent);
        this.changeDetectorRef.detectChanges();
      }),
      tap(() => {
        this.changeDetectorRef.detectChanges();
        if (this.consoleLogs?.nativeElement?.scrollTop !== undefined) {
          this.consoleLogs.nativeElement.scrollTop =
            this.consoleLogs.nativeElement.scrollHeight;
          this.changeDetectorRef.detectChanges();
        }
      })
    ).subscribe();

    this.userEventSubscription = this.userEventService.getEvents().subscribe(event => {
      if (event === UserEvent.CLEAR_CONSOLE_OUTPUT) {
        this.consoleEvents.length = 0;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.consoleEventSubscription) {
      this.consoleEventSubscription.unsubscribe();
    }
    if (this.consoleEventSubscription) {
      this.consoleEventSubscription.unsubscribe();
    }
  }
}

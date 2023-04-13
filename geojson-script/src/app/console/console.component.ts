import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { debounceTime, Subject, Subscription, tap } from 'rxjs';

import { ConsoleEvent, ConsoleListenerService } from '../console-listener.service';
import { UserEvent, UserEventService } from '../user-event.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConsoleComponent implements AfterContentInit, OnDestroy {

  @ViewChild('consoleLogs', { static: false }) consoleLogs?: ElementRef;

  readonly DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss.SS'
  readonly UI_UPDATE_DEBOUNCE_TIME_MILLIS = 500;

  consoleEvents: ConsoleEvent[] = [];
  consoleEventSubscription?: Subscription;
  userEventSubscription?: Subscription;
  updateSubject = new Subject();
  updateSubscription?: Subscription;

  constructor(
    private consoleListenerService: ConsoleListenerService,
    private userEventService: UserEventService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.updateSubscription = this.updateSubject.pipe(
      debounceTime(this.UI_UPDATE_DEBOUNCE_TIME_MILLIS),
      tap(() => this.changeDetectorRef.detectChanges())
    ).subscribe();
  }

  ngAfterContentInit() {
    this.consoleEventSubscription = this.consoleListenerService.getConsoleEvents().pipe(
      tap(consoleEvent => {
        this.consoleEvents.push(consoleEvent);
        this.changeDetectorRef.detectChanges();
      }),
      tap(() => {
        if (this.consoleLogs?.nativeElement?.scrollTop !== undefined) {
          this.consoleLogs.nativeElement.scrollTop =
            this.consoleLogs.nativeElement.scrollHeight;
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
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }
}

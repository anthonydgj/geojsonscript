import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThisObjectDialogComponent } from './this-object-dialog.component';

describe('ThisObjectDialogComponent', () => {
  let component: ThisObjectDialogComponent;
  let fixture: ComponentFixture<ThisObjectDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThisObjectDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThisObjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

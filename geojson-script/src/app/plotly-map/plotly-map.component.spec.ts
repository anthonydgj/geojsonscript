import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotlyMapComponent } from './plotly-map.component';

describe('PlotlyMapComponent', () => {
  let component: PlotlyMapComponent;
  let fixture: ComponentFixture<PlotlyMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlotlyMapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlotlyMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

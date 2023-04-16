import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataLayerDialogComponent } from './data-layer-dialog.component';

describe('DataLayerDialogComponent', () => {
	let component: DataLayerDialogComponent;
	let fixture: ComponentFixture<DataLayerDialogComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [DataLayerDialogComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(DataLayerDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

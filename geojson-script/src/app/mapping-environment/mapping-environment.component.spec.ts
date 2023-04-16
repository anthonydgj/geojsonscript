import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingEnvironmentComponent } from './mapping-environment.component';

describe('MappingEnvironmentComponent', () => {
	let component: MappingEnvironmentComponent;
	let fixture: ComponentFixture<MappingEnvironmentComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MappingEnvironmentComponent]
		})
			.compileComponents();

		fixture = TestBed.createComponent(MappingEnvironmentComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

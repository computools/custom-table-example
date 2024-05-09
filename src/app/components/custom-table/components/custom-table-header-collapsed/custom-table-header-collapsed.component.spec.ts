import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTableHeaderCollapsedComponent } from 'app/components/custom-table/components/custom-table-header-collapsed/custom-table-header-collapsed.component';

describe('DynamicTableHeaderCollapsedComponent', () => {
  let component: CustomTableHeaderCollapsedComponent;
  let fixture: ComponentFixture<CustomTableHeaderCollapsedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomTableHeaderCollapsedComponent],
    });
    fixture = TestBed.createComponent(CustomTableHeaderCollapsedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

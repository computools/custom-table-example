import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseTableComponent } from '@app/components/base-table/base-table.component';

describe('TableComponent', () => {
  let component: BaseTableComponent;
  let fixture: ComponentFixture<BaseTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

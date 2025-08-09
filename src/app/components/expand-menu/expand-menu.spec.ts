import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandMenu } from './expand-menu';

describe('ExpandMenu', () => {
  let component: ExpandMenu;
  let fixture: ComponentFixture<ExpandMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpandMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

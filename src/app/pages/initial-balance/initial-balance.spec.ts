import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialBalance } from './initial-balance';

describe('InitialBalance', () => {
  let component: InitialBalance;
  let fixture: ComponentFixture<InitialBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialBalance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialBalance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

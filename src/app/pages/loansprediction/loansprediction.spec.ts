import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loansprediction } from './loansprediction';

describe('Loansprediction', () => {
  let component: Loansprediction;
  let fixture: ComponentFixture<Loansprediction>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loansprediction]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loansprediction);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

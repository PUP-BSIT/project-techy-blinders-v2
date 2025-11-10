import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFlashCard } from './add-flash-card';

describe('AddFlashCard', () => {
  let component: AddFlashCard;
  let fixture: ComponentFixture<AddFlashCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFlashCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFlashCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

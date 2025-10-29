import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudySetsPage } from './study-sets-page';

describe('StudySetsPage', () => {
  let component: StudySetsPage;
  let fixture: ComponentFixture<StudySetsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudySetsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudySetsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { OpenStudySet } from './open-study-set';

describe('OpenStudySet', () => {
  let component: OpenStudySet;
  let fixture: ComponentFixture<OpenStudySet>;

  beforeEach(async () => {
    const mockActivatedRoute = {
      params: of({ id: '1' }),
      paramMap: of(convertToParamMap({ id: '1' })),
      snapshot: { paramMap: convertToParamMap({ id: '1' }) }
    };
    await TestBed.configureTestingModule({
      imports: [OpenStudySet, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenStudySet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
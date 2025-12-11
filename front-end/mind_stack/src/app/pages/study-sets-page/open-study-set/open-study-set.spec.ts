import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { OpenStudySet } from './open-study-set';
import { StudySetsService } from '../../../../service/study-sets.service';

describe('OpenStudySet', () => {
  let component: OpenStudySet;
  let fixture: ComponentFixture<OpenStudySet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OpenStudySet,          // Your standalone component
        RouterTestingModule,   // Router needed by the component
        HttpClientTestingModule // <-- FIX: provides HttpClient
      ],
      providers: [
        StudySetsService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OpenStudySet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

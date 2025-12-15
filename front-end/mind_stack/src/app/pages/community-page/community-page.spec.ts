import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CommunityPage } from './community-page';

describe('CommunityPage', () => {
  let component: CommunityPage;
  let fixture: ComponentFixture<CommunityPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, CommunityPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

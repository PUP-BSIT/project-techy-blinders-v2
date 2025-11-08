import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfilePage } from './edit-profile-page';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditProfilePage', () => {
  let component: EditProfilePage;
  let fixture: ComponentFixture<EditProfilePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditProfilePage,
        RouterTestingModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

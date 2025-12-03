import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { LoginPage } from './login-page';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../../../service/auth.service';
import { of } from 'rxjs';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  // Mock AuthService
  const mockAuthService = {
    login: jasmine.createSpy('login').and.returnValue(of({ token: '123' }))
  };

  // Mock ActivatedRoute (queryParams observable)
  const mockActivatedRoute = {
    queryParams: of({})
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        LoginPage
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
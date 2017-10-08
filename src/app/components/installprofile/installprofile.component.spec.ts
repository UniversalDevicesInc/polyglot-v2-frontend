import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallprofileComponent } from './installprofile.component';

describe('InstallprofileComponent', () => {
  let component: InstallprofileComponent;
  let fixture: ComponentFixture<InstallprofileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstallprofileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NscontrolComponent } from './nscontrol.component';

describe('NscontrolComponent', () => {
  let component: NscontrolComponent;
  let fixture: ComponentFixture<NscontrolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NscontrolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NscontrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NslogComponent } from './nslog.component';

describe('NslogComponent', () => {
  let component: NslogComponent;
  let fixture: ComponentFixture<NslogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NslogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NslogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});

import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, FormBuilder, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-datos-persona',
  templateUrl: './datos-persona.component.html',
  styleUrls: ['./datos-persona.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosPersonaComponent implements OnInit {


  constructor() {
  }

  ngOnInit(): void {
  }

}

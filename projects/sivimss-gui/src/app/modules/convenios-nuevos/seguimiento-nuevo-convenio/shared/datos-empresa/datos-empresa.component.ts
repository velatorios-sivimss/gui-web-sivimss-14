import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-datos-empresa',
  templateUrl: './datos-empresa.component.html',
  styleUrls: ['./datos-empresa.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosEmpresaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

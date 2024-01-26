import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-datos-titular-beneficiario',
  templateUrl: './datos-titular-beneficiario.component.html',
  styleUrls: ['./datos-titular-beneficiario.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosTitularBeneficiarioComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

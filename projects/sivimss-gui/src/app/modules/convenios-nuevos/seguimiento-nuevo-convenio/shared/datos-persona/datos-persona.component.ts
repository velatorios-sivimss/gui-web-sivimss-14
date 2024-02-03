import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";

@Component({
  selector: 'app-datos-persona',
  templateUrl: './datos-persona.component.html',
  styleUrls: ['./datos-persona.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, UtileriaModule, CommonModule, CalendarModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosPersonaComponent implements OnInit {

  parentContainer: ControlContainer = inject(ControlContainer)

  constructor() {
  }

  ngOnInit(): void {
  }

  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

}

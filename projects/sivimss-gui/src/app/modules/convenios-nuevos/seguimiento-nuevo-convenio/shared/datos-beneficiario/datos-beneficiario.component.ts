import {Component, inject, Input, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {delay} from "rxjs/operators";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";

@Component({
  selector: 'app-datos-beneficiario',
  templateUrl: './datos-beneficiario.component.html',
  styleUrls: ['./datos-beneficiario.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, UtileriaModule, CommonModule, CalendarModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosBeneficiarioComponent implements OnInit {

  parentContainer: ControlContainer = inject(ControlContainer);
  @Input() ID: string = '';

  constructor(private alertaService: AlertaService,
              private cargadorService: LoaderService) {
  }

  ngOnInit(): void {
  }

  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

  validarCurp(): void {
    this.cargadorService.activar();
    delay(3000)
    this.cargadorService.desactivar();
    this.alertaService.mostrar(TipoAlerta.Error, 'Error al consultar la información. Intenta nuevamente.');
  }

  validarRfc(): void {
    this.cargadorService.activar();
    delay(3000)
    this.cargadorService.desactivar();
    this.alertaService.mostrar(TipoAlerta.Error, 'Error al consultar la información. Intenta nuevamente.');
  }
}

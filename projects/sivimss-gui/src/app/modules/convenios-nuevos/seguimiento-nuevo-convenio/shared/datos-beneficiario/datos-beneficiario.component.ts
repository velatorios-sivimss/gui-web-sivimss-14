import {Component, inject, Input, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {delay} from "rxjs/operators";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {PATRON_RFC} from "../../../../../utils/constantes";
import {ActivatedRoute} from "@angular/router";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";

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
  parentesco: TipoDropdown[] = [];

  constructor(private alertaService: AlertaService,
              private cargadorService: LoaderService,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    const POSICION_PARENTESCO: number = 2;
    const parentesco = respuesta[POSICION_PARENTESCO].datos;
    this.parentesco = mapearArregloTipoDropdown(parentesco, 'nombreParentesco', 'idParentesco');
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
    const rfc = this.parentContainer.control?.get('rfc')?.value;
    if (!rfc) return;
    this.parentContainer.control?.get('rfc')?.clearValidators();
    this.parentContainer.control?.get('rfc')?.updateValueAndValidity();
    if (rfc.includes('XAXX010101000')) return;
    if (!rfc.match(PATRON_RFC)) {
      this.parentContainer.control?.get('rfc')?.setValidators(Validators.pattern(PATRON_RFC));
      this.parentContainer.control?.get('rfc')?.updateValueAndValidity();
    }
  }
}

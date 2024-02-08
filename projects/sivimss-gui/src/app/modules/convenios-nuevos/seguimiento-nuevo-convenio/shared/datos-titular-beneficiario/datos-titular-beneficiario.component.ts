import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {AutenticacionService} from "../../../../../services/autenticacion.service";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CATALOGO_NACIONALIDAD} from "../../../../contratantes/constants/catalogos-complementarios";
import {CATALOGO_SEXO} from "../../../../consulta-donaciones/constants/catalogo";
import {CATALOGO_NUMERO_PAGOS} from "../../constants/catalogos";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";

@Component({
  selector: 'app-datos-titular-beneficiario',
  templateUrl: './datos-titular-beneficiario.component.html',
  styleUrls: ['./datos-titular-beneficiario.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, UtileriaModule, CommonModule, CalendarModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosTitularBeneficiarioComponent implements OnInit {

  parentContainer: ControlContainer =  inject(ControlContainer)

  paises: TipoDropdown[] = [];
  numeroPagos: TipoDropdown[] = CATALOGO_NUMERO_PAGOS;
  tipoSexo: TipoDropdown[] = CATALOGO_SEXO;
  nacionalidad: TipoDropdown[] = CATALOGO_NACIONALIDAD;
  fechaActual: Date = new Date();

  constructor(private autenticacionService: AutenticacionService) {
    this.cargarCatalogosLocalStorage();
  }

  ngOnInit(): void {
  }

  cargarCatalogosLocalStorage(): void {
    const catalogoPais = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_pais');
    this.paises = mapearArregloTipoDropdown(catalogoPais, 'desc', 'id');
  }

  validarCurp($event: any): void {

  }

  validarRfc($event: any): void {

  }

  cambioTipoSexo($event: any): void {

  }

  cambioNacionalidad($event: any): void {

  }

  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

}
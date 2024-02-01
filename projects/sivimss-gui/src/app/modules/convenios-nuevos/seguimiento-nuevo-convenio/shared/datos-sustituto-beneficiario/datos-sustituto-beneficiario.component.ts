import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {CATALOGO_NUMERO_PAGOS} from "../../constants/catalogos";
import {CATALOGO_SEXO} from "../../../../consulta-donaciones/constants/catalogo";
import {CATALOGO_NACIONALIDAD} from "../../../../contratantes/constants/catalogos-complementarios";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {AutenticacionService} from "../../../../../services/autenticacion.service";

@Component({
  selector: 'app-datos-sustituto-beneficiario',
  templateUrl: './datos-sustituto-beneficiario.component.html',
  styleUrls: ['./datos-sustituto-beneficiario.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, UtileriaModule, CommonModule, CalendarModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosSustitutoBeneficiarioComponent implements OnInit {

  parentContainer: ControlContainer =  inject(ControlContainer)

  paises: TipoDropdown[] = [];
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

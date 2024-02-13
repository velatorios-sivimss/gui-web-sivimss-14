import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
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

  parentContainer: ControlContainer = inject(ControlContainer)

  paises: TipoDropdown[] = [];
  estados: TipoDropdown[] = [];
  paquetes: TipoDropdown[] = [];
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
    const catalogoEstado = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_estados');
    this.estados = mapearArregloTipoDropdown(catalogoEstado, 'desc', 'id');
  }

  validarCurp($event: any): void {

  }

  validarRfc($event: any): void {

  }

  cambioTipoSexo(): void {
    const idSexo = this.parentContainer.control?.get('sexo')?.value;
    this.parentContainer.control?.get('otroSexo')?.setValue(null);
    if (idSexo === 3) {
      this.parentContainer.control?.get('otroSexo')?.setValidators([Validators.required]);
    } else {
      this.parentContainer.control?.get('otroSexo')?.clearValidators();
    }
  }

  cambioNacionalidad(): void {
    const nacionalidad = this.parentContainer.control?.get('nacionalidad')?.value;
    this.parentContainer.control?.get('paisNacimiento')?.setValue(null);
    this.parentContainer.control?.get('lugarNacimiento')?.setValue(null);
    if (nacionalidad === 1) {
      this.parentContainer.control?.get('lugarNacimiento')?.setValidators([Validators.required]);
      this.parentContainer.control?.get('paisNacimiento')?.clearValidators();
    } else {
      this.parentContainer.control?.get('paisNacimiento')?.setValidators([Validators.required]);
      this.parentContainer.control?.get('lugarNacimiento')?.clearValidators();
    }
  }

  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

}

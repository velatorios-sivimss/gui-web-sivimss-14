import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {AutenticacionService} from "../../../../../services/autenticacion.service";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";

@Component({
  selector: 'app-datos-empresa',
  templateUrl: './datos-empresa.component.html',
  styleUrls: ['./datos-empresa.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, UtileriaModule, CommonModule, CalendarModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosEmpresaComponent implements OnInit {

  paises: TipoDropdown[] = [];

  parentContainer: ControlContainer = inject(ControlContainer)

  constructor(private autenticacionService: AutenticacionService) {
    this.cargarCatalogosLocalStorage();
  }

  cargarCatalogosLocalStorage(): void {
    const catalogoPais = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_pais');
    this.paises = mapearArregloTipoDropdown(catalogoPais, 'desc', 'id');
  }

  ngOnInit(): void {
  }

  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

}

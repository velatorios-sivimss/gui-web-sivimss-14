import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, ReactiveFormsModule} from "@angular/forms";
import {ESTATUS_ROL} from "../../../../roles/constants/estatus";
import {DropdownModule} from "primeng/dropdown";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {AutenticacionService} from "../../../../../services/autenticacion.service";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";

@Component({
  selector: 'app-datos-titular-beneficiario',
  templateUrl: './datos-titular-beneficiario.component.html',
  styleUrls: ['./datos-titular-beneficiario.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosTitularBeneficiarioComponent implements OnInit {

  paises: TipoDropdown[] = [];

  constructor(private autenticacionService: AutenticacionService) {
    this.cargarCatalogosLocalStorage();
  }

  ngOnInit(): void {
  }

  cargarCatalogosLocalStorage(): void {
    const catalogoPais = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_pais');
    this.paises = mapearArregloTipoDropdown(catalogoPais, 'desc', 'id');
  }

  protected readonly estatus = ESTATUS_ROL;
}

import {Component, inject, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {diferenciaUTC, mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {AutenticacionService} from "../../../../../services/autenticacion.service";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CATALOGO_NACIONALIDAD} from "../../../../contratantes/constants/catalogos-complementarios";
import {CATALOGO_SEXO} from "../../../../consulta-donaciones/constants/catalogo";
import {CATALOGO_NUMERO_PAGOS} from "../../constants/catalogos";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {ActivatedRoute} from "@angular/router";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";

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
  colonias: TipoDropdown[] = [];
  numeroPagos: TipoDropdown[] = CATALOGO_NUMERO_PAGOS;
  tipoSexo: TipoDropdown[] = CATALOGO_SEXO;
  nacionalidad: TipoDropdown[] = CATALOGO_NACIONALIDAD;
  fechaActual: Date = new Date();

  constructor(private autenticacionService: AutenticacionService,
              private activatedRoute: ActivatedRoute,
              private cargadorService: LoaderService,
              private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService,
              private mensajesSistemaService: MensajesSistemaService,
              private alertaService: AlertaService,
  ) {
    this.cargarCatalogosLocalStorage();
  }

  ngOnInit(): void {
    this.cargarCP(true);
    this.cargarValidacionesIniciales();
  }

  cargarValidacionesIniciales(): void {
    const idSexo = this.parentContainer.control?.get('sexo')?.value;
    const nacionalidad = this.parentContainer.control?.get('nacionalidad')?.value;
    if (idSexo === 3) {
      this.parentContainer.control?.get('otroSexo')?.setValidators([Validators.required]);
    }
    if (nacionalidad === 1) {
      this.parentContainer.control?.get('lugarNacimiento')?.setValidators([Validators.required]);
    } else {
      this.parentContainer.control?.get('paisNacimiento')?.setValidators([Validators.required]);
    }
  }

  cargarCatalogosLocalStorage(): void {
    const catalogoPais = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_pais');
    this.paises = mapearArregloTipoDropdown(catalogoPais, 'desc', 'id');
    const catalogoEstado = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_estados');
    this.estados = mapearArregloTipoDropdown(catalogoEstado, 'desc', 'id');
    const POSICION_PAQUETES: number = 1;
    const respuesta = this.activatedRoute.snapshot.data["respuesta"];
    const paquetes = respuesta[POSICION_PAQUETES].datos;
    this.paquetes = mapearArregloTipoDropdown(paquetes, 'nombrePaquete', 'idPaquete');
  }

  validarCurp(): void {

  }

  validarRfc(): void {

  }

  validarMatricula(): void {

  }

  validarNSS(): void {
    const nss = this.parentContainer.control?.get('nss')?.value;
    if (nss === '' || !nss) return;
    this.cargadorService.activar();
    this.seguimientoNuevoConvenioService.consultarNSS(nss).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (response: HttpRespuesta<any>): void => this.procesarRespuestaNSS(response),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error),
    })
  }

  procesarRespuestaNSS(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos) {
      this.alertaService.mostrar(TipoAlerta.Precaucion, "El Número de Seguridad Social no existe.");
      this.parentContainer.control?.get('nss')?.setValue(null);
      return;
    }
    let fecha: Date | null = null;
    if (respuesta.datos.fechaNacimiento) {
      fecha = new Date(diferenciaUTC(respuesta.datos.fechaNacimiento));
    }
    let sexo: number = respuesta.datos.sexo?.idSexo == 1 ? 2 : 1;
    this.parentContainer.control?.get('curp')?.setValue(respuesta.datos.curp);
    this.parentContainer.control?.get('rfc')?.setValue(respuesta.datos.rfc);
    this.parentContainer.control?.get('nombre')?.setValue(respuesta.datos.nombre);
    this.parentContainer.control?.get('primerApellido')?.setValue(respuesta.datos.primerApellido);
    this.parentContainer.control?.get('segundoApellido')?.setValue(respuesta.datos.segundoApellido);
    this.parentContainer.control?.get('sexo')?.setValue(sexo);
    this.parentContainer.control?.get('sexo')?.setValue(sexo);
    this.parentContainer.control?.get('otroSexo')?.setValue(null);
    this.parentContainer.control?.get('fechaNacimiento')?.setValue(fecha);
    this.parentContainer.control?.get('nacionalidad')?.setValue(1);
  }

  cargarCP(cargaInicial: boolean = false): void {
    const cp = this.parentContainer.control?.get('cp')?.value;
    if (cp.length < 5) return;
    if (!cargaInicial) {
      this.cargadorService.activar();
      this.parentContainer.control?.get('colonia')?.setValue(null);
    }
    this.seguimientoNuevoConvenioService.consutaCP(cp).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (response: HttpRespuesta<any>): void => this.procesarRespuestaCP(response),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error),
    })
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  procesarRespuestaCP(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos) {
      this.respuestaSinDatosCP();
      return;
    }
    this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre');
    const [colonia] = respuesta.datos;
    this.parentContainer.control?.get('municipio')?.setValue(colonia.municipio.nombre);
    this.parentContainer.control?.get('estado')?.setValue(colonia.municipio.entidadFederativa.nombre);
  }

  respuestaSinDatosCP(): void {
    this.alertaService.mostrar(TipoAlerta.Precaucion, "El CP no existe.");
    this.colonias = [];
    this.parentContainer.control?.get('municipio')?.setValue(null);
    this.parentContainer.control?.get('estado')?.setValue(null);
    this.parentContainer.control?.get('colonia')?.setValue(null);
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

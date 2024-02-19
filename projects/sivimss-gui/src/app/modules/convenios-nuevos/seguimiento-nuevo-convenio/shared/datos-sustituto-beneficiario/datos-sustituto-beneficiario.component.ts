import {Component, inject, Input, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {CATALOGO_SEXO} from "../../../../consulta-donaciones/constants/catalogo";
import {CATALOGO_NACIONALIDAD} from "../../../../contratantes/constants/catalogos-complementarios";
import {diferenciaUTC, mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {AutenticacionService} from "../../../../../services/autenticacion.service";
import {delay, finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {PATRON_RFC} from "../../../../../utils/constantes";

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

  parentContainer: ControlContainer = inject(ControlContainer)

  paises: TipoDropdown[] = [];
  estados: TipoDropdown[] = [];
  colonias: TipoDropdown[] = [];
  tipoSexo: TipoDropdown[] = CATALOGO_SEXO;
  nacionalidad: TipoDropdown[] = CATALOGO_NACIONALIDAD;
  fechaActual: Date = new Date();
  @Input() tipo: 'sustituto' | 'beneficiario' = 'sustituto';
  @Input() ID: string = 'sustituto';

  constructor(private autenticacionService: AutenticacionService,
              private cargadorService: LoaderService,
              private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService,
              private mensajesSistemaService: MensajesSistemaService,
              private alertaService: AlertaService,) {
    this.cargarCatalogosLocalStorage();
  }

  ngOnInit(): void {
    this.cargaCPSust(true);
    this.cargarValidacionesIniciales();
  }

  cargarValidacionesIniciales(): void {
    const idSexoSust = this.parentContainer.control?.get('sexo')?.value;
    const nacionalidad = this.parentContainer.control?.get('nacionalidad')?.value;
    if (idSexoSust === 3) {
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
  }


  validarCurp(): void {
    this.cargadorService.activar();
    delay(3000)
    this.cargadorService.desactivar();
    this.alertaService.mostrar(TipoAlerta.Error, 'Error al consultar la información. Intenta nuevamente.');
  }

  validarRfc(): void {
    if (this.tipo === 'beneficiario') {
      this.validarRfcBeneficiario();
      return;
    }
    const rfc = this.parentContainer.control?.get('rfc')?.value;
    if (!rfc) return;
    if (!rfc.match(PATRON_RFC)) {
      this.parentContainer.control?.get('rfc')?.setValidators(Validators.pattern(PATRON_RFC));
      this.parentContainer.control?.get('rfc')?.updateValueAndValidity();
    }
  }

  validarRfcBeneficiario(): void {
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

  cambioTipoSexo(): void {
    const idSexoSust = this.parentContainer.control?.get('sexo')?.value;
    this.parentContainer.control?.get('otroSexo')?.setValue(null);
    if (idSexoSust === 3) {
      this.parentContainer.control?.get('otroSexo')?.setValidators([Validators.required]);
    } else {
      this.parentContainer.control?.get('otroSexo')?.clearValidators();
    }
  }

  cambioNacionalidad(): void {
    const nacionalidadSust = this.parentContainer.control?.get('nacionalidad')?.value;
    this.parentContainer.control?.get('paisNacimiento')?.setValue(null);
    this.parentContainer.control?.get('lugarNacimiento')?.setValue(null);
    if (nacionalidadSust === 1) {
      this.parentContainer.control?.get('lugarNacimiento')?.setValidators([Validators.required]);
      this.parentContainer.control?.get('paisNacimiento')?.clearValidators();
    } else {
      this.parentContainer.control?.get('paisNacimiento')?.setValidators([Validators.required]);
      this.parentContainer.control?.get('lugarNacimiento')?.clearValidators();
    }
  }

  validarMatricula(): void {
    const matricula = this.parentContainer.control?.get('matricula')?.value;
    if (matricula === '' || !matricula) return;
    this.cargadorService.activar();
    this.seguimientoNuevoConvenioService.consultarMatriculaSiap(matricula).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (response: HttpRespuesta<any>): void => this.procesarRespuestaMatricula(response),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error),
    });
  }

  procesarRespuestaMatricula(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos) {
      this.parentContainer.control?.get('matricula')?.setValue(null);
      this.alertaService.mostrar(TipoAlerta.Precaucion, 'La matrícula es incorrecta.');
    }
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
    this.parentContainer.control?.get('otroSexo')?.setValue(null);
    this.parentContainer.control?.get('otroSexo')?.clearValidators();
    this.parentContainer.control?.get('fechaNacimiento')?.setValue(fecha);
    this.parentContainer.control?.get('nacionalidad')?.setValue(1);
    this.parentContainer.control?.get('paisNacimiento')?.setValue(null);
    this.parentContainer.control?.get('lugarNacimiento')?.setValue(null);
    this.parentContainer.control?.get('lugarNacimiento')?.setValidators([Validators.required]);
    this.parentContainer.control?.get('paisNacimiento')?.clearValidators();
  }

  cargaCPSust(cargaInicial: boolean = false): void {
    const cpSust = this.parentContainer.control?.get('cp')?.value;
    if (cpSust.length < 5) return;
    if (!cargaInicial) {
      this.cargadorService.activar();
      this.parentContainer.control?.get('colonia')?.setValue(null);
    }
    this.seguimientoNuevoConvenioService.consutaCP(cpSust).pipe(
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
      this.respuestaSinDatosCPSust();
      return;
    }
    this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre');
    const [colonia] = respuesta.datos;
    this.parentContainer.control?.get('municipio')?.setValue(colonia.municipio.nombre);
    this.parentContainer.control?.get('estado')?.setValue(colonia.municipio.entidadFederativa.nombre);
  }

  respuestaSinDatosCPSust(): void {
    this.alertaService.mostrar(TipoAlerta.Precaucion, "El CP no existe.");
    this.colonias = [];
    this.parentContainer.control?.get('municipio')?.setValue(null);
    this.parentContainer.control?.get('estado')?.setValue(null);
    this.parentContainer.control?.get('colonia')?.setValue(null);
  }


  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

}

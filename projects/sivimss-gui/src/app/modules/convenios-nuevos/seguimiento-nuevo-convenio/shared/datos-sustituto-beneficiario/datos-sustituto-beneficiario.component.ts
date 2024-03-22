import {Component, inject, Input, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {CATALOGO_SEXO} from "../../../../consulta-donaciones/constants/catalogo";
import {CATALOGO_NACIONALIDAD} from "../../../../contratantes/constants/catalogos-complementarios";
import {diferenciaUTC, mapearArregloTipoDropdown, validarUsuarioLogueado} from "../../../../../utils/funciones";
import {AutenticacionService} from "../../../../../services/autenticacion.service";
import {finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {PATRON_CURP, PATRON_RFC} from "../../../../../utils/constantes";
import * as moment from "moment/moment";

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
    const nacionalidad = this.parentContainer.control?.get('nacionalidad')?.value;
    if (nacionalidad === 1) {
      this.parentContainer.control?.get('lugarNacimiento')?.setValidators([Validators.required]);
    }
    const curpBen = this.parentContainer.control?.get('curp')?.value;
    if (curpBen) {
      this.parentContainer.control?.get('nombre')?.disable();
      this.parentContainer.control?.get('primerApellido')?.disable();
      this.parentContainer.control?.get('segundoApellido')?.disable();
      this.parentContainer.control?.get('sexo')?.disable();
      this.parentContainer.control?.get('otroSexo')?.disable();
      this.parentContainer.control?.get('fechaNacimiento')?.disable();
      this.parentContainer.control?.get('nacionalidad')?.disable();
      this.parentContainer.control?.get('paisNacimiento')?.disable();
      this.parentContainer.control?.get('lugarNacimiento')?.disable();
    }
  }

  cargarCatalogosLocalStorage(): void {
    const catalogoPais = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_pais');
    this.paises = mapearArregloTipoDropdown(catalogoPais, 'desc', 'id');
    const catalogoEstado = this.autenticacionService.obtenerCatalogoDeLocalStorage('catalogo_estados');
    this.estados = mapearArregloTipoDropdown(catalogoEstado, 'desc', 'id');
  }

  validarCurp(): void {
    const curp = this.parentContainer.control?.get('curp')?.value;
    if (!curp) {
      this.limpiarDatosCURP();
      return;
    }
    if (!curp.match(PATRON_CURP)) {
      this.alertaService.mostrar(TipoAlerta.Error, 'CURP no valido.');
      return;
    }
    if (curp.includes('XEXX010101HNEXXXA4')) return;
    if (curp.includes('XEXX010101MNEXXXA8')) return;
    this.cargadorService.activar();
    const parametros = {curp, rfc: null};
    this.seguimientoNuevoConvenioService.buscarCurpRFC(parametros)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => this.procesarRespuestaCURP(respuesta),
        error: (error: HttpErrorResponse) => this.manejarMensajeError(error),
      });
  }

  limpiarDatosCURP(): void {
    this.parentContainer.control?.get('nombre')?.enable();
    this.parentContainer.control?.get('primerApellido')?.enable();
    this.parentContainer.control?.get('segundoApellido')?.enable();
    this.parentContainer.control?.get('sexo')?.enable();
    this.parentContainer.control?.get('otroSexo')?.enable();
    this.parentContainer.control?.get('fechaNacimiento')?.enable();
    this.parentContainer.control?.get('nacionalidad')?.enable();
    this.parentContainer.control?.get('paisNacimiento')?.enable();
    this.parentContainer.control?.get('lugarNacimiento')?.enable();
    this.parentContainer.control?.get('nombre')?.setValue(null);
    this.parentContainer.control?.get('primerApellido')?.setValue(null);
    this.parentContainer.control?.get('segundoApellido')?.setValue(null);
    this.parentContainer.control?.get('sexo')?.setValue(null);
    this.parentContainer.control?.get('otroSexo')?.setValue(null);
    this.parentContainer.control?.get('fechaNacimiento')?.setValue(null);
    this.parentContainer.control?.get('nacionalidad')?.setValue(null);
    this.parentContainer.control?.get('paisNacimiento')?.setValue(null);
    this.parentContainer.control?.get('lugarNacimiento')?.setValue(null);
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

  cambioTipoSexo(): void {
    this.parentContainer.control?.get('otroSexo')?.setValue(null);
  }

  validarRfcBeneficiario(): void {
    const rfc = this.parentContainer.control?.get('rfc')?.value;
    if (!rfc) return;
    this.parentContainer.control?.get('rfc')?.clearValidators();
    this.parentContainer.control?.get('rfc')?.updateValueAndValidity();
    if (rfc.includes('XAXX010101000')) return;
    if (!rfc.match(PATRON_RFC)) {
      this.alertaService.mostrar(TipoAlerta.Error, 'RFC no válido.');
      this.parentContainer.control?.get('rfc')?.setValidators(Validators.pattern(PATRON_RFC));
      this.parentContainer.control?.get('rfc')?.updateValueAndValidity();
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
    this.parentContainer.control?.get('fechaNacimiento')?.setValue(fecha);
    this.parentContainer.control?.get('nacionalidad')?.setValue(1);
    this.parentContainer.control?.get('paisNacimiento')?.setValue(null);
    this.parentContainer.control?.get('lugarNacimiento')?.setValue(null);
    this.parentContainer.control?.get('lugarNacimiento')?.setValidators([Validators.required]);
    this.parentContainer.control?.get('paisNacimiento')?.clearValidators();
    this.cargarValidacionesIniciales();
  }

  cargaCPSust(cargaInicial: boolean = false): void {
    const cpSust = this.parentContainer.control?.get('cp')?.value;
    if (cpSust.length < 5) return;
    if (!cargaInicial) {
      this.cargadorService.activar();
      this.parentContainer.control?.get('colonia')?.setValue(null);
    }
    if (validarUsuarioLogueado()) return;
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

  procesarRespuestaCURP(respuesta: HttpRespuesta<any>): void {
    if (respuesta.error && respuesta.mensaje !== 'Exito') {
      this.mostrarMensaje(+respuesta.mensaje);
      return;
    }
    let [valores] = respuesta.datos;
    let [anioD, mesD, diaD] = valores.fechaNacimiento.split('-');
    let fechaNacimiento = new Date(anioD + '/' + mesD + '/' + diaD);
    this.parentContainer.control?.get('nombre')?.setValue(valores.nomPersona);
    this.parentContainer.control?.get('fechaNacimiento')?.setValue(fechaNacimiento);
    this.parentContainer.control?.get('primerApellido')?.setValue(valores.primerApellido);
    this.parentContainer.control?.get('segundoApellido')?.setValue(valores.segundoApellido);
    this.parentContainer.control?.get('nacionalidad')?.setValue(1);
    this.parentContainer.control?.get('telefono')?.setValue(valores.telefono);
    this.parentContainer.control?.get('correoElectronico')?.setValue(valores.correo);
    this.parentContainer.control?.get('sexo')?.setValue(valores.sexo);
    this.parentContainer.control?.get('otroSexo')?.setValue(valores.otroSexo);
    this.parentContainer.control?.get('edad')?.setValue(moment().diff(moment(fechaNacimiento), 'years'));
    this.parentContainer.control?.get('nombre')?.disable();
    this.parentContainer.control?.get('primerApellido')?.disable();
    this.parentContainer.control?.get('segundoApellido')?.disable();
    this.parentContainer.control?.get('sexo')?.disable();
    this.parentContainer.control?.get('otroSexo')?.disable();
    this.parentContainer.control?.get('fechaNacimiento')?.disable();
    this.parentContainer.control?.get('nacionalidad')?.disable();
    this.parentContainer.control?.get('paisNacimiento')?.disable();
    this.cargarValidacionesIniciales();
    if (valores.nomPersona === '') {
      this.alertaService.mostrar(TipoAlerta.Error, 'CURP no valido.');
      this.parentContainer.control?.get('curp')?.setErrors({'incorrect': true});
    }
  }

  mostrarMensaje(numero: number): void {
    switch (numero) {
      case 5:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al guardar la información. Intenta nuevamente.'
        );
        break;
      case 33:
        this.alertaService.mostrar(TipoAlerta.Info, 'R.F.C. no valido.');
        break;
      case 52:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Error al consultar la información.'
        );
        break;
      case 184:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El servicio de RENAPO  no esta disponible.'
        );
        break;
      case 185:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El código postal no existe.'
        );
        break;
      case 186:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'El servicio no responde, no permite más llamadas.'
        );
        break;
      case 187:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
        break;
      case 802:
        this.alertaService.mostrar(
          TipoAlerta.Info,
          'El beneficiario ya fue registrado con anterioridad, ingrese un beneficiario diferente.'
        );
        break;
      case 900:
        this.alertaService.mostrar(TipoAlerta.Info, 'Selecciona un paquete.');
        break;
      default:
        this.alertaService.mostrar(
          TipoAlerta.Error,
          'Ocurrio un error al procesar tu solicitud. Verifica tu información e intenta nuevamente. Si el problema persiste, contacta al responsable de la administración del sistema.'
        );
    }
  }

}

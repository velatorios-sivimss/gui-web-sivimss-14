import {Component, inject, Input, OnInit} from '@angular/core';
import {ControlContainer, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {UtileriaModule} from "../../../../../shared/utileria/utileria.module";
import {CommonModule} from "@angular/common";
import {CalendarModule} from "primeng/calendar";
import {AutenticacionService} from "../../../../../services/autenticacion.service";
import {mapearArregloTipoDropdown} from "../../../../../utils/funciones";
import {TipoDropdown} from "../../../../../models/tipo-dropdown";
import {CATALOGO_NACIONALIDAD} from "../../../../contratantes/constants/catalogos-complementarios";
import {CATALOGO_ENFERMEDAD_PREEXISTENTE} from "../../../../convenios-prevision-funeraria/constants/catalogos-funcion";
import {delay, finalize} from "rxjs/operators";
import {HttpRespuesta} from "../../../../../models/http-respuesta.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {LoaderService} from "../../../../../shared/loader/services/loader.service";
import {SeguimientoNuevoConvenioService} from "../../services/seguimiento-nuevo-convenio.service";
import {MensajesSistemaService} from "../../../../../services/mensajes-sistema.service";
import {AlertaService, TipoAlerta} from "../../../../../shared/alerta/services/alerta.service";
import {PATRON_CURP, PATRON_RFC} from "../../../../../utils/constantes";
import * as moment from "moment/moment";

@Component({
  selector: 'app-datos-persona',
  templateUrl: './datos-persona.component.html',
  styleUrls: ['./datos-persona.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, DropdownModule, UtileriaModule, CommonModule, CalendarModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, {skipSelf: true})
    }
  ]
})
export class DatosPersonaComponent implements OnInit {

  paises: TipoDropdown[] = [];
  estados: TipoDropdown[] = [];
  enfermedades: TipoDropdown[] = CATALOGO_ENFERMEDAD_PREEXISTENTE;
  nacionalidad: TipoDropdown[] = CATALOGO_NACIONALIDAD;
  colonias: TipoDropdown[] = [];

  parentContainer: ControlContainer = inject(ControlContainer);

  @Input() enfermedad: boolean = true;
  @Input() ID: string = '';

  constructor(private autenticacionService: AutenticacionService,
              private cargadorService: LoaderService,
              private seguimientoNuevoConvenioService: SeguimientoNuevoConvenioService,
              private mensajesSistemaService: MensajesSistemaService,
              private alertaService: AlertaService,) {
    this.cargarCatalogosLocalStorage();
  }

  ngOnInit(): void {
    this.cargarValidacionesIniciales();
    this.cargarCP(true);
  }

  cargarValidacionesIniciales(): void {
    const nacionalidad = this.parentContainer.control?.get('nacionalidad')?.value;
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

  cargarCP(cargaInicial: boolean = false): void {
    const cp = this.parentContainer.control?.get('codigoPostal')?.value;
    if (!cp) return;
    if (cp.length < 5) return;
    if (!cargaInicial) {
      this.cargadorService.activar();
      this.parentContainer.control?.get('colonia')?.setValue(null);
    }
    this.seguimientoNuevoConvenioService.consutaCP(cp).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (response: HttpRespuesta<any>): void => this.procesarRespuestaCPPersona(response),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error),
    })
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  procesarRespuestaCPPersona(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos) {
      this.respuestaSinDatosCPPersona();
      return;
    }
    this.colonias = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'nombre');
    const [colonia] = respuesta.datos;
    this.parentContainer.control?.get('municipio')?.setValue(colonia.municipio.nombre);
    this.parentContainer.control?.get('estado')?.setValue(colonia.municipio.entidadFederativa.nombre);
  }

  respuestaSinDatosCPPersona(): void {
    this.colonias = [];
    this.parentContainer.control?.get('municipio')?.setValue(null);
    this.parentContainer.control?.get('estado')?.setValue(null);
    this.parentContainer.control?.get('colonia')?.setValue(null);
  }

  get parentFormGroup() {
    return (this.parentContainer.control as FormGroup).controls
  }

  cambioNacionalidad(): void {
    const nacionalidadPersona = this.parentContainer.control?.get('nacionalidad')?.value;
    this.parentContainer.control?.get('paisNacimiento')?.setValue(null);
    this.parentContainer.control?.get('lugarNacimiento')?.setValue(null);
    if (nacionalidadPersona === 1) {
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


  validarCurp(): void {
    const curp = this.parentContainer.control?.get('curp')?.value;
    if (!curp) return;
    if (!curp.match(PATRON_CURP)) {
      this.alertaService.mostrar(TipoAlerta.Error, 'CURP no valido.');
      return;
    }
    this.cargadorService.activar();
    const parametros = {curp, rfc: null};
    this.seguimientoNuevoConvenioService.buscarCurpRFC(parametros)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>) => this.procesarRespuestaCURP(respuesta),
        error: (error: HttpErrorResponse) => this.manejarMensajeError(error),
      });
  }

  procesarRespuestaCURP(respuesta: HttpRespuesta<any>): void {
    if (respuesta.error && respuesta.mensaje !== 'Exito') {
      this.mostrarMensaje(+respuesta.mensaje);
      return;
    }
    if (respuesta.mensaje == 'Exito') {
      let [valores] = respuesta.datos;
      // let [anioD, mesD, diaD] = valores.fechaNacimiento.split('-');
      // let fechaNacimiento = new Date(anioD + '/' + mesD + '/' + diaD);
      this.parentContainer.control?.get('nombres')?.setValue(valores.nomPersona);
      this.parentContainer.control?.get('primerApellido')?.setValue(valores.primerApellido);
      this.parentContainer.control?.get('segundoApellido')?.setValue(valores.segundoApellido);
      // this.f.fecha.setValue(fechaNacimiento);
      // this.f.fechaNacimiento.setValue(moment(fechaNacimiento).format('YYYY-MM-DD'));
      this.parentContainer.control?.get('telefono')?.setValue(valores.telefono);
      this.parentContainer.control?.get('correoElectronico')?.setValue(valores.correo);
      // this.parentContainer.control?.get('edad')?.setValue(moment().diff(moment(fechaNacimiento), 'years'));
    }
  }

  validarRfc(): void {
    const rfc = this.parentContainer.control?.get('rfc')?.value;
    if (!rfc) return;
    if (!rfc.match(PATRON_RFC)) {
      this.parentContainer.control?.get('rfc')?.setValidators(Validators.pattern(PATRON_RFC));
      this.parentContainer.control?.get('rfc')?.updateValueAndValidity();
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

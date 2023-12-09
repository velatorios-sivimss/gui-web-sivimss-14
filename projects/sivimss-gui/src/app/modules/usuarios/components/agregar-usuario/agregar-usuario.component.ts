import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PATRON_CORREO, PATRON_CURP} from "../../../../utils/constantes";
import {Usuario} from "../../models/usuario.interface";
import * as moment from "moment/moment";
import {HttpErrorResponse, HttpEventType, HttpHeaders} from "@angular/common/http";
import {UsuarioService} from "../../services/usuario.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";
import {MENSAJES_CURP} from "../../constants/validacionCURP";
import {MENSAJES_MATRICULA} from "../../constants/validacionMatricula";
import {ActivatedRoute} from '@angular/router';
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";

type NuevoUsuario = Omit<Usuario, "id" | "password" | "estatus" | "matricula" | "usuario"> &
  { idEdoNacimiento: number };
type SolicitudCurp = Pick<Usuario, "curp">;
type SolicitudMatricula = Pick<Usuario, "claveMatricula">;

@Component({
  selector: 'app-agregar-usuario',
  templateUrl: './agregar-usuario.component.html',
  styleUrls: ['./agregar-usuario.component.scss']
})
export class AgregarUsuarioComponent implements OnInit {

  readonly CAPTURA_DE_USUARIO: number = 1;
  readonly RESUMEN_DE_USUARIO: number = 2;
  readonly HREF_RENAPO: string = "https://www.gob.mx/curp/";

  agregarUsuarioForm!: FormGroup;

  curpValida: boolean = false;
  matriculaValida: boolean = true;
  folio: number = 0;

  catalogoRoles: TipoDropdown[] = [];
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];
  catalogoEstados: TipoDropdown[] = [];

  nuevoUsuario!: NuevoUsuario;
  fechaActual: Date = new Date();
  indice: number = 0;
  rolResumen: string = "";
  nivelResumen: string = "";
  delegacionResumen: string = "";
  velatorioResumen: string = "";
  estadoResumen: string = "";
  mostrarModalMatriculaInactiva: boolean = false;
  mostrarModalUsuarioRepetido: boolean = false;

  readonly POSICION_CATALOGO_NIVELES: number = 0;
  readonly POSICION_CATALOGO_DELEGACIONES: number = 1;
  readonly POSICION_CATALOGO_ESTADOS: number = 2
  readonly NOT_FOUND_ERROR_RENAPO: string = "No se encontro información relacionada a tu búsqueda.";
  readonly ERROR_ALTA_USUARIO: string = "Error al guardar la información del usuario. Intenta nuevamente.";
  readonly MSG_ALTA_USUARIO: string = "Agregado correctamente.";
  pasoAgregarUsuario: number = 1;
  nombreUsuario: string = "";

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private cargadorService: LoaderService,
    private mensajesSistemaService: MensajesSistemaService
  ) {
  }

  ngOnInit(): void {
    this.folio = this.config.data.toString().padStart(3, '0');
    this.inicializarAgregarUsuarioForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    this.catalogoNiveles = respuesta[this.POSICION_CATALOGO_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_CATALOGO_DELEGACIONES];
    this.catalogoEstados = respuesta[this.POSICION_CATALOGO_ESTADOS];
  }

  inicializarAgregarUsuarioForm(): void {
    this.agregarUsuarioForm = this.formBuilder.group({
      curp: [{value: null, disabled: false},
        [Validators.required, Validators.maxLength(18), Validators.pattern(PATRON_CURP)]],
      matricula: [{value: null, disabled: false}],
      nombre: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(20)]],
      primerApellido: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(30)]],
      segundoApellido: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(30)]],
      correoElectronico: [{value: null, disabled: false},
        [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
      fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      nivel: [{value: null, disabled: false}, [Validators.required]],
      delegacion: [{value: null, disabled: false}],
      velatorio: [{value: null, disabled: false}],
      idEdoNacimiento: [{value: null, disabled: false}],
      rol: [{value: null, disabled: false}, [Validators.required]],
      estatus: [{value: true, disabled: false}, [Validators.required]]
    });
  }

  private manejarMensajeError(error: HttpErrorResponse): void {
    console.error(error);
    this.mensajesSistemaService.mostrarMensajeError(error);
  }

  cargarRoles(): void {
    const idNivel = this.agregarUsuarioForm.get('nivel')?.value;
    this.catalogoRoles = [];
    this.agregarUsuarioForm.get('rol')?.patchValue(null);
    this.agregarUsuarioForm.get('delegacion')?.patchValue(null);
    this.agregarUsuarioForm.get('velatorio')?.patchValue(null);
    this.cargadorService.activar();
    this.usuarioService.obtenerCatalogoRoles(idNivel).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.procesarCatalogoRoles(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  procesarCatalogoRoles(respuesta: HttpRespuesta<any>): void {
    this.catalogoRoles = mapearArregloTipoDropdown(respuesta.datos, 'nombre', 'id');
  }

  buscarVelatorios(): void {
    const delegacion = this.agregarUsuarioForm.get('delegacion')?.value;
    this.agregarUsuarioForm.get('velatorio')?.patchValue(null);
    this.cargadorService.activar();
    this.usuarioService.obtenerVelatorios(delegacion)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => this.procesarCatalogoVelatorios(respuesta),
        error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
      });
  }

  procesarCatalogoVelatorios(respuesta: HttpRespuesta<any>): void {
    this.catalogoVelatorios = mapearArregloTipoDropdown(respuesta.datos, 'desc', 'id');
  }

  crearUsuario(): NuevoUsuario {
    return {
      claveMatricula: this.agregarUsuarioForm.get("matricula")?.value,
      correo: this.agregarUsuarioForm.get("correoElectronico")?.value,
      curp: this.agregarUsuarioForm.get("curp")?.value,
      fecNacimiento: this.agregarUsuarioForm.get('fechaNacimiento')?.value &&
        moment(this.agregarUsuarioForm.get('fechaNacimiento')?.value).format('YYYY-MM-DD'),
      idDelegacion: this.agregarUsuarioForm.get("delegacion")?.value,
      idOficina: this.agregarUsuarioForm.get("nivel")?.value,
      idRol: this.agregarUsuarioForm.get("rol")?.value,
      idVelatorio: this.agregarUsuarioForm.get("velatorio")?.value,
      materno: this.agregarUsuarioForm.get("segundoApellido")?.value,
      nombre: this.agregarUsuarioForm.get("nombre")?.value,
      paterno: this.agregarUsuarioForm.get("primerApellido")?.value,
      idEdoNacimiento: this.agregarUsuarioForm.get("idEdoNacimiento")?.value,
    };
  }

  crearNombreUsuario(): string {
    const nombre = this.agregarUsuarioForm.get("nombre")?.value;
    const paterno = this.agregarUsuarioForm.get("primerApellido")?.value;
    return `${nombre.split(' ')[0]}${paterno.toString().charAt(0)}${this.folio}`.toUpperCase();
  }

  creacionVariablesResumen(): void {
    const idRol = this.agregarUsuarioForm.get("rol")?.value;
    const idNivel = this.agregarUsuarioForm.get("nivel")?.value;
    const idDelegacion = this.agregarUsuarioForm.get("delegacion")?.value;
    const idVelatorio = this.agregarUsuarioForm.get("velatorio")?.value;
    const idEdoNacimiento = this.agregarUsuarioForm.get("idEdoNacimiento")?.value;
    this.rolResumen = this.catalogoRoles.find(rol => rol.value === idRol)?.label ?? "";
    this.nivelResumen = this.catalogoNiveles.find(nivel => nivel.value === idNivel)?.label ?? "";
    this.delegacionResumen = this.catalogoDelegaciones.find(delegacion => delegacion.value === idDelegacion)?.label ?? "";
    this.velatorioResumen = this.catalogoVelatorios.find(velatorio => velatorio.value === idVelatorio)?.label ?? "";
    this.estadoResumen = this.catalogoEstados.find(estado => estado.value === idEdoNacimiento)?.label ?? "";
  }

  validarCurp(): void {
    const consulta: SolicitudCurp = {curp: this.agregarUsuarioForm.get("curp")?.value};
    this.agregarUsuarioForm.get('nombre')?.patchValue(null);
    this.agregarUsuarioForm.get('primerApellido')?.patchValue(null);
    this.agregarUsuarioForm.get('segundoApellido')?.patchValue(null);
    if (!consulta.curp) return;
    if (!PATRON_CURP.test(consulta.curp)) return;
    this.usuarioService.validarCurp(consulta).pipe(
      finalize(() => this.validarCurpRenapo(consulta.curp))
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.validarRespuestaCurp(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeErrorConsulta(error)
    });
  }

  validarRespuestaCurp(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos || respuesta.datos.length === 0) return;
    const {valor} = respuesta.datos[0];
    if (!MENSAJES_CURP.has(valor)) return;
    const {valido} = MENSAJES_CURP.get(valor);
    this.curpValida = valido;
    if (!valido) {
      this.mostrarModalUsuarioRepetido = !this.mostrarModalUsuarioRepetido;
    }
  }

  private manejarMensajeErrorConsulta(error: HttpErrorResponse): void {
    console.error(error);
    const ERROR: string = 'Error al consultar la información.';
    this.mensajesSistemaService.mostrarMensajeError(error, ERROR);
  }

  validarCurpRenapo(curp: string): void {
    if (!this.curpValida) return;
    this.cargadorService.activar();
    this.usuarioService.consultarCurpRenapo(curp).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaCURPRenapo(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeErrorConsulta(error)
    });
  }

  procesarRespuestaCURPRenapo(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos) return;
    if (respuesta.datos.message !== '') {
      const error: HttpErrorResponse = this.generarError(respuesta.mensaje)
      this.mensajesSistemaService.mostrarMensajeError(error, this.NOT_FOUND_ERROR_RENAPO);
      this.curpValida = !this.curpValida;
      return;
    }
    const {apellido1, apellido2, nombre} = respuesta.datos;
    this.agregarUsuarioForm.get("nombre")?.patchValue(nombre);
    this.agregarUsuarioForm.get("primerApellido")?.patchValue(apellido1);
    this.agregarUsuarioForm.get("segundoApellido")?.patchValue(apellido2);
  }

  validarMatricula(): void {
    const consulta: SolicitudMatricula = {claveMatricula: this.agregarUsuarioForm.get("matricula")?.value};
    if (!consulta.claveMatricula) {
      this.matriculaValida = true;
      return;
    }
    this.usuarioService.validarMatricula(consulta).pipe(
      finalize(() => this.validarMatriculaSiap(consulta.claveMatricula))
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaMatricula(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  procesarRespuestaMatricula(respuesta: HttpRespuesta<any>): void {
    if (!respuesta.datos || respuesta.datos.length === 0) return;
    const {valor} = respuesta.datos[0];
    if (!MENSAJES_MATRICULA.has(valor)) return;
    const {valido} = MENSAJES_MATRICULA.get(valor);
    this.matriculaValida = valido;
    if (!valido) {
      this.mostrarModalUsuarioRepetido = !this.mostrarModalUsuarioRepetido;
    }
  }

  validarMatriculaSiap(matricula: string): void {
    if (!this.matriculaValida) return;
    this.cargadorService.activar();
    this.usuarioService.consultarMatriculaSiap(matricula).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe({
      next: (respuesta: HttpRespuesta<any>): void => this.procesarRespuestaMatriculaSIAP(respuesta),
      error: (error: HttpErrorResponse): void => this.manejarMensajeError(error)
    });
  }

  procesarRespuestaMatriculaSIAP(respuesta: HttpRespuesta<any>): void {
    if (respuesta.error) {
      const mensaje: string = respuesta.mensaje === '79' ? '70' : respuesta.mensaje;
      const error: HttpErrorResponse = this.generarError(mensaje)
      this.mensajesSistemaService.mostrarMensajeError(error);
      this.matriculaValida = !this.matriculaValida;
    }
    if (respuesta.datos.status === 'INACTIVO') {
      this.mostrarModalMatriculaInactiva = !this.mostrarModalMatriculaInactiva;
      this.matriculaValida = !this.matriculaValida;
    }
  }

  generarError(message: string): HttpErrorResponse {
    return {
      error: undefined,
      headers: new HttpHeaders(),
      message,
      name: "HttpErrorResponse",
      ok: false,
      status: 0,
      statusText: "",
      type: HttpEventType.Response,
      url: null
    }
  }

  agregarUsuario(): void {
    this.cargadorService.activar();
    this.usuarioService.guardar(this.nuevoUsuario)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe({
        next: (respuesta: HttpRespuesta<any>): void => this.altaUsuarioValida(respuesta),
        error: (error: HttpErrorResponse): void => this.errorAltaUsuario(error)
      });
  }

  altaUsuarioValida(respuesta: HttpRespuesta<any>): void {
    const respuestaModal: RespuestaModalUsuario = {mensaje: this.MSG_ALTA_USUARIO, actualizar: true}
    respuestaModal.usuario = respuesta.datos[0];
    this.ref.close(respuestaModal);
  }

  errorAltaUsuario(error: HttpErrorResponse): void {
    console.error("ERROR: ", error);
    const ERROR_MENSAJE: string = `${this.ERROR_ALTA_USUARIO} ${this.nombreUsuario}`;
    this.mensajesSistemaService.mostrarMensajeError(error, ERROR_MENSAJE);
  }

  cancelar(): void {
    if (this.pasoAgregarUsuario === this.RESUMEN_DE_USUARIO) {
      this.pasoAgregarUsuario = this.CAPTURA_DE_USUARIO;
      return;
    }
    const respuesta: RespuestaModalUsuario = {};
    this.ref.close(respuesta);
  }

  confirmarCreacion(): void {
    if (this.pasoAgregarUsuario === this.CAPTURA_DE_USUARIO) {
      this.pasoAgregarUsuario = this.RESUMEN_DE_USUARIO;
      this.nuevoUsuario = this.crearUsuario();
      this.nombreUsuario = this.crearNombreUsuario();
      this.creacionVariablesResumen();
      return;
    }
    this.agregarUsuario();
  }

  get fau() {
    return this.agregarUsuarioForm?.controls;
  }

}

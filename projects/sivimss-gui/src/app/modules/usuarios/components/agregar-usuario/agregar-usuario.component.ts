import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {PATRON_CORREO, PATRON_CURP} from "../../../../utils/constantes";
import {Usuario} from "../../models/usuario.interface";
import * as moment from "moment/moment";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {UsuarioService} from "../../services/usuario.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";
import {MENSAJES_CURP} from "../../constants/validacionCURP";
import {MENSAJES_MATRICULA} from "../../constants/validacionMatricula";
import {ActivatedRoute} from '@angular/router';
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {DynamicDialogRef} from "primeng/dynamicdialog";

type NuevoUsuario = Omit<Usuario, "id" | "password" | "estatus" | "matricula">;
type SolicitudCurp = Pick<Usuario, "curp">;
type SolicitudMatricula = Pick<Usuario, "claveMatricula">;

@Component({
  selector: 'app-agregar-usuario',
  templateUrl: './agregar-usuario.component.html',
  styleUrls: ['./agregar-usuario.component.scss']
})
export class AgregarUsuarioComponent implements OnInit {

  agregarUsuarioForm!: FormGroup;

  curpValida: boolean = false;
  matriculaValida: boolean = false;

  catalogoRoles: TipoDropdown[] = [];
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

  nuevoUsuario!: NuevoUsuario;
  fechaActual: Date = new Date();
  indice: number = 0;
  rolResumen: string = "";
  nivelResumen: string = "";
  delegacionResumen: string = "";
  velatorioResumen: string = "";

  readonly POSICION_ROLES: number = 0;
  readonly POSICION_NIVELES: number = 1;
  readonly POSICION_DELEGACIONES: number = 2;

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder,
    public ref: DynamicDialogRef,
    private usuarioService: UsuarioService,
    private cargadorService: LoaderService
  ) {
  }

  ngOnInit(): void {
    this.inicializarAgregarUsuarioForm();
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const roles = respuesta[this.POSICION_ROLES].datos
    this.catalogoRoles = mapearArregloTipoDropdown(roles, "nombre", "id");
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
  }

  inicializarAgregarUsuarioForm(): void {
    this.agregarUsuarioForm = this.formBuilder.group({
      curp: [{value: null, disabled: false},
        [Validators.required, Validators.maxLength(18), Validators.pattern(PATRON_CURP)]],
      matricula: [{value: null, disabled: false}, [Validators.required, Validators.maxLength(10)]],
      nombre: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(50)]],
      primerApellido: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(50)]],
      segundoApellido: [{value: null, disabled: true}, [Validators.required, Validators.maxLength(50)]],
      correoElectronico: [{value: null, disabled: false},
        [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
      fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
      nivel: [{value: null, disabled: false}, [Validators.required]],
      delegacion: [{value: null, disabled: false}, [Validators.required]],
      velatorio: [{value: null, disabled: false}, [Validators.required]],
      rol: [{value: null, disabled: false}, [Validators.required]],
      estatus: [{value: true, disabled: false}]
    });
  }

  buscarVelatorios(): void {
    const delegacion = this.agregarUsuarioForm.get('delegacion')?.value;
    this.agregarUsuarioForm.get('velatorio')?.patchValue("");
    this.usuarioService.obtenerVelatorios(delegacion)
      .subscribe(
        (respuesta) => {
          const velatorios = respuesta.datos || [];
          this.catalogoVelatorios = mapearArregloTipoDropdown(velatorios, "desc", "id");
        },
        (error: HttpErrorResponse) => {
          console.log(error)
        }
      );
  }

  crearUsuario(): NuevoUsuario {
    return {
      materno: this.agregarUsuarioForm.get("segundoApellido")?.value,
      nombre: this.agregarUsuarioForm.get("nombre")?.value,
      correo: this.agregarUsuarioForm.get("correoElectronico")?.value,
      curp: this.agregarUsuarioForm.get("curp")?.value,
      claveMatricula: this.agregarUsuarioForm.get("matricula")?.value,
      fecNacimiento: this.agregarUsuarioForm.get('fechaNacimiento')?.value &&
        moment(this.agregarUsuarioForm.get('fechaNacimiento')?.value).format('YYYY-MM-DD'),
      paterno: this.agregarUsuarioForm.get("primerApellido")?.value,
      idOficina: this.agregarUsuarioForm.get("nivel")?.value,
      idVelatorio: this.agregarUsuarioForm.get("velatorio")?.value,
      idRol: this.agregarUsuarioForm.get("rol")?.value,
      idDelegacion: this.agregarUsuarioForm.get("delegacion")?.value,
    };
  }

  creacionVariablesResumen(): void {
    const rol = this.agregarUsuarioForm.get("rol")?.value;
    const nivel = this.agregarUsuarioForm.get("nivel")?.value;
    const delegacion = this.agregarUsuarioForm.get("delegacion")?.value;
    const velatorio = this.agregarUsuarioForm.get("velatorio")?.value;
    this.rolResumen = this.catalogoRoles.find(r => r.value === rol)?.label || "";
    this.nivelResumen = this.catalogoNiveles.find(n => n.value === nivel)?.label || "";
    this.delegacionResumen = this.catalogoDelegaciones.find(d => d.value === delegacion)?.label || "";
    this.velatorioResumen = this.catalogoVelatorios.find(v => v.value === velatorio)?.label || "";
  }

  validarCurp(): void {
    const curp: SolicitudCurp = {curp: this.agregarUsuarioForm.get("curp")?.value};
    if (!curp.curp) return;
    if (!PATRON_CURP.test(curp.curp)) return;
    this.usuarioService.validarCurp(curp).pipe(
      finalize(() => this.validarCurpRenapo(curp.curp))
    ).subscribe(
      (respuesta) => {
        if (!respuesta.datos || respuesta.datos.length === 0) return;
        const {valor} = respuesta.datos[0];
        if (!MENSAJES_CURP.has(valor)) return;
        const {mensaje, tipo, valido} = MENSAJES_CURP.get(valor);
        this.curpValida = valido;
        console.log(this.curpValida)
        this.alertaService.mostrar(tipo, mensaje);
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Ocurrio un error');
        console.error("ERROR: ", error)
      }
    );
  }

  validarCurpRenapo(curp: string): void {
    if (!this.curpValida) return
    this.cargadorService.activar();
    this.usuarioService.consultarCurpRenapo(curp).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe(
      (respuesta) => {
        if (!respuesta.datos) return;
        const {apellido1, apellido2, nombre} = respuesta.datos;
        this.agregarUsuarioForm.get("nombre")?.patchValue(nombre);
        this.agregarUsuarioForm.get("primerApellido")?.patchValue(apellido1);
        this.agregarUsuarioForm.get("segundoApellido")?.patchValue(apellido2);
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Ocurrio un error');
        console.error("ERROR: ", error)
      });
  }

  validarMatricula(): void {
    const matricula: SolicitudMatricula = {claveMatricula: this.agregarUsuarioForm.get("matricula")?.value};
    if (!matricula.claveMatricula) return;
    this.usuarioService.validarMatricula(matricula).pipe(
      finalize(() => this.validarCurpMatricula(matricula.claveMatricula))
    ).subscribe(
      (respuesta) => {
        if (!respuesta.datos || respuesta.datos.length === 0) return;
        const {valor} = respuesta.datos[0];
        if (!MENSAJES_MATRICULA.has(valor)) return;
        const {mensaje, tipo, valido} = MENSAJES_MATRICULA.get(valor);
        this.matriculaValida = valido;
        this.alertaService.mostrar(tipo, mensaje);
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Matricula no valida');
        console.error("ERROR: ", error)
      }
    );
  }

  validarCurpMatricula(matricula: string): void {
    if (!this.matriculaValida) return
    this.cargadorService.activar();
    this.usuarioService.consultarMatriculaSiap(matricula).pipe(
      finalize(() => this.cargadorService.desactivar())
    ).subscribe(
      (respuesta) => {
        console.log(respuesta)
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Ocurrio un error');
        console.error("ERROR: ", error)
      });
  }

  agregarUsuario(): void {
    const respuesta: RespuestaModalUsuario = {mensaje: "Usuario agregado correctamente", actualizar: true}
    this.cargadorService.activar();
    this.usuarioService.guardar(this.nuevoUsuario)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe(
        () => {
          this.ref.close(respuesta)
        },
        (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, 'Alta incorrecta');
          console.error("ERROR: ", error)
        }
      );
  }

  cancelar(): void {
    const respuesta: RespuestaModalUsuario = {};
    this.ref.close(respuesta);
  }

  confirmarCreacion(): void {
    if (this.indice === 0) {
      this.indice++;
      this.nuevoUsuario = this.crearUsuario();
      this.creacionVariablesResumen();
      return;
    }
    this.agregarUsuario();
  }

  get fau() {
    return this.agregarUsuarioForm?.controls;
  }

}

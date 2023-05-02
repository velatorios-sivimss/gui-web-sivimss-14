import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Usuario} from '../../models/usuario.interface';
import * as moment from "moment/moment";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {UsuarioService} from "../../services/usuario.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {PATRON_CORREO} from "../../../../utils/constantes";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {RespuestaModalUsuario} from "../../models/respuestaModal.interface";
import {diferenciaUTC, mapearArregloTipoDropdown} from "../../../../utils/funciones";
import {ActivatedRoute} from '@angular/router';
import {finalize} from "rxjs/operators";
import {LoaderService} from "../../../../shared/loader/services/loader.service";

type UsuarioModificado = Omit<Usuario, "password">

@Component({
  selector: 'app-modificar-usuario',
  templateUrl: './modificar-usuario.component.html',
  styleUrls: ['./modificar-usuario.component.scss']
})
export class ModificarUsuarioComponent implements OnInit {

  modificarUsuarioForm!: FormGroup;
  usuarioModificado!: UsuarioModificado;

  catalogoRoles: TipoDropdown[] = [];
  catalogoNiveles: TipoDropdown[] = [];
  catalogoDelegaciones: TipoDropdown[] = [];
  catalogoVelatorios: TipoDropdown[] = [];

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
    private formBuilder: FormBuilder,
    private usuarioService: UsuarioService,
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private cargadorService: LoaderService
  ) {
  }

  ngOnInit(): void {
    const usuario = this.config.data;
    this.cargarCatalogos(usuario.idDelegacion);
    this.inicializarModificarUsuarioForm(usuario);
  }

  cargarCatalogos(delegacion: string): void {
    const respuesta = this.route.snapshot.data["respuesta"];
    const roles = respuesta[this.POSICION_ROLES].datos
    this.catalogoRoles = mapearArregloTipoDropdown(roles, "nombre", "id");
    this.catalogoNiveles = respuesta[this.POSICION_NIVELES];
    this.catalogoDelegaciones = respuesta[this.POSICION_DELEGACIONES];
    this.buscarVelatorios(delegacion);
  }

  inicializarModificarUsuarioForm(usuario: Usuario): void {
    this.modificarUsuarioForm = this.formBuilder.group({
      id: [{value: usuario.id, disabled: true}, [Validators.required]],
      curp: [{value: usuario.curp, disabled: true}, [Validators.required, Validators.maxLength(18)]],
      matricula: [{value: usuario.matricula, disabled: true}, [Validators.required, Validators.maxLength(10)]],
      nombre: [{value: usuario.nombre, disabled: true}, [Validators.required, Validators.maxLength(50)]],
      primerApellido: [{value: usuario.paterno, disabled: true}, [Validators.required, Validators.maxLength(50)]],
      segundoApellido: [{value: usuario.materno, disabled: true}, [Validators.required, Validators.maxLength(50)]],
      correoElectronico: [{value: usuario.correo, disabled: false},
        [Validators.required, Validators.email, Validators.pattern(PATRON_CORREO)]],
      fechaNacimiento: [{value: new Date(diferenciaUTC(usuario.fecNacimiento)), disabled: false},
        [Validators.required]],
      nivel: [{value: usuario.idOficina, disabled: false}, [Validators.required]],
      delegacion: [{value: usuario.idDelegacion, disabled: false}, [Validators.required]],
      velatorio: [{value: usuario.idVelatorio, disabled: false}, [Validators.required]],
      rol: [{value: usuario.idRol, disabled: false}, [Validators.required]],
      estatus: [{value: usuario.estatus, disabled: false}, [Validators.required]]
    });
  }

  buscarVelatorios(delegacion?: string): void {
    if (!delegacion) {
      delegacion = this.modificarUsuarioForm.get('delegacion')?.value;
      this.modificarUsuarioForm.get('velatorio')?.patchValue("");
    }
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

  crearUsuarioModificado(): UsuarioModificado {
    return {
      id: this.modificarUsuarioForm.get("id")?.value,
      materno: this.modificarUsuarioForm.get("segundoApellido")?.value,
      nombre: this.modificarUsuarioForm.get("nombre")?.value,
      correo: this.modificarUsuarioForm.get("correoElectronico")?.value,
      curp: this.modificarUsuarioForm.get("curp")?.value,
      claveMatricula: this.modificarUsuarioForm.get("matricula")?.value,
      fecNacimiento: this.modificarUsuarioForm.get('fechaNacimiento')?.value &&
        moment(this.modificarUsuarioForm.get('fechaNacimiento')?.value).format('YYYY-MM-DD'),
      paterno: this.modificarUsuarioForm.get("primerApellido")?.value,
      estatus: this.modificarUsuarioForm.get("estatus")?.value ? 1 : 0,
      idOficina: this.modificarUsuarioForm.get("nivel")?.value,
      idVelatorio: this.modificarUsuarioForm.get("velatorio")?.value,
      idRol: this.modificarUsuarioForm.get("rol")?.value,
      idDelegacion: this.modificarUsuarioForm.get("delegacion")?.value,
      matricula: this.modificarUsuarioForm.get("matricula")?.value
    };
  }

  creacionVariablesResumen(): void {
    const rol = this.modificarUsuarioForm.get("rol")?.value;
    const nivel = this.modificarUsuarioForm.get("nivel")?.value;
    const delegacion = this.modificarUsuarioForm.get("delegacion")?.value;
    const velatorio = this.modificarUsuarioForm.get("velatorio")?.value;
    this.rolResumen = this.catalogoRoles.find(r => r.value === rol)?.label || "";
    this.nivelResumen = this.catalogoNiveles.find(n => n.value === nivel)?.label || "";
    this.delegacionResumen = this.catalogoDelegaciones.find(d => d.value === delegacion)?.label || "";
    this.velatorioResumen = this.catalogoVelatorios.find(v => v.value === velatorio)?.label || "";
  }

  modificarUsuario(): void {
    const respuesta: RespuestaModalUsuario = {mensaje: "Usuario modificado correctamente", actualizar: true}
    this.cargadorService.activar();
    this.usuarioService.actualizar(this.usuarioModificado)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe(
        () => {
          this.ref.close(respuesta)
        },
        (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, 'Actualización incorrecta');
          console.error("ERROR: ", error)
        }
      );
  }

  cancelar(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
    const respuesta: RespuestaModalUsuario = {};
    this.ref.close(respuesta);
  }

  confirmarModificacion(): void {
    if (this.indice === 0) {
      this.indice++;
      this.usuarioModificado = this.crearUsuarioModificado();
      this.creacionVariablesResumen();
      return;
    }
    this.modificarUsuario();
  }

  get fmu() {
    return this.modificarUsuarioForm.controls;
  }

}

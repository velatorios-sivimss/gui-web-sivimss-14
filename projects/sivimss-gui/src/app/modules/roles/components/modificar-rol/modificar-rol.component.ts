import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import { CATALOGO_NIVEL } from '../../../articulos/constants/dummies';
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {HttpErrorResponse} from "@angular/common/http";
import {RolService} from "../../services/rol.service";
import {Rol} from '../../models/rol.interface';
import {RespuestaModalRol} from "../../models/respuestaModal.interface";
import * as moment from 'moment'
import {MensajesSistemaService} from "../../../../services/mensajes-sistema.service";
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

type RolModificado = Omit<Rol, "password">

@Component({
  selector: 'app-modificar-rol',
  templateUrl: './modificar-rol.component.html',
  styleUrls: ['./modificar-rol.component.scss']
})
export class ModificarRolComponent implements OnInit {

  modificarRolForm!: FormGroup;
  rolModificado!: RolModificado;
  catalogo_nivelOficina!: TipoDropdown[];
  indice: number = 0;
  datosConfirmacion!: Rol;

  constructor(
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private rolService: RolService,
    private formBuilder: FormBuilder,
    private mensajesSistemaService: MensajesSistemaService
  ) { }

  ngOnInit(): void {
    const rol =  this.config.data;
    this.consultarCatalogoNiveles();
    this.inicializarModificarRolForm(rol);
  }

  inicializarModificarRolForm(rol:Rol): void {
    this.modificarRolForm = this.formBuilder.group({
      id: [{value: rol.idRol, disabled: true}, [Validators.required]],
      nombre: [{value: rol.desRol, disabled: false}, [Validators.required, Validators.maxLength(100)]],
      nivel: [{value: rol.nivelOficina, disabled: false}, [Validators.required]],
      estatus : [{value: rol.estatusRol, disabled: false}],
      fechaCreacion:[{value:rol.fCreacion, disabled:true}]
    });
  }

  crearUsuarioModificado(): any {
    return {
      idRol: this.modificarRolForm.get("id")?.value,
      desRol: this.modificarRolForm.get("nombre")?.value,
      nivel: this.modificarRolForm.get("nivel")?.value,
      estatusRol: this.modificarRolForm.get("estatus")?.value ? 1 : 0
    }
  }

  modificarRol(event?:boolean): void {
    if(!event){return}
    const respuesta: RespuestaModalRol = {mensaje: "Actualización satisfactoria", actualizar: true}
    this.rolModificado = this.crearUsuarioModificado();
    const solicitudUsuario = JSON.stringify(this.rolModificado);
    this.rolService.actualizar(solicitudUsuario).subscribe(
      (respuesta:HttpRespuesta<any>) => {
        const msg: string = this.mensajesSistemaService.obtenerMensajeSistemaPorId(parseInt(respuesta.mensaje));
        this.alertaService.mostrar(TipoAlerta.Exito, msg + " " + this.f.nombre.value );
        this.ref.close(respuesta)
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Actualización incorrecta');
        console.error("ERROR: ", error)
      }
    );
  }

  consultarCatalogoNiveles(): void {
    this.rolService.obtenerCatNivel().subscribe(
      (respuesta:TipoDropdown[]) => {
        this.catalogo_nivelOficina = respuesta.map((nivel: any) => ({label: nivel.label, value: nivel.value})) || [];
      }
    );
  }

  noEspaciosAlPrincipio(): void {
    this.f.nombre.setValue(
      this.f.nombre.value.trimStart()
    );
  }

  get f() {
    return this.modificarRolForm.controls;
  }

  cancelar(): void {
    const respuesta: RespuestaModalRol = {};
    this.ref.close(respuesta);
  }

  confirmarModificacion(): void {
    if (this.indice === 0) {
      this.indice++;
      this.datosConfirmacion = {
        desRol: this.f.nombre.value,
        fCreacion: this.f.fechaCreacion.value,
        nivelOficina: this.tomarNivel(),
        estatusRol: this.f.estatus.value,
        idRol: this.f.id.value
      }
    }
  }

  tomarNivel(): string {
    if(this.f.nivel.value == 1){return "CENTRAL"}
    if(this.f.nivel.value == 2){return "DELEGACIONAL"}
    if(this.f.nivel.value == 3){return "VELATORIOS"}
    return "";
  }
}

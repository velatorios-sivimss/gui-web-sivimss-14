import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Rol} from '../../models/rol.interface';
import {Funcionalidad} from '../../models/funcionalidad.interface';
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {HttpErrorResponse} from "@angular/common/http";
import {RolPermisosService} from "../../services/rol-permisos.service";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {RespuestaModalRol} from "projects/sivimss-gui/src/app/modules/roles-permisos/models/respuesta-modal.interface";
import {Catalogo} from 'projects/sivimss-gui/src/app/models/catalogos.interface';
import {ActivatedRoute} from '@angular/router';
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

type RolPermisosModificado = Omit<Funcionalidad, "password">

@Component({
  selector: 'app-modificar-rol-permisos',
  templateUrl: './modificar-rol-permisos.component.html',
  styleUrls: ['./modificar-rol-permisos.component.scss']
})
export class ModificarRolPermisosComponent implements OnInit {

  formFuncionalidad!: FormGroup;
  modificarRolPermisoForm!: FormGroup;
  rolPermisosModificado!: RolPermisosModificado;
  readonly POSICION_CATALOGO_ROL = 0;
  readonly POSICION_CATALOGO_FUNCIONALIDAD = 1;
  listaPermisos: any;
  permisos: any;
  rolPermisos: any = "";
  rolSeleccionado: any = "";

  catRol: TipoDropdown[] = [];
  catFuncionalidad: TipoDropdown[] = [];
  indice: number = 0;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private rolPermisosService: RolPermisosService,
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef
  ) {
  }

  ngOnInit(): void {
    const rolPermisos = this.config.data;
    this.inicializarModificarRolPermisoForm(rolPermisos);
    this.catalogoRoles();
  }

  inicializarModificarRolPermisoForm(rolPermisos: Rol): void {
    this.modificarRolPermisoForm = this.formBuilder.group({
      idRol: [{value: rolPermisos.idRol, disabled: true}, [Validators.required]],
      idFuncionalidad: [{value: rolPermisos.idFuncionalidad, disabled: true}, [Validators.required]],
      nombreFun: [{value: rolPermisos.funcionalidad, disabled: true}, [Validators.required]],
      alta: [{value: rolPermisos.permisos.includes('ALTA') ? true : false, disabled: false}, [Validators.required]],
      baja: [{value: rolPermisos.permisos.includes('BAJA') ? true : false, disabled: false}, [Validators.required]],
      aprobacion: [{
        value: rolPermisos.permisos.includes('APROBACIÓN') ? true : false,
        disabled: false
      }, [Validators.required]],
      consulta: [{
        value: rolPermisos.permisos.includes('CONSULTA') ? true : false,
        disabled: false
      }, [Validators.required]],
      modificar: [{
        value: rolPermisos.permisos.includes('MODIFICAR') ? true : false,
        disabled: false
      }, [Validators.required]],
      imprimir: [{
        value: rolPermisos.permisos.includes('IMPRIMIR') ? true : false,
        disabled: false
      }, [Validators.required]]
    });
    this.listaPermisos = rolPermisos.permisos;

  }

  crearRolPermisosModificado(): any {
    return {
      idRol: this.modificarRolPermisoForm.get("idRol")?.value,
      idFuncionalidad: this.modificarRolPermisoForm.get("idFuncionalidad")?.value,
      alta: this.modificarRolPermisoForm.get("alta")?.value,
      baja: this.modificarRolPermisoForm.get("baja")?.value,
      aprobacion: this.modificarRolPermisoForm.get("aprobacion")?.value,
      consulta: this.modificarRolPermisoForm.get("consulta")?.value,
      modificar: this.modificarRolPermisoForm.get("modificar")?.value,
      imprimir: this.modificarRolPermisoForm.get("imprimir")?.value
    };
  }

  modificarRolPermisos(): void {
    const respuesta: RespuestaModalRol = {mensaje: "Actualización satisfactoria", actualizar: true}
    this.permisos = "";
    this.permisos = this.rolPermisosModificado.alta == true ? this.permisos = "1," : this.permisos;
    this.permisos = this.rolPermisosModificado.baja == true ? this.permisos += "2," : this.permisos;
    this.permisos = this.rolPermisosModificado.consulta == true ? this.permisos += "3," : this.permisos;
    this.permisos = this.rolPermisosModificado.modificar == true ? this.permisos += "4," : this.permisos;
    this.permisos = this.rolPermisosModificado.aprobacion == true ? this.permisos += "5," : this.permisos;
    this.permisos = this.rolPermisosModificado.imprimir == true ? this.permisos += "6" : this.permisos;
    this.rolPermisos = {
      idRol: this.rolPermisosModificado.idRol,
      idFuncionalidad: this.rolPermisosModificado.idFuncionalidad,
      permisos: this.permisos
    }
    const solicitudRolPermisos = JSON.stringify(this.rolPermisos);
    this.rolPermisosService.actualizar(solicitudRolPermisos).subscribe({
      next: () => {
        this.ref.close(respuesta);
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Actualización incorrecta');
        console.error("ERROR: ", error)
      }
    });
  }

  catalogoRoles(): void {
    this.rolPermisosService.obtenerCatRoles().subscribe({
      next: (respuesta) => {
        this.catRol = respuesta!.datos.map((rol: Catalogo) => ({label: rol.des_rol, value: rol.id})) || [];
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  catalogoFuncionalidad(rolPermisos: Rol): void {
    this.rolSeleccionado = {
      idRol: rolPermisos.idRol,
    }
    const solicitudRolFuncionalidad = JSON.stringify(this.rolSeleccionado);
    this.rolPermisosService.obtenerCatFuncionalidad(solicitudRolFuncionalidad).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.catFuncionalidad = respuesta!.datos.map((funcionalidad: Catalogo) => ({
          label: funcionalidad.nombre,
          value: funcionalidad.id
        })) || [];
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  get fmu() {
    return this.modificarRolPermisoForm.controls;
  }

  cancelar(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
    const respuesta: RespuestaModalRol = {};
    this.ref.close(respuesta);
  }

  confirmarModificacion(): void {
    if (this.indice === 0) {
      this.indice++;
      this.rolPermisosModificado = this.crearRolPermisosModificado();
      this.modificarRolPermisos();
    }
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { OverlayPanel } from "primeng/overlaypanel";
import { Funcionalidad } from "projects/sivimss-gui/src/app/modules/roles/models/funcionalidad.interface";
import { AlertaService, TipoAlerta } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse} from "@angular/common/http";
import {CATALOGOS} from '../../../usuarios/constants/catalogos_dummies';
import {RolPermisosService} from '../../services/rol-permisos.service';
import {Rol} from "../../models/rol.interface";
import {Catalogo} from 'projects/sivimss-gui/src/app/models/catalogos.interface';
import {USUARIOS_BREADCRUMB} from '../../../usuarios/constants/breadcrumb';
import {HttpRespuesta} from "../../../../models/http-respuesta.interface";

type NuevoRol = Omit<Rol, "idRol" >;

@Component({
  selector: 'app-agregar-rol-permisos',
  templateUrl: './agregar-rol-permisos.component.html',
  styleUrls: ['./agregar-rol-permisos.component.scss']
})
export class AgregarRolPermisosComponent implements OnInit {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  readonly POSICION_CATALOGO_ROL = 0;
  readonly POSICION_CATALOGO_FUNCIONALIDAD = 1;
  rolSeleccionado: any="";
  rolPermisos: any="";
  opciones: TipoDropdown[] = CATALOGOS;
  catRol: TipoDropdown[] = [];
  catFuncionalidad: TipoDropdown[] = [];
  agregarRolForm!: FormGroup;
  modificarRolForm!: FormGroup;

  mostrarModalAgregarFunc: boolean = false;
  mostrarModalModificarFunc: boolean = false;

  formFuncionalidad!: FormGroup;
  permisos : any;

  funcionalidades: Funcionalidad[] = [];
  arregloFuncionalidades: Funcionalidad[] = [];
  funcionalidadSeleccionada!: Funcionalidad;
  nombrefuncionalidadSeleccionada!: Funcionalidad;
  idFuncionalidadSeleccionada !: Funcionalidad;
  contadorFuncionalidades = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private rolPermisosService: RolPermisosService,
    private alertaService: AlertaService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(USUARIOS_BREADCRUMB);
    this.inicializarAgregarRolForm();
    this.catalogoRoles();
  }

  inicializarAgregarRolForm(): void {
    this.agregarRolForm = this.formBuilder.group({
      rol: [{value: null, disabled: false}, [Validators.required]],
      funcionalidades: this.formBuilder.array([])
    });
  }

  agregarRolPermisos(): void {
     this.funcionalidades.forEach((funcionalidad: Funcionalidad) => {
      this.permisos="";
       this.permisos = funcionalidad.alta ? "1," : this.permisos;
       this.permisos += funcionalidad.baja ? "2," : this.permisos;
       this.permisos += funcionalidad.consulta ? "3," : this.permisos;
       this.permisos += funcionalidad.modificar ? "4," : this.permisos;
       this.permisos += funcionalidad.aprobacion ? "5," : this.permisos;
       this.permisos += funcionalidad.imprimir ? "6" : this.permisos;
      this.rolPermisos = {
          idRol: this.agregarRolForm.get("rol")?.value,
          idFuncionalidad:  funcionalidad.id,
          permisos: this.permisos
        }
       const solicitudRolPermisos = JSON.stringify(this.rolPermisos);
        this.rolPermisosService.guardar( solicitudRolPermisos).subscribe({
          next: () => {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Alta satisfactoria');
            this.router.navigate(["../"], { relativeTo: this.route });
          },
          error: (error: HttpErrorResponse) => {
            this.alertaService.mostrar(TipoAlerta.Error, 'Alta incorrecta');
            console.error("ERROR: ", error)
          }
        });
      })
  }

  abrirPanel(event: MouseEvent, funcionalidadSeleccionada: Funcionalidad): void {
    this.funcionalidadSeleccionada = funcionalidadSeleccionada;
    this.overlayPanel.toggle(event);
  }

  abrirModalAgregarFuncionalidad(): void {
    this.crearFormGroupFuncionalidad();
    this.mostrarModalAgregarFunc = true;
  }

  abrirModalModificarFuncionalidad(): void {
    this.formFuncionalidad = this.formBuilder.group({
      id: [{value: this.funcionalidadSeleccionada.id, disabled: true}],
      nombre: [{value: this.funcionalidadSeleccionada.nombre, disabled: false}],
      alta: [{value: this.funcionalidadSeleccionada.alta, disabled: false}],
      baja: [{value: this.funcionalidadSeleccionada.baja, disabled: false}],
      aprobacion: [{value: this.funcionalidadSeleccionada.aprobacion, disabled: false}],
      consulta: [{value: this.funcionalidadSeleccionada.consulta, disabled: false}],
      modificar: [{value: this.funcionalidadSeleccionada.modificar, disabled: false}],
      imprimir: [{value: this.funcionalidadSeleccionada.imprimir, disabled: false}],
    });
    this.mostrarModalModificarFunc = true;
  }

  crearFormGroupFuncionalidad(): void {
    this.formFuncionalidad = this.formBuilder.group({
      id: [{value: null, disabled: false}, [Validators.required]],
      nombre: [{value: null, disabled: false}],
      alta: [{value: false, disabled: false}],
      baja: [{value: false, disabled: false}],
      aprobacion: [{value: false, disabled: false}],
      consulta: [{value: false, disabled: false}],
      modificar: [{value: false, disabled: false}],
      imprimir: [{value: false, disabled: false}],
    });
  }

   agregarFuncionalidad(funcionalidadSeleccionada :any): void {
    const hasValue = this.funcionalidades.some(funcionalidad => funcionalidad.id === this.formFuncionalidad.getRawValue().id.value);
    if(hasValue){
      this.alertaService.mostrar(TipoAlerta.Error, 'Funcionalidad agregada');
      return
    }
    this.formFuncionalidad = this.formBuilder.group({
      id: funcionalidadSeleccionada.value,
      nombre: funcionalidadSeleccionada.label,
      alta: this.formFuncionalidad.get("alta")?.value,
      baja:  this.formFuncionalidad.get("baja")?.value,
      aprobacion:  this.formFuncionalidad.get("aprobacion")?.value,
      consulta:  this.formFuncionalidad.get("consulta")?.value,
      modificar:  this.formFuncionalidad.get("modificar")?.value,
      imprimir:  this.formFuncionalidad.get("imprimir")?.value,
    });

    this.formArrayFuncionalidades.push(this.formFuncionalidad);
    this.funcionalidades = this.obtenerFuncionalidadesDeFormArray();
    this.mostrarModalAgregarFunc = false;
  }

  modificarFuncionalidad(): void {
    let indiceFuncionalidad: number = this.buscarIndiceFuncionalidadEnFormArray();
    this.formFuncionalidad = this.formBuilder.group({
      id:  this.formFuncionalidad.get("id")?.value,
      nombre:  this.funcionalidadSeleccionada.nombre,
      alta: this.formFuncionalidad.get("alta")?.value,
      baja:  this.formFuncionalidad.get("baja")?.value,
      aprobacion:  this.formFuncionalidad.get("aprobacion")?.value,
      consulta:  this.formFuncionalidad.get("consulta")?.value,
      modificar:  this.formFuncionalidad.get("modificar")?.value,
      imprimir:  this.formFuncionalidad.get("imprimir")?.value,
    });

    this.reemplazarFuncionalidadEnFormArray(indiceFuncionalidad, this.formFuncionalidad);
    this.funcionalidades = this.obtenerFuncionalidadesDeFormArray();
    this.mostrarModalModificarFunc = false;
  }

  eliminarFuncionalidad(): void {
    this.funcionalidades= this.funcionalidades.filter(
    (listaFun:any) => listaFun.id !== this.funcionalidadSeleccionada.id);
    let indiceFuncionalidad: number = this.buscarIndiceFuncionalidad();
    this.formArrayFuncionalidades.removeAt(indiceFuncionalidad);
  }

  reemplazarFuncionalidadEnFormArray(indice: number, formGroup: FormGroup) {
    this.formArrayFuncionalidades.setControl(indice, formGroup);
  }

  buscarIndiceFuncionalidad(): number {
    return this.formArrayFuncionalidades.controls.findIndex((control: AbstractControl) => control.value.id === this.funcionalidadSeleccionada.id);
  }

  buscarIndiceFuncionalidadEnFormArray(): number {
    return this.formArrayFuncionalidades.controls.findIndex((control: AbstractControl) => control.value.id === this.funcionalidadSeleccionada.id);
  }

  obtenerFuncionalidadesDeFormArray(): Funcionalidad[] {
    return this.formArrayFuncionalidades.controls.map((formGroup: AbstractControl) => formGroup.value as Funcionalidad);
  }

  catalogoRoles(): void {
    this.rolPermisosService.obtenerCatRoles().subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.catRol = respuesta.datos.map((rol: Catalogo) => ({label: rol.des_rol, value: rol.id})) || [];
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  catalogoFuncionalidad(e: Event): void {
    this.rolSeleccionado = {
      idRol: this.agregarRolForm.get("rol")?.value
    }
    const solicitudRolFuncionalidad = JSON.stringify(this.rolSeleccionado);
    this.rolPermisosService.obtenerCatFuncionalidad(solicitudRolFuncionalidad).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        this.catFuncionalidad = respuesta.datos.map((funcionalidad: Catalogo) => ({label: funcionalidad.nombre, value: funcionalidad.id})) || [];
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.alertaService.mostrar(TipoAlerta.Error, error.message);
      }
    });
  }

  get f() {
    return this.agregarRolForm.controls;
  }

  get funcionalidad() {
    return this.formFuncionalidad.controls;
  }

  get formArrayFuncionalidades() {
    return this.agregarRolForm.controls.funcionalidades as FormArray;
  }

}

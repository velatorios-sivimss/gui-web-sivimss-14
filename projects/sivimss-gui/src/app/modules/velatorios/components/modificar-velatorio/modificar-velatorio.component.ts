import {Component, OnInit} from '@angular/core';
import {Velatorio} from "../../models/velatorio.interface";
import {DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TipoDropdown} from "../../../../models/tipo-dropdown";
import {HttpErrorResponse} from "@angular/common/http";
import {AlertaService, TipoAlerta} from "../../../../shared/alerta/services/alerta.service";
import {VelatorioService} from "../../services/velatorio.service";
import {RespuestaModalUsuario} from "../../../usuarios/models/respuestaModal.interface";
import {ValorCP} from "../../models/valorCp.interface";
import {LoaderService} from "../../../../shared/loader/services/loader.service";
import {finalize} from "rxjs/operators";
import {CATALOGO_ASIGNACIONES} from "../../constants/catalogos";

type VelatorioModificado =
  Omit<Velatorio, "desMunicipio" | "desEstado" | "salasEmbalsamamiento" | "salasCremacion" | "capillas"
    | "administrador" | "desColonia" | "estatus" | "desDelegacion" | "cveCp" | "idCp">
  | { indEstatus: number }

@Component({
  selector: 'app-modificar-velatorio',
  templateUrl: './modificar-velatorio.component.html',
  styleUrls: ['./modificar-velatorio.component.scss']
})
export class ModificarVelatorioComponent implements OnInit {

  indice: number = 0;
  delegacion: number = 0;

  velatorioForm!: FormGroup;
  velatorioSeleccionado!: Velatorio;

  asignaciones: TipoDropdown[] = CATALOGO_ASIGNACIONES;
  colonias: TipoDropdown[] = [];

  nuevoVelatorio!: Velatorio;

  constructor(private alertaService: AlertaService,
              private formBuilder: FormBuilder,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig,
              private velatorioService: VelatorioService,
              private cargadorService: LoaderService) {
    this.velatorioSeleccionado = this.config.data;
    this.inicializarFormVelatorio(this.velatorioSeleccionado)
  }

  ngOnInit(): void {
  }

  inicializarFormVelatorio(velatorio: Velatorio): void {
    this.velatorioForm = this.formBuilder.group({
      idVelatorio: [{value: velatorio.idVelatorio, disabled: true}],
      nomVelatorio: [{value: velatorio.nomVelatorio, disabled: false}, [Validators.required]],
      administrador: [{value: velatorio.administrador, disabled: true}, [Validators.required]],
      nomRespoSanitario: [{value: velatorio.nomRespoSanitario, disabled: false}, [Validators.required]],
      capillas: [{value: velatorio.capillas, disabled: true}, [Validators.required]],
      salasCremacion: [{value: velatorio.salasCremacion, disabled: true}, [Validators.required]],
      salasEmbalsamamiento: [{value: velatorio.salasEmbalsamamiento, disabled: true}, [Validators.required]],
      asignacion: [{value: velatorio.cveAsignacion, disabled: false}, [Validators.required]],
      codigoPostal: [{value: velatorio.cveCp, disabled: false}, [Validators.required]],
      desCalle: [{value: velatorio.desCalle, disabled: false}, [Validators.required]],
      numExterior: [{value: velatorio.numExterior, disabled: false}, [Validators.required]],
      desColonia: [{value: velatorio.idCp, disabled: false}, [Validators.required]],
      desMunicipio: [{value: velatorio.desMunicipio, disabled: true}, [Validators.required]],
      desEstado: [{value: velatorio.desEstado, disabled: true}, [Validators.required]],
      numTelefono: [{value: velatorio.numTelefono, disabled: false}, [Validators.required]],
      estatus: [{value: velatorio.estatus, disabled: false}, [Validators.required]],
    });
    this.delegacion = velatorio.idDelegacion;
    this.buscarCP(true);
  }

  cancelarModificacion(): void {
    if (this.indice === 1) {
      this.indice--;
      return;
    }
    this.ref.close();
  }

  buscarCP(carga: boolean = false): void {
    const cp = this.velatorioForm.get("codigoPostal")?.value;
    if (!cp) return;
    this.cargadorService.activar();
    this.velatorioService.obtenerCP(cp)
      .pipe(finalize(() => this.cargadorService.desactivar()))
      .subscribe(
        (respuesta) => {
          const {datos} = respuesta;
          if (carga) {
            this.colonias = datos.map((d: ValorCP) => ({value: d.idCodigoPostal, label: d.colonia}));
            return;
          }
          if (datos.length === 0 || !datos) {
            this.limpiarCP();
          }
          const {estado, municipio} = datos[0];
          this.colonias = datos.map((d: ValorCP) => ({value: d.idCodigoPostal, label: d.colonia}))
          this.velatorioForm.get("desMunicipio")?.patchValue(municipio);
          this.velatorioForm.get("desEstado")?.patchValue(estado);
          this.velatorioForm.get("desColonia")?.patchValue("");
          this.velatorioForm.get("desColonia")?.enable()
        },
        (error: HttpErrorResponse) => {
          this.alertaService.mostrar(TipoAlerta.Error, 'Alta incorrecta');
          console.error("ERROR: ", error);
        }
      );
  }

  limpiarCP(): void {
    this.velatorioForm.get("desMunicipio")?.patchValue("");
    this.velatorioForm.get("desEstado")?.patchValue("");
    this.velatorioForm.get("desColonia")?.patchValue("");
    this.velatorioForm.get("desColonia")?.disable();
    this.colonias = [];
  }

  confirmarModificacion(): void {
    if (this.indice === 0) {
      this.indice++;
      this.nuevoVelatorio = this.crearVelatorio();
      return;
    }
    this.modificarVelatorio();
  }

  modificarVelatorio(): void {
    const respuesta: RespuestaModalUsuario = {mensaje: "Actualización satisfactoria", actualizar: true};
    const velatorioModificado = this.crearVelatorioModificado();
    this.velatorioService.actualizar(velatorioModificado).subscribe(
      () => {
        this.ref.close(respuesta);
      },
      (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Actualización incorrecta');
        console.error("ERROR: ", error)
      }
    );

  }

  crearVelatorio(): Velatorio {
    const cpId = this.velatorioForm.get("desColonia")?.value;
    const colonia: string = this.colonias.find(c => c.value === cpId)?.label || "";
    return {
      administrador: "",
      capillas: 0,
      cveAsignacion: this.velatorioForm.get("asignacion")?.value,
      cveCp: this.velatorioForm.get("codigoPostal")?.value,
      desCalle: this.velatorioForm.get("desCalle")?.value,
      desColonia: colonia,
      desDelegacion: "",
      desEstado: this.velatorioForm.get("desEstado")?.value,
      desMunicipio: this.velatorioForm.get("desMunicipio")?.value,
      estatus: true,
      idCodigoPostal: 0,
      idDelegacion: 0,
      idVelatorio: this.velatorioForm.get("idVelatorio")?.value,
      nomRespoSanitario: this.velatorioForm.get("nomRespoSanitario")?.value,
      nomVelatorio: this.velatorioForm.get("nomVelatorio")?.value,
      numExterior: this.velatorioForm.get("numExterior")?.value,
      numTelefono: this.velatorioForm.get("numTelefono")?.value,
      salasCremacion: 0,
      salasEmbalsamamiento: 0,
      idCp: 0
    }
  }

  crearVelatorioModificado(): VelatorioModificado {
    return {
      desCalle: this.velatorioForm.get("desCalle")?.value,
      idCodigoPostal: this.velatorioForm.get("desColonia")?.value,
      idDelegacion: this.delegacion,
      cveAsignacion: +this.velatorioForm.get('asignacion')?.value,
      idVelatorio: this.velatorioForm.get("idVelatorio")?.value,
      indEstatus: this.velatorioForm.get("estatus")?.value ? 1 : 0,
      nomRespoSanitario: this.velatorioForm.get("nomRespoSanitario")?.value,
      nomVelatorio: this.velatorioForm.get("nomVelatorio")?.value,
      numExterior: this.velatorioForm.get("numExterior")?.value,
      numTelefono: this.velatorioForm.get("numTelefono")?.value
    }
  }

  get formV() {
    return this.velatorioForm?.controls;
  }
}

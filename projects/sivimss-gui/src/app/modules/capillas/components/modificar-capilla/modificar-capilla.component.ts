import {CapillaService} from '../../services/capilla.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {DynamicDialogConfig, DynamicDialogRef} from 'primeng/dynamicdialog';
import {AlertaService, TipoAlerta} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {Capilla} from '../../models/capilla.interface';
import {RespuestaModalcapilla} from '../../models/respuesta-modal-capilla.interface';
import {OverlayPanel} from 'primeng/overlaypanel';
import {ConfirmacionServicio} from '../../../servicios/models/servicio.interface';

type capillaModificada = Omit<Capilla, "id">

@Component({
  selector: 'app-modificar-capilla',
  templateUrl: './modificar-capilla.component.html',
  styleUrls: ['./modificar-capilla.component.scss']
})
export class ModificarCapillaComponent implements OnInit {


  @Input() capillaSeleccionada!: Capilla;
  @Input() origen!: string;
  @Output() confirmacionAceptar = new EventEmitter<ConfirmacionServicio>();
  creacionRef!: DynamicDialogRef;

  @ViewChild(OverlayPanel)
  overlayPanel: OverlayPanel | undefined;
  ventanaConfirmacion: boolean = false;

  modificarcapillaForm!: FormGroup;
  areaTotal: any;
  alt: any;
  anch: any;

  velatorios: any[] = [
    {
      label: 'Opción 1',
      value: 1,
    },
    {
      label: 'Opción 2',
      value: 2,
    },
    {
      label: 'Opción 3',
      value: 3,
    }
  ];

  indice: number = 0;


  capillas: Capilla = {};


  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private capillaService: CapillaService,
    private alertaService: AlertaService,
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {
  }

  ngOnInit(): void {
    if (this.config?.data) {
      this.origen = this.config.data.origen;
      if (this.origen == 'modificar') {
        this.capillaSeleccionada = this.config.data.capilla;
      }
    }
    this.alt = this.capillaSeleccionada.alto
    this.anch = this.capillaSeleccionada.largo
    this.areaTotal = this.alt * this.anch
    this.inicializarAgregarCapillaForm(this.capillaSeleccionada);

  }


  inicializarAgregarCapillaForm(capillaSeleccionada: Capilla) {
    this.modificarcapillaForm = this.formBuilder.group({
      idCapilla: [{value: capillaSeleccionada.idCapilla, disabled: true}],
      nombre: [{value: capillaSeleccionada.nombre, disabled: false}, [Validators.required]],
      capacidad: [{value: capillaSeleccionada.capacidad, disabled: false}, [Validators.required]],
      idVelatorio: [{value: capillaSeleccionada.idVelatorio, disabled: false}, [Validators.required]],
      alto: [{value: capillaSeleccionada.alto, disabled: false}, [Validators.required]],
      largo: [{value: capillaSeleccionada.largo, disabled: false}, [Validators.required]],
      // ancho: [{value: capillaSeleccionada.ancho, disabled: false}, [Validators.required]],
      areaTotal: [{value: this.areaTotal, disabled: false}, [Validators.required]]
    });
  }


  crearCapillaModificada(): capillaModificada {
    return {
      idCapilla: this.modificarcapillaForm.get("idCapilla")?.value,
      nombre: this.modificarcapillaForm.get('nombre')?.value,
      capacidad: parseInt(this.modificarcapillaForm.get("capacidad")?.value),
      idVelatorio: parseInt(this.modificarcapillaForm.get("idVelatorio")?.value),
      largo: parseInt(this.modificarcapillaForm.get("largo")?.value),
      alto: parseInt(this.modificarcapillaForm.get("alto")?.value),
      //  ancho: parseInt(this.modificarcapillaForm.get("ancho")?.value),
      areaTotal: this.modificarcapillaForm.get("areaTotal")?.value,
    }
  }

  crearCapillaParaDetalle(): void {
    this.capillas = {
      // idCapilla: this.agregarCapillaForm.get("id")?.value,
      nombre: this.modificarcapillaForm.get('nombre')?.value,
      capacidad: parseInt(this.modificarcapillaForm.get("capacidad")?.value),
      idVelatorio: parseInt(this.modificarcapillaForm.get("idVelatorio")?.value),
      largo: parseInt(this.modificarcapillaForm.get("largo")?.value),
      alto: parseInt(this.modificarcapillaForm.get("alto")?.value),
      ancho: parseInt(this.modificarcapillaForm.get("ancho")?.value),
      areaTotal: this.modificarcapillaForm.get("areaTotal")?.value,
      velatorio: this.modificarcapillaForm.get('areaTotal')?.value,
    }
  }


  abrirModalDetalleCapilla() {
    this.ventanaConfirmacion = true
    this.crearCapillaParaDetalle();
  }


  modificarCapilla(): void {
    const respuesta: RespuestaModalcapilla = {mensaje: "Actualización satisfactoria", actualizar: true}
    const solicitudCapilla = JSON.stringify(this.crearCapillaModificada());
    console.log('capilla para modificar__:' + solicitudCapilla)
    this.capillaService.actualizar2(solicitudCapilla).subscribe({
      next: () => {
        this.ref.close(respuesta)
      },
      error: (error: HttpErrorResponse) => {
        this.alertaService.mostrar(TipoAlerta.Error, 'Actualización incorrecta');
        console.error("ERROR: ", error)
      }
    });
  }

  cerrar() {
    this.ref.close();
  }


  get fmc() {
    return this.modificarcapillaForm.controls;
  }


}

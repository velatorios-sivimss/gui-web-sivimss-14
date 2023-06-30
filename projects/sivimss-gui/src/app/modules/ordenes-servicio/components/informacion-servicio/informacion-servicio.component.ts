import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DialogService } from "primeng/dynamicdialog";
import { ModalAgregarAtaudComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-ataud/modal-agregar-ataud.component";
import { ModalAgregarPanteonComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-panteon/modal-agregar-panteon.component";
import { ModalSeleccionarBeneficiarioComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-seleccionar-beneficiario/modal-seleccionar-beneficiario.component";
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import { GestionarEtapasService } from '../../services/gestionar-etapas.service';

@Component({
  selector: 'app-informacion-servicio',
  templateUrl: './informacion-servicio.component.html',
  styleUrls: ['./informacion-servicio.component.scss']
})
export class InformacionServicioComponent implements OnInit {

  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();
  form!: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder,
    private dialogService: DialogService,
    private gestionarEtapasService: GestionarEtapasService
  ) { }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      lugarVelacion:  this.formBuilder.group({
        capilla: [{value: null, disabled: false}, [Validators.required]],
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]],
        calle: [{value: null, disabled: false}, [Validators.required]],
        exterior: [{value: null, disabled: false}, [Validators.required]],
        interior: [{value: null, disabled: false}, [Validators.required]],
        cp: [{value: null, disabled: false}, [Validators.required]],
        colonia: [{value: null, disabled: false}, [Validators.required]],
        municipio: [{value: null, disabled: false}, [Validators.required]],
        estado: [{value: null, disabled: false}, [Validators.required]]
      }),
      lugarCremacion:  this.formBuilder.group({
        sala: [{value: null, disabled: false}, [Validators.required]],
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]]
      }),
      inhumacion:  this.formBuilder.group({
        agregarPanteon: [{value: null, disabled: false}, [Validators.required]]
      }),
      recoger:  this.formBuilder.group({
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]]
      }),
      instalacionServicio:  this.formBuilder.group({
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]]
      }),
      cortejo:  this.formBuilder.group({
        fecha: [{value: null, disabled: false}, [Validators.required]],
        hora: [{value: null, disabled: false}, [Validators.required]],
        gestionadoPorPromotor: [{value: null, disabled: false}, [Validators.required]]
      })
    });
  }

  abrirModalAgregarPanteon():void{
    const ref = this.dialogService.open(ModalAgregarPanteonComponent, {
      header: 'Agregar panteón',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: '' //Pasa info a ModalAgregarPanteonComponent
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) { //Obtener info cuando se cierre el modal en ModalAgregarPanteonComponent
      }
    });
  }

  regresar() {
    let etapas: Etapa[] = [
      {
        idEtapa: 0,
        estado: EtapaEstado.Completado,
        textoInterior: '1',
        textoExterior: 'Datos del contratante',
        lineaIzquierda: {
          mostrar: false,
          estilo: "solid"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "dashed"
        }
      },
      {
        idEtapa: 1,
        estado: EtapaEstado.Completado,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
        lineaIzquierda: {
          mostrar: true,
          estilo: "dashed"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "dashed"
        }
      },
      {
        idEtapa: 2,
        estado: EtapaEstado.Activo,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
        lineaIzquierda: {
          mostrar: true,
          estilo: "dashed"
        },
        lineaDerecha: {
          mostrar: true,
          estilo: "solid"
        }
      },
      {
        idEtapa: 3,
        estado: EtapaEstado.Inactivo,
        textoInterior: '4',
        textoExterior: 'Información del servicio',
        lineaIzquierda: {
          mostrar: true,
          estilo: "solid"
        },
        lineaDerecha: {
          mostrar: false,
          estilo: "solid"
        }
      }
    ];
    window.scrollTo(0,0);
    this.gestionarEtapasService.etapas$.next(etapas);
    this.seleccionarEtapa.emit(2);
  }

  get lugarVelacion() {
    return (this.form.controls['lugarVelacion'] as FormGroup).controls;
  }

  get lugarCremacion() {
    return (this.form.controls['lugarCremacion'] as FormGroup).controls;
  }

  get recoger() {
    return (this.form.controls['recoger'] as FormGroup).controls;
  }

  get instalacionServicio() {
    return (this.form.controls['instalacionServicio'] as FormGroup).controls;
  }

  get inhumacion() {
    return (this.form.controls['inhumacion'] as FormGroup).controls;
  }

  get cortejo() {
    return (this.form.controls['cortejo'] as FormGroup).controls;
  }

}

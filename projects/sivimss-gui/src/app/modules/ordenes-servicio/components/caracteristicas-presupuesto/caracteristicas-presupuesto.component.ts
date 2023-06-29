import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DialogService } from "primeng/dynamicdialog";
import { OverlayPanel } from "primeng/overlaypanel";
import { ModalAgregarAlPaqueteComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-al-paquete/modal-agregar-al-paquete.component";
import { ModalAgregarAlPresupuestoComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-al-presupuesto/modal-agregar-al-presupuesto.component";
import { ModalAgregarServicioComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-agregar-servicio/modal-agregar-servicio.component";
import { ModalVerKilometrajeComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-ver-kilometraje/modal-ver-kilometraje.component";
import { EtapaEstado } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa-estado.enum';
import { Etapa } from 'projects/sivimss-gui/src/app/shared/etapas/models/etapa.interface';
import { GestionarEtapasService } from '../../services/gestionar-etapas.service';

@Component({
  selector: 'app-caracteristicas-presupuesto',
  templateUrl: './caracteristicas-presupuesto.component.html',
  styleUrls: ['./caracteristicas-presupuesto.component.scss']
})
export class CaracteristicasPresupuestoComponent implements OnInit {

  @Output()
  seleccionarEtapa: EventEmitter<number> = new EventEmitter<number>();
  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  paqueteSeleccionado: any;
  form!: FormGroup;

  mostrarModalAgregarAtaud: boolean = false;
  formAgregarAtaud!: FormGroup;

  paquetes: any[] = [
    {
      id: 0,
      noConsecutivo: '1029384',
      grupo: 'Traslado',
      concepto: 'Traslado nacional',
      cantidad: 1,
      importe: '$6,000.00',
      proveedor: 'Logística y movilidad S.A. de C.V.',
      totalPaquete: '$7,000.00',
      deseaUtilizarArtServ: true
    },
    {
      id: 1,
      noConsecutivo: '5463723',
      grupo: 'Cremación',
      concepto: 'Cremación familiar',
      cantidad: 1,
      importe: '$3,000.00',
      proveedor: 'Logística y movilidad S.A. de C.V.',
      totalPaquete: '$4,000.00',
      deseaUtilizarArtServ: true
    },
    {
      id: 2,
      noConsecutivo: '4534664',
      grupo: 'Ataúd',
      concepto: 'Ataúd',
      cantidad: 1,
      importe: '$4,000.00',
      proveedor: 'Logística y movilidad S.A. de C.V.',
      totalPaquete: '$7,000.00',
      deseaUtilizarArtServ: true
    }
  ]

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private gestionarEtapasService: GestionarEtapasService
  ) {
  }

  ngOnInit(): void {
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.form = this.formBuilder.group({
      observaciones: [{value: null, disabled: false}, [Validators.required]],
      notasServicio: [{value: null, disabled: false}, [Validators.required]]
    });
  }

  abrirPanel(event: MouseEvent, paqueteSeleccionado: any): void {
    this.paqueteSeleccionado = paqueteSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalAgregarAlPrespuesto(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarAlPresupuestoComponent, {
      header: 'Agregar a presupuesto',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: ''
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
      }
    });
  }

  abrirModalAgregarAlPaquete(event: MouseEvent) {
    event.stopPropagation();
    const ref = this.dialogService.open(ModalAgregarAlPaqueteComponent, {
      header: 'Agregar a paquete',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: ''
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) {
      }
    });
  }

  abrirModalAgregarAtaud(): void {
    this.formAgregarAtaud = this.formBuilder.group({
      ataud: [{value: null, disabled: false}, [Validators.required]],
      proveedor: [{value: null, disabled: false}, [Validators.required]]
    });
    this.mostrarModalAgregarAtaud = true;
  }


  abrirModalAgregarServicio() {
    const ref = this.dialogService.open(ModalAgregarServicioComponent, {
      header: 'Agregar servicio',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: '' //Pasa info a ModalVerTarjetaIdentificacionComponent
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) { //Obtener info cuando se cierre el modal en ModalVerTarjetaIdentificacionComponent
      }
    });
  }

  abrirModalVerKm(): void {
    const ref = this.dialogService.open(ModalVerKilometrajeComponent, {
      header: 'Ver kilometraje',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: '' //Pasa info a ModalVerKilometrajeComponent
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) { //Obtener info cuando se cierre el modal en ModalVerKilometrajeComponent
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
        estado: EtapaEstado.Activo,
        textoInterior: '2',
        textoExterior: 'Datos del finado',
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
        idEtapa: 2,
        estado: EtapaEstado.Inactivo,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
        lineaIzquierda: {
          mostrar: true,
          estilo: "solid"
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
    this.seleccionarEtapa.emit(1);
  }
  
  continuar() {
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
        estado: EtapaEstado.Completado,
        textoInterior: '3',
        textoExterior: 'Características del presupuesto',
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
        idEtapa: 3,
        estado: EtapaEstado.Activo,
        textoInterior: '4',
        textoExterior: 'Información del servicio',
        lineaIzquierda: {
          mostrar: true,
          estilo: "dashed"
        },
        lineaDerecha: {
          mostrar: false,
          estilo: "solid"
        }
      }
    ];
    window.scrollTo(0,0);
    this.gestionarEtapasService.etapas$.next(etapas);
    this.seleccionarEtapa.emit(3);
    console.log("INFO A GUARDAR STEP 3: ", this.form.value);
  }

  get f() {
    return this.form.controls;
  }



}

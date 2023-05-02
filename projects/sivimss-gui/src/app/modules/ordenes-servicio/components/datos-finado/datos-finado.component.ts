import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DialogService } from "primeng/dynamicdialog";
import { ModalGenerarTarjetaIdentificacionComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-generar-tarjeta-identificacion/modal-generar-tarjeta-identificacion.component";
import { ModalSeleccionarBeneficiarioComponent } from "projects/sivimss-gui/src/app/modules/ordenes-servicio/components/modal-seleccionar-beneficiario/modal-seleccionar-beneficiario.component";
import { AlertaService } from "projects/sivimss-gui/src/app/shared/alerta/services/alerta.service";
import { BreadcrumbService } from "projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service";

@Component({
  selector: 'app-datos-finado',
  templateUrl: './datos-finado.component.html',
  styleUrls: ['./datos-finado.component.scss']
})
export class DatosFinadoComponent implements OnInit {

  form!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private alertaService: AlertaService,
    private breadcrumbService: BreadcrumbService,
    private dialogService: DialogService
  ) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar([
      {
        icono: 'imagen-icono-operacion-sivimss.svg',
        titulo: 'Operación SIVIMSS'
      },
      {
        icono: '',
        titulo: 'Órdenes de servicio'
      }
    ]);
    this.inicializarForm();
  }

  inicializarForm(): void {

    this.form = this.formBuilder.group({
      datosFinado: this.formBuilder.group({
        tipoOrden: [{value: null, disabled: false}, [Validators.required]],
        noContrato: [{value: null, disabled: false}, [Validators.required]],
        velatorioPrevision: [{value: null, disabled: false}, [Validators.required]],
        esObito: [{value: null, disabled: false}, [Validators.required]],
        esParaExtremidad: [{value: null, disabled: false}, [Validators.required]],
        matricula: [{value: null, disabled: false}, [Validators.required]],
        curp: [{value: null, disabled: false}, [Validators.required]],
        nss: [{value: null, disabled: false}, [Validators.required]],
        fechaNacimiento: [{value: null, disabled: false}, [Validators.required]],
        edad: [{value: null, disabled: false}, [Validators.required]],
        sexo: [{value: null, disabled: false}, [Validators.required]],
        nacionalidad: [{value: null, disabled: false}, [Validators.required]],
        fechaDefuncion: [{value: null, disabled: false}, [Validators.required]],
        causaDeceso: [{value: null, disabled: false}, [Validators.required]],
        lugarDeceso: [{value: null, disabled: false}, [Validators.required]],
        horaDeceso: [{value: null, disabled: false}, [Validators.required]],
        clinicaAdscripcion: [{value: null, disabled: false}, [Validators.required]],
        unidadProcedencia: [{value: null, disabled: false}, [Validators.required]],
        procedenciaFinado: [{value: null, disabled: false}, [Validators.required]],
        tipoPension: [{value: null, disabled: false}, [Validators.required]]
      }),
      direccion: this.formBuilder.group({
        calle: [{value: null, disabled: false}, [Validators.required]],
        noExterior: [{value: null, disabled: false}, [Validators.required]],
        noInterior: [{value: null, disabled: true}, [Validators.required]],
        cp: [{value: null, disabled: false}, [Validators.required]],
        colonia: [{value: null, disabled: false}, [Validators.required]],
        municipio: [{value: null, disabled: false}, [Validators.required]],
        estado: [{value: null, disabled: false}, [Validators.required]]
      })
    });

    console.log(this.form);
  }

  abrirModalSeleccionBeneficiarios():void{
    const ref = this.dialogService.open(ModalSeleccionarBeneficiarioComponent, {
      header: 'Seleccionar beneficiario',
      style: {maxWidth: '876px', width: '100%'},
      data: {
        dummy: '' //Pasa info a ModalSeleccionarBeneficiarioComponent
      }
    });
    ref.onClose.subscribe((val: boolean) => {
      if (val) { //Obtener info cuando se cierre el modal en ModalSeleccionarBeneficiarioComponent
      }
    });
  }

  get datosFinado() {
    return (this.form.controls['datosFinado'] as FormGroup).controls;
  }

  get direccion() {
    return (this.form.controls['direccion'] as FormGroup).controls;
  }

}

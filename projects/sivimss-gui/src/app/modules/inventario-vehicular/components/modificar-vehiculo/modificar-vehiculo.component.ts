// TODO: Revisar si el figma esta mal o se hace un stepper arriba en el 0 y uno abajo en el 1
// Eliminar catalogos dummies
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MENU_STEPPER } from '../../constants/menu-stepper';
import { Vehiculo } from '../../models/vehiculo.interface';
import { TipoDropdown } from '../../../../models/tipo-dropdown';
import { CATALOGOS_DUMMIES } from '../../constants/dummies';

@Component({
  selector: 'app-modificar-vehiculo',
  templateUrl: './modificar-vehiculo.component.html',
  styleUrls: ['./modificar-vehiculo.component.scss']
})
export class ModificarVehiculoComponent implements OnInit {

  menuStep: MenuItem[] = MENU_STEPPER;
  indice: number = 0;
  id: string = '';

  responsables: TipoDropdown[] = CATALOGOS_DUMMIES;
  tiposVehiculo: TipoDropdown[] = CATALOGOS_DUMMIES;
  usos: TipoDropdown[] = CATALOGOS_DUMMIES;
  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES;
  numerosSerie: TipoDropdown[] = CATALOGOS_DUMMIES;

  datosGeneralesForm!: FormGroup;
  datosDocumentacionForm!: FormGroup;
  vehiculoModificado!: Vehiculo;

  constructor(public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private formBuilder: FormBuilder) {
    const vehiculoSeleccionado = this.config.data;
    this.id = vehiculoSeleccionado.id;
    this.inicializarFormDatosGenerales(vehiculoSeleccionado);
    this.inicializarFormDatosDocumentacion(vehiculoSeleccionado);
  }

  ngOnInit(): void { }

  inicializarFormDatosGenerales(vehiculoSeleccionado: Vehiculo): void {
    // TODO: Al implementar verificar que descripcion es la que se carga
    this.datosGeneralesForm = this.formBuilder.group({
      id: [{ value: vehiculoSeleccionado.id, disabled: true }],
      velatorio: [{ value: vehiculoSeleccionado.velatorio, disabled: false }, [Validators.required]],
      uso: [{ value: vehiculoSeleccionado.uso, disabled: false }, [Validators.required]],
      responsable: [{ value: vehiculoSeleccionado.responsable, disabled: false }, [Validators.required]],
      tipoVehiculo: [{ value: vehiculoSeleccionado.tipoVehiculo, disabled: false }, [Validators.required]],
      marca: [{ value: vehiculoSeleccionado.marca, disabled: false }, [Validators.required]],
      submarca: [{ value: vehiculoSeleccionado.submarca, disabled: false }, [Validators.required]],
      modelo: [{ value: vehiculoSeleccionado.modelo, disabled: false }, [Validators.required]],
      placas: [{ value: vehiculoSeleccionado.placas, disabled: false }, [Validators.required]],
      noMotor: [{ value: vehiculoSeleccionado.noMotor, disabled: false }, [Validators.required]],
      noCilindros: [{ value: vehiculoSeleccionado.noCilindros, disabled: false }, [Validators.required]],
      transmision: [{ value: vehiculoSeleccionado.transmision, disabled: false }, [Validators.required]],
      desTransmision: [{ value: vehiculoSeleccionado.desTransmision, disabled: false }, [Validators.required]],
      combustible: [{ value: vehiculoSeleccionado.combustible, disabled: false }, [Validators.required]],
      desCombustible: [{ value: vehiculoSeleccionado.desCombustible, disabled: false }, [Validators.required]],
    });
  }

  inicializarFormDatosDocumentacion(vehiculoSeleccionado: Vehiculo): void {
    this.datosDocumentacionForm = this.formBuilder.group({
      tarjetaCirculacion: [{ value: vehiculoSeleccionado.tarjetaCirculacion, disabled: false }, [Validators.required]],
      vigenciaTarjetaInicio: [{ value: vehiculoSeleccionado.vigenciaTarjetaInicio, disabled: false }, [Validators.required]],
      vigenciaTarjetaFin: [{ value: vehiculoSeleccionado.vigenciaTarjetaFin, disabled: false }, [Validators.required]],
      noSerie: [{ value: vehiculoSeleccionado.noSerie, disabled: false }, [Validators.required]],
      fechaAdquisicion: [{ value: vehiculoSeleccionado.fechaAdquisicion, disabled: false }, [Validators.required]],
      vigenciaAdquisicionInicio: [{ value: vehiculoSeleccionado.fechaVigenciaInicio, disabled: false }, [Validators.required]],
      vigenciaAdquisicionFin: [{ value: vehiculoSeleccionado.fechaVigenciaFin, disabled: false }, [Validators.required]],
      costoTotal: [{ value: vehiculoSeleccionado.costoTotal, disabled: false }, [Validators.required]],
      aseguradora: [{ value: vehiculoSeleccionado.aseguradora, disabled: false }, [Validators.required]],
      poliza: [{ value: vehiculoSeleccionado.poliza, disabled: false }, [Validators.required]],
      vigenciapolizaInicio: [{ value: vehiculoSeleccionado.vigenciapolizaInicio, disabled: false }, [Validators.required]],
      vigenciapolizaFin: [{ value: vehiculoSeleccionado.vigenciapolizaFin, disabled: false }, [Validators.required]],
      riesgos: [{ value: vehiculoSeleccionado.riesgos, disabled: false }, [Validators.required]],
      importePrima: [{ value: vehiculoSeleccionado.importePrima, disabled: false }, [Validators.required]],
      estatus: [{ value: vehiculoSeleccionado.estatus, disabled: false }, [Validators.required]],
    })
  }

  adelantarPagina(): void {
    this.indice++;
    if (this.indice === this.menuStep.length) {
      this.crearResumenVehiculo();
    }
  }

  regresarPagina(): void {
    this.indice--;
  }

  cancelar(): void {
    this.ref.close()
  }

  crearResumenVehiculo(): void {
    this.vehiculoModificado = {
      id: null,
      ...this.datosDocumentacionForm.value,
      ...this.datosGeneralesForm.value
    }
  }

  get fdg() {
    return this.datosGeneralesForm.controls;
  }

  get fdd() {
    return this.datosDocumentacionForm.controls;
  }

}

import { DetalleProveedorComponent } from './../detalle-proveedor/detalle-proveedor.component';
import { Proveedores } from './../../models/proveedores.interface';
import { ModificarProveedorComponent } from './../modificar-proveedor/modificar-proveedor.component';
import { AgregarProveedorComponent } from './../agregar-proveedor/agregar-proveedor.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LazyLoadEvent } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { TipoDropdown } from 'projects/sivimss-gui/src/app/models/tipo-dropdown';
import { BreadcrumbService } from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import { DIEZ_ELEMENTOS_POR_PAGINA } from 'projects/sivimss-gui/src/app/utils/constantes';
import { INVENTARIO_VEHICULAR_BREADCRUMB } from '../../constants/breadcrumb';
import { CATALOGOS_DUMMIES } from '../../constants/dummies';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';

@Component({
  selector: 'app-administrar-proveedores',
  templateUrl: './administrar-proveedores.component.html',
  styleUrls: ['./administrar-proveedores.component.scss'],
  providers: [DialogService]
})
export class AdministrarProveedoresComponent implements OnInit {


  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;

  filtroForm!: FormGroup;
  velatorios: TipoDropdown[] = CATALOGOS_DUMMIES;
  niveles: TipoDropdown[] = CATALOGOS_DUMMIES;
  delegaciones: TipoDropdown[] = CATALOGOS_DUMMIES;
  proveedoresOpciones: TipoDropdown[] = CATALOGOS_DUMMIES;

  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;

  proveedores: Proveedores[] = [];
  // ProveedorSeleccionado!: Proveedores;
  proveedorSeleccionado!: Proveedores
  mostrarModalDetalleVehiculo: boolean = false;
  propiedad = false;

  creacionRef!: DynamicDialogRef
  detalleRef!: DynamicDialogRef;
  modificacionRef!: DynamicDialogRef;

  constructor(
    private breadcrumbService: BreadcrumbService,
    public dialogService: DialogService,
    private alertaService: AlertaService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.actualizarBreadcrumb();
    this.inicializarFiltroForm();
  }

  actualizarBreadcrumb(): void {
    this.breadcrumbService.actualizar(INVENTARIO_VEHICULAR_BREADCRUMB);
  }

  inicializarFiltroForm(): void {
    this.filtroForm = this.formBuilder.group({
      nivel: [{ value: null, disabled: false }],
      proveedores: [{ value: null, disabled: false }],
      velatorio: [{ value: null, disabled: false }],
      proveedor: [{ value: null, disabled: false }]
    });
  }

  limpiarFiltros(): void {
    this.filtroForm.reset();
  }

  buscar(): void {
    console.log("Se comenta método para que no marque error en Sonar");
  }

  paginar(event: LazyLoadEvent): void {
    setTimeout(() => {
      this.proveedores = [
        {
          id: 1,
          curp: 'AROER762010HDFNCOO',
          nombre: 'Armando Rafaelo',
          responsableSanitario: 'Armando Rafaelo',
          estatus: true,
          correoElectronico: 'correo@correo.com',
          banco: 'BBVA',
          cuenta: '087334325435',
          tipoProveedor: 'Proveedor Chico',
          rfc: 'ASSD',
          telefono: '2311163210',
          regimen: 'Sin regimen fiscal',
          representanteLegal: 'Armando perez Oruña',
          claveBancaria: '908579685645',
          tipoContrato: 'sin fronteras',
          vigenciaDesde: '17-2022',
          vigenciaHasta: '19-2024',
          rol: 'Administrador',

          codigoPostal: '53967',
          calle: '7 de octubre',
          numExterior: '161',
          numInterior: '0',
          pais: 'Mexico',
          estado: 'Puebla',
          municipio: 'Teziutlán',

          codigoPostalReferencia: '37498',
          calleReferencia: 'calle arminda',
          numExteriorReferencia: '161',
          numInteriorReferencia: '0',
          paisReferencia: 'Uganda',
          estadoReferencia: 'Manchester',
          municipioReferencia: 'Manchester City',
        },
        {
          id: 2,
          curp: 'AROER762010HDFNCOO',
          nombre: 'Armando Rafaelo',
          responsableSanitario: 'Armando Rafaelo',
          estatus: true,
          correoElectronico: 'correo@correo.com',
          banco: 'BBVA',
          cuenta: '087334325435',
          tipoProveedor: 'Proveedor Chico',
          rfc: 'ASSD',
          telefono: '2311163210',
          regimen: 'Sin regimen fiscal',
          representanteLegal: 'Armando perez Oruña',
          claveBancaria: '908579685645',
          tipoContrato: 'sin fronteras',
          vigenciaDesde: '17-2022',
          vigenciaHasta: '19-2024',
          rol: 'Administrador',

          codigoPostal: '53967',
          calle: '7 de octubre',
          numExterior: '161',
          numInterior: '0',
          pais: 'Mexico',
          estado: 'Puebla',
          municipio: 'Teziutlán',

          codigoPostalReferencia: '37498',
          calleReferencia: 'calle arminda',
          numExteriorReferencia: '161',
          numInteriorReferencia: '0',
          paisReferencia: 'Uganda',
          estadoReferencia: 'Manchester',
          municipioReferencia: 'Manchester City',
        },
      ]
      this.totalElementos = 3
    }, 0)
  }

  abrirModalCambioEstatus(proveedor:Proveedores){
    /*Preguntar si se puede usar 'let'*/
    let header:string = "" ;
    if(proveedor.estatus) {
      header = "Activar proveedor";
    } else {
      header = "Desactivar proveedor";
    }
    this.creacionRef = this.dialogService.open(DetalleProveedorComponent, {
      header:header,
      width:"920px",
      data: {proveedor:proveedor, origen: "estatus"},
    })

    this.creacionRef.onClose.subscribe((proveedor:Proveedores) => {
      if(proveedor.estatus){
        this.alertaService.mostrar(TipoAlerta.Exito, 'Proveedor activado correctamente');
      }else{
        this.alertaService.mostrar(TipoAlerta.Exito, 'Proveedor desactivado correctamente');
      }
    })

  }


  abrirPanel(event: MouseEvent, proveedorSeleccionado: Proveedores): void {
    this.proveedorSeleccionado = proveedorSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrirModalDetalleProveedor(proveedorSeleccionado:Proveedores){
    this.creacionRef = this.dialogService.open(DetalleProveedorComponent, {
      header:"Detalle",
      width:"920px",
      data: {proveedor:proveedorSeleccionado, origen: "detalle"},
    })
  }





  abrirModalCreacionProveedor(): void {
    this.creacionRef = this.dialogService.open(AgregarProveedorComponent, {
      header: "Agregar proveedor",
      width: "920px",
    });
  }

  abrirModalModificacionProveedor(): void {
    this.creacionRef = this.dialogService.open(ModificarProveedorComponent, {
      data: this.proveedorSeleccionado,
      header: "Modificar proveedor",
      width: "920px"
    })
  }

  ngOnDestroy() {
    if (this.creacionRef) {
      this.creacionRef.destroy();
    }
    if (this.detalleRef) {
      this.detalleRef.destroy();
    }
    if (this.modificacionRef) {
      this.modificacionRef.destroy();
    }
  }

}

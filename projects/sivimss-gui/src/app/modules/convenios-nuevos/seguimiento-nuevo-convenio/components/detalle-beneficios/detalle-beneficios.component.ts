import {Component, ViewChild} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {DialogService} from 'primeng/dynamicdialog';
import {OverlayPanel} from 'primeng/overlaypanel';
import {AlertaService} from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import {BreadcrumbService} from 'projects/sivimss-gui/src/app/shared/breadcrumb/services/breadcrumb.service';
import {DIEZ_ELEMENTOS_POR_PAGINA} from 'projects/sivimss-gui/src/app/utils/constantes';
import {Beneficiarios} from '../../models/beneficiarios.interface';

@Component({
  selector: 'app-detalle-beneficios',
  templateUrl: './detalle-beneficios.component.html',
  styleUrls: ['./detalle-beneficios.component.scss'],
  providers: [DialogService]

})
export class DetalleBeneficiosComponent {

  @ViewChild(OverlayPanel)
  overlayPanel!: OverlayPanel;
  overlayPanelPersona!: OverlayPanel;
  numPaginaActual: number = 0;
  cantElementosPorPagina: number = DIEZ_ELEMENTOS_POR_PAGINA;
  totalElementos: number = 0;
  infoPersona: boolean = false;

  // beneficiarios:Beneficiarios[] = [];
  beneficiarioSeleccionado: Beneficiarios = {};
  mostrarDetalleBeneficiario: boolean = false;


  beneficiarios = [
    {
      id: 1,
      nombre: "Marta",
      apellidoMaterno: "Huautla",
      apellidoPaterno: "Flores",
      nombreDocumento: "Carta poder",
      numeroDocumento: 23,
      tipoDocumento: "ningunDocumento",
      linkDocumento: "LinkDocumento",
      rfc: "dfe34543r3rf4",
      curp: "frefr4454fr",
      nss: "345345345",
      sexo: "Hombre",
      fechaNacimiento: "20/06/1996",
      nacionalidad: "Mexicana",
      correoElectronico: "fernando.heranandez20@gmail.com",
      telefono: "2311163210",
      direccion: "calle 7 de octubre No. 161 73967 atoluca Teziutlán Puebla",
      estatus: true,
      parentesco: "Hijo",
      edad: "24",

    },
    {
      id: 2,
      nombre: "Eujenia",
      apellidoMaterno: "Huautla",
      apellidoPaterno: "Flores",
      nombreDocumento: "Carta poder",
      numeroDocumento: 23,
      tipoDocumento: "ningunDocumento",
      linkDocumento: "LinkDocumento",
      rfc: "dfe34543r3rf4",
      curp: "frefr4454fr",
      nss: "345345345",
      sexo: "Hombre",
      fechaNacimiento: "20/06/1996",
      nacionalidad: "Mexicana",
      correoElectronico: "fernando.heranandez20@gmail.com",
      telefono: "2311163210",
      direccion: "calle 7 de octubre No. 161 73967 Atoluca Teziutlán Puebla",
      estatus: true,
      parentesco: "Hijo",
      edad: "24",
    },
    {
      id: 3,
      nombre: "Stib vai",
      apellidoMaterno: "Huautla",
      apellidoPaterno: "Flores",
      nombreDocumento: "Carta poder",
      numeroDocumento: 23,
      tipoDocumento: "ningunDocumento",
      linkDocumento: "LinkDocumento",
      rfc: "dfe34543r3rf4",
      curp: "frefr4454fr",
      nss: "345345345",
      sexo: "Hombre",
      fechaNacimiento: "20/06/1996",
      nacionalidad: "Mexicana",
      correoElectronico: "fernando.heranandez20@gmail.com",
      telefono: "2311163210",
      direccion: "calle 7 de octubre No. 161 73967 Atoluca Teziutlán Puebla",
      estatus: true,
      parentesco: "Hijo",
      edad: "24",
    }
  ];


  constructor(
    private formBuilder: FormBuilder,
    private breadcrumbService: BreadcrumbService,
    private alertaService: AlertaService,
    public dialogService: DialogService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }

  paginar(event: LazyLoadEvent): void {
    console.log(event);
    setTimeout(() => {
      this.beneficiarios = [
        {
          id: 1,
          nombre: "Marta",
          apellidoMaterno: "eugenia",
          apellidoPaterno: "eugenia",
          nombreDocumento: "Carta poder",
          numeroDocumento: 23,
          tipoDocumento: "ningunDocumento",
          linkDocumento: "LinkDocumento",
          rfc: "dfe34543r3rf4",
          curp: "frefr4454fr",
          nss: "345345345",
          sexo: "Hombre",
          fechaNacimiento: "20/06/1996",
          nacionalidad: "Mexicana",
          correoElectronico: "fernando.heranandez20@gmail.com",
          telefono: "2311163210",
          direccion: "calle 7 de octubre No. 161 73967 Atoluca Teziutlán Puebla",
          estatus: true,
          parentesco: "Tio",
          edad: "24",
        },
        {
          id: 2,
          nombre: "Marta",
          apellidoMaterno: "Huautla",
          apellidoPaterno: "eugenia",
          nombreDocumento: "Carta poder",
          numeroDocumento: 23,
          tipoDocumento: "ningunDocumento",
          linkDocumento: "LinkDocumento",
          rfc: "dfe34543r3rf4",
          curp: "frefr4454fr",
          nss: "345345345",
          sexo: "Hombre",
          fechaNacimiento: "20/06/1996",
          nacionalidad: "Mexicana",
          correoElectronico: "fernando.heranandez20@gmail.com",
          telefono: "2311163210",
          direccion: "calle 7 de octubre No. 161 73967 Atoluca Teziutlán Puebla",
          estatus: true,
          parentesco: "Tio",
          edad: "24",
        },
        {
          id: 3,
          nombre: "Marta",
          apellidoMaterno: "Huautla",
          apellidoPaterno: "eugenia",
          nombreDocumento: "Carta poder",
          numeroDocumento: 23,
          tipoDocumento: "ningunDocumento",
          linkDocumento: "LinkDocumento",
          rfc: "dfe34543r3rf4",
          curp: "frefr4454fr",
          nss: "345345345",
          sexo: "Hombre",
          fechaNacimiento: "20/06/1996",
          nacionalidad: "Mexicana",
          correoElectronico: "fernando.heranandez20@gmail.com",
          telefono: "2311163210",
          direccion: "calle 7 de octubre No. 161 73967 Atoluca Teziutlán Puebla",
          estatus: true,
          parentesco: "Tio",
          edad: "24",
        }
      ];
      this.totalElementos = this.beneficiarios.length;
    }, 0)
  }

  abrirPanel(event: MouseEvent): void {
    this.infoPersona = false;
    // this.beneficiarioSeleccionado = beneficiarioSeleccionado;
    this.overlayPanel.toggle(event);
  }

  abrir(event: MouseEvent) {
    this.infoPersona = true;
    this.overlayPanel.toggle(event);
  }


  abrirModalDetalleRol(beneficiarioSeleccionado: Beneficiarios): void {
    this.beneficiarioSeleccionado = {...beneficiarioSeleccionado};
    this.mostrarDetalleBeneficiario = true;
  }

}

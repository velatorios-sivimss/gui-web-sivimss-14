import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActualizarBeneficiario, Beneficiario, BusquedaConvenio, CatalogoDatosGenerales, GuardarBeneficiario } from '../../models/convenio.interface';
import { Accordion } from 'primeng/accordion';
import { AlertaService, TipoAlerta } from 'projects/sivimss-gui/src/app/shared/alerta/services/alerta.service';
import { ActivatedRoute } from '@angular/router';
import { RenovarConvenioPfService } from '../../services/renovar-convenio-pf.service';
import { HttpRespuesta } from 'projects/sivimss-gui/src/app/models/http-respuesta.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-renovar-convenio-beneficiarios',
  templateUrl: './renovar-convenio-beneficiarios.component.html',
  styleUrls: ['./renovar-convenio-beneficiarios.component.scss']
})
export class RenovarConvenioBeneficiariosComponent implements OnInit {
  @ViewChild('accordion') accordion: Accordion | undefined;

  mode: 'listado' | 'crear' | 'modificar' | 'desactivar' = 'listado';
  altaBeneficiarioForm!: FormGroup;
  modificarBeneficiarioForm!: FormGroup;
  beneficiarioForm!: FormGroup;
  documentacionForm!: FormGroup;
  convenio: BusquedaConvenio = {};
  beneficiarioSeleccionado!: Beneficiario;
  beneficiarios: Beneficiario[] = [];
  numBeneficiario: number = 0;
  activeIndex: number | null = null;
  datosGenerales!: CatalogoDatosGenerales;

  constructor(
    private route: ActivatedRoute,
    private alertaService: AlertaService,
    private renovarConvenioPfService: RenovarConvenioPfService,
  ) {
    this.route.queryParams.subscribe(params => {
      if (params) {
        this.convenio.folio = params.folio;
      }
    })
    this.beneficiarios = this.route.snapshot.data["respuesta"][1].datos;
    this.datosGenerales = this.route.snapshot.data["respuesta"][2].datos[0];
  }

  ngOnInit(): void { }

  nuevo() {
    this.activeIndex = null;
    this.numBeneficiario = this.beneficiarios.length + 1;
    this.mode = 'crear';
  }

  desactivar() {
    if (this.activeIndex !== null && this.activeIndex >= 0) {
      this.numBeneficiario = this.activeIndex + 1;
      this.mode = 'desactivar';
    }
  }

  modificar() {
    if (this.activeIndex !== null && this.activeIndex >= 0) {
      this.numBeneficiario = this.activeIndex + 1;
      this.mode = 'modificar';
    }
  }

  obtenerDetalleBeneficiario(idBeneficiario: number) {
    this.renovarConvenioPfService.cambiarEstatusBeneficiario({ idBeneficiario }).subscribe({
      next: (respuesta: HttpRespuesta<any>) => {
        if (respuesta?.datos) {
          console.log(respuesta?.datos);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
      }
    });
  }

  crearBeneficiario(beneficiario: Beneficiario | null) {
    console.log(beneficiario);

    if (!beneficiario) {
      this.mode = 'listado';
    } else {
      this.renovarConvenioPfService.crearBeneficiario(this.datosGuardarBeneficiarios(beneficiario)).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta?.datos) {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Nuevo registro de los Beneficiarios del Folio 1');
            this.mode = 'listado';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  activarDesactivarBeneficiario(beneficiario: Beneficiario | null) {
    if (!beneficiario) {
      this.mode = 'listado';
    } else {
      this.renovarConvenioPfService.cambiarEstatusBeneficiario({ idBeneficiario: 18, estatusBenefic: false }).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta?.datos) {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Modificado correctamente los Beneficiarios del Folio 1');
            this.mode = 'listado';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  actualizarBeneficiario(beneficiario: Beneficiario | null) {
    if (!beneficiario) {
      this.mode = 'listado';
    } else {
      this.renovarConvenioPfService.actualizarBeneficiario(this.datosActualizarBeneficiarios(beneficiario)).subscribe({
        next: (respuesta: HttpRespuesta<any>) => {
          if (respuesta?.datos) {
            this.alertaService.mostrar(TipoAlerta.Exito, 'Modificado correctamente los Beneficiarios del Folio 1');
            this.mode = 'listado';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        }
      });
    }
  }

  handleActiveBeneficiario(beneficiario: Beneficiario) {
    this.beneficiarioSeleccionado = beneficiario;
  }

  activeIndexChange(index: number) {
    this.activeIndex = index;
  }


  datosGuardarBeneficiarios(beneficiario: Beneficiario): GuardarBeneficiario {
    return {
      nombre: beneficiario.nombre,
      apellidoP: beneficiario.primerApellido,
      apellidoM: beneficiario.segundoApellido,
      fechaNac: "",
      curp: beneficiario.curp,
      rfc: beneficiario.rfc,
      correoE: beneficiario.email,
      tel: beneficiario.telefono,
    }
  }

  datosActualizarBeneficiarios(beneficiario: Beneficiario): ActualizarBeneficiario {
    return {
      idBeneficiario: beneficiario.idBeneficiario,
      idPersona: beneficiario.idPersona,
      nombre: beneficiario.nombre,
      apellidoP: beneficiario.primerApellido,
      apellidoM: beneficiario.segundoApellido,
      fechaNac: "",
      curp: beneficiario.curp,
      rfc: beneficiario.rfc,
      correoE: beneficiario.email,
      tel: beneficiario.telefono,
    }
  }
}


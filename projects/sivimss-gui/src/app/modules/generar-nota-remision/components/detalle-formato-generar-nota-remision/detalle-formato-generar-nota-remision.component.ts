import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';

@Component({
  selector: 'app-detalle-formato-generar-nota-remision',
  templateUrl: './detalle-formato-generar-nota-remision.component.html',
  styleUrls: ['./detalle-formato-generar-nota-remision.component.scss']
})
export class DetalleFormatoGenerarNotaRemisionComponent implements OnInit {
  readonly POSICION_DETALLE: number = 0;
  readonly POSICION_SERVICIOS: number = 1;

  @Input() generarNotaRemision: boolean = false;

  @Output() regresar = new EventEmitter();

  @Output() aceptar = new EventEmitter();

  notaRemisionForm!: FormGroup;
  idNota: number = 0;
  idOds: number = 0;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    if (!this.generarNotaRemision) {
      const respuesta = this.route.snapshot.data['respuesta'];
      this.idNota = +this.route.snapshot.params?.idNota;
      this.idOds = +this.route.snapshot.params?.idOds;

      if (!this.idNota || !this.idOds) {
        this.btnAceptarDetalle();
      }

      const detalleNotaRemision = respuesta[this.POSICION_DETALLE].datos;
      const serviciosNotaRemision = respuesta[this.POSICION_SERVICIOS].datos;
      this.inicializarNotaRemisionForm(detalleNotaRemision, serviciosNotaRemision);
    } else {
      this.inicializarNotaRemisionForm();
    }
  }

  inicializarNotaRemisionForm(detalle?: any, servicios?: any) {
    this.notaRemisionForm = this.formBuilder.group({
      versionDocumento: [{ value: "1.2", disabled: true }],
      fecha: [{ value: new Date(), disabled: true }],
      velatorio: [{ value: 'No. 22 Villahermosa', disabled: true }],
      remisionServicios: [{ value: 'DOC-000001', disabled: true }],
      direccion: [{ value: 'Prolongación Av. México No. 1203, Col. Sabina, C.P. 86153, Villahermosa, San Luis Potosí.', disabled: true }],
      nombreSolicitante: [{ value: 'Miranda Fernendez Guisa', disabled: true }],
      direccionSolicitante: [{ value: 'Av. Congreso de la Unión, Iztacalco, CP 201, CDMX', disabled: true }],
      curpSolicitante: [{ value: 'FEGM560117MDFMPRO7', disabled: true }],
      velatorioSolicitante: [{ value: 'No. 22 Villahermosa', disabled: true }],
      finado: [{ value: 'Pedro Lomas Morales', disabled: true }],
      parentesco: [{ value: 'Abuelo', disabled: true }],
      folioOds: [{ value: 'DOC-000001', disabled: true }],
      nombreConformidad: [{ value: null, disabled: true }],
      nombreRepresentante: [{ value: null, disabled: true }],
    });
  }

  btnRegresar() {
    this.regresar.emit();
  }

  btnAceptar() {
    this.aceptar.emit();
  }

  btnAceptarDetalle() {
    this.router.navigate(['/generar-nota-remision'], { relativeTo: this.activatedRoute });
  }
}

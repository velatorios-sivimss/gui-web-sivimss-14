import {Component, OnInit} from '@angular/core';
import {BreadcrumbService} from "../../../../../shared/breadcrumb/services/breadcrumb.service";
import {GESTIONAR_PAGO_BREADCRUMB} from "../../constants/breadcrumb";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-gestionar-pago',
  templateUrl: './gestionar-pago.component.html',
  styleUrls: ['./gestionar-pago.component.scss']
})
export class GestionarPagoComponent implements OnInit {
  filtroGestionarPagoForm!: FormGroup;

  constructor(private breadcrumbService: BreadcrumbService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.breadcrumbService.actualizar(GESTIONAR_PAGO_BREADCRUMB);
    this.inicializarForm();
  }

  inicializarForm(): void {
    this.filtroGestionarPagoForm = this.formBuilder.group({
      velatorio: [{value: null, disabled: false}]
    });
  }

}

import { Directive, OnInit } from '@angular/core';
import { Table } from "primeng/table";

@Directive({
  selector: '[appActivarUltimaCeldaSticky]'
})
export class ActivarUltimaCeldaStickyDirective implements OnInit {

  constructor(private table: Table) {
  }

  ngOnInit(): void {
    this.table.styleClass = this.table.styleClass + ' ultima-celda-sticky';
  }

}

import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-titulo-principal',
  templateUrl: './titulo-principal.component.html',
  styleUrls: ['./titulo-principal.component.scss']
})
export class TituloPrincipalComponent implements OnInit {

  private _style: any = {};

  @Input()
  styleClass!: string;

  @Input()
  titulo!: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  @Input() get style(): any {
    return this._style;
  }

  set style(value: any) {
    if (value) {
      this._style = {...value};
    }
  }

}

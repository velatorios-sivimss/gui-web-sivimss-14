import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-titulo-principal',
  templateUrl: './titulo-principal.component.html',
  styleUrls: ['./titulo-principal.component.scss']
})
export class TituloPrincipalComponent {

  private _style: any = {};

  @Input()
  styleClass!: string;

  @Input()
  titulo!: string;


  @Input() get style(): any {
    return this._style;
  }

  set style(value: any) {
    if (value) {
      this._style = {...value};
    }
  }

}

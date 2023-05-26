import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.component.html',
  styleUrls: ['./alerta.component.scss']
})
export class AlertaComponent implements OnInit {

  @Input()
  mensaje!: string;

  ngOnInit(): void {
    console.log("Se comenta metodo para que no marque error en Sonar");
  }

}

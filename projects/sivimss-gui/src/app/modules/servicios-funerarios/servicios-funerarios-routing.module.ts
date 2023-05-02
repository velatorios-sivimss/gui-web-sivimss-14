import {NgModule} from "@angular/core";
import {RouterModule,Routes} from "@angular/router";

import {ServiciosFunerariosComponent} from "./components/servicios-funerarios/servicios-funerarios.component";
import {
  DetalleServiciosFunerariosComponent
} from "./components/detalle-servicios-funerarios/detalle-servicios-funerarios.component";
import {
  AltaServiciosFunerariosComponent
} from "./components/alta-servicios-funerarios/alta-servicios-funerarios.component";
import {
  CancelarServiciosFunerariosComponent
} from "./components/cancelar-servicios-funerarios/cancelar-servicios-funerarios.component";
import {
  ModificarServiciosFunerariosComponent
} from "./components/modificar-servicios-funerarios/modificar-servicios-funerarios.component";

const routes: Routes = [
  {
    path:'',
    component: ServiciosFunerariosComponent
  },
  {
    path:'detalle-pago/:id',
    component: DetalleServiciosFunerariosComponent,
  },
  {
    path:'cancelar-pago/:id',
    component: CancelarServiciosFunerariosComponent,
  },
  {
    path:'modificar-pago/:id',
    component: ModificarServiciosFunerariosComponent,
  },
  {
    path:'registrar-nuevo-plan-sfpa',
    component: AltaServiciosFunerariosComponent,
  }
];

@NgModule({
  imports:[RouterModule.forChild(routes)],
  exports:[RouterModule]
})

export class ServiciosFunerariosRoutingModule {

}

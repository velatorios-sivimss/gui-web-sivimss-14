import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { InventarioVehicularComponent } from './components/inventario-vehicular/inventario-vehicular.component';
import { InventarioVehicularResolver } from "./services/inventario-vehicular.resolver";

const routes: Route[] = [{
    path: '',
    component: InventarioVehicularComponent,
    resolve: {
        respuesta: InventarioVehicularResolver
    }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        InventarioVehicularResolver
    ]
})
export class InventarioVehicularRoutingModule { }

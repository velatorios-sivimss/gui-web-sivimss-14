import { ProveedoresResolver } from './services/proveedores.resolver';
import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { AdministrarProveedoresComponent } from "./components/administrar-proveedores/administrar-proveedores.component";

const routes: Route[] = [{
    path: '',
    component: AdministrarProveedoresComponent,
    resolve: {
        respuesta: ProveedoresResolver,
    }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        ProveedoresResolver
    ]
})
export class ProveedoresRoutingModule { }

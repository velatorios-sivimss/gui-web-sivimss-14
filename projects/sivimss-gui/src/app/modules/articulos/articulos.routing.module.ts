import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { AdministrarArticulosComponent } from './components/administrar-articulos/administrar-articulos.component';
import { ArticulosResolver } from './services/articulos.resolver';

const routes: Route[] = [{
    path: '',
    component: AdministrarArticulosComponent,
    resolve: {
        respuesta: ArticulosResolver,
    }
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
      ArticulosResolver
    ]
})
export class ArticulosRoutingModule { }

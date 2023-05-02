import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CapillasComponent } from './components/capillas/capillas.component';
import { CapillasResolver } from './services/capillas.resolver';

// utils routes: Routes = [{path: '', component: CapillasComponent}];

const routes: Routes = [{
  path: '', component: CapillasComponent,
   resolve: {
    respuesta: CapillasResolver,
   },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    CapillasResolver,
  ],
})
export class CapillasRoutingModule {
}


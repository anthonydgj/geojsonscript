import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './about/about.component';
import { Constants } from './constants';
import { MappingEnvironmentComponent } from './mapping-environment/mapping-environment.component';

const routes: Routes = [
  { path: Constants.PATH_ABOUT, component: AboutComponent },
  { path: Constants.PATH_MAPPING_ENVIRONMENT, component: MappingEnvironmentComponent },
  { path: '**', redirectTo: Constants.PATH_MAPPING_ENVIRONMENT }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled'

  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

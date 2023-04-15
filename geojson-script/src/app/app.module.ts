import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MomentModule } from 'ngx-moment';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select'
import { FormsModule } from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { NgxPiwikProModule, NgxPiwikProRouterModule } from '@piwikpro/ngx-piwik-pro';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { MappingEnvironmentComponent } from './mapping-environment/mapping-environment.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { AngularSplitModule } from 'angular-split';
import { MapComponent } from './map/map.component';
import { EditorComponent } from './editor/editor.component';
import { ConsoleComponent } from './console/console.component';
import { DataManagerComponent } from './data-manager/data-manager.component';
import { DataLayerDialogComponent } from './data-layer-dialog/data-layer-dialog.component';
import { DataDialogComponent } from './data-dialog/data-dialog.component';
import { CodeViewerComponent } from './code-viewer/code-viewer.component';
import { PopupContentComponent } from './popup-content/popup-content.component';
import { ThisObjectDialogComponent } from './this-object-dialog/this-object-dialog.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { TitleComponent } from './title/title.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    MappingEnvironmentComponent,
    NavigationBarComponent,
    MapComponent,
    EditorComponent,
    ConsoleComponent,
    DataManagerComponent,
    DataLayerDialogComponent,
    DataDialogComponent,
    CodeViewerComponent,
    PopupContentComponent,
    ThisObjectDialogComponent,
    TitleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MomentModule,
    FormsModule,

    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatInputModule,
    MatGridListModule,
    MatMenuModule,

    NgxPiwikProModule.forRoot('13e31050-7514-4ad0-b055-870120d67683', 'https://geojsonscript.containers.piwik.pro'),
    NgxPiwikProRouterModule,

    AngularSplitModule,
    NgxFileDropModule,
    ColorPickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { AngularSplitModule } from 'angular-split';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxFileDropModule } from 'ngx-file-drop';
import { MomentModule } from 'ngx-moment';

import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select'
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPiwikProModule, NgxPiwikProRouterModule } from '@piwikpro/ngx-piwik-pro';

import { AboutComponent } from './about/about.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CodeViewerComponent } from './code-viewer/code-viewer.component';
import { ConsoleComponent } from './console/console.component';
import { DataDialogComponent } from './data-dialog/data-dialog.component';
import { DataLayerDialogComponent } from './data-layer-dialog/data-layer-dialog.component';
import { DataManagerComponent } from './data-manager/data-manager.component';
import { EditorComponent } from './editor/editor.component';
import { LeafletMapComponent } from './leaflet-map/leaflet-map.component';
import { MappingEnvironmentComponent } from './mapping-environment/mapping-environment.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { PopupContentComponent } from './popup-content/popup-content.component';
import { ThisObjectDialogComponent } from './this-object-dialog/this-object-dialog.component';
import { TitleComponent } from './title/title.component';

@NgModule({
	declarations: [
		AppComponent,
		AboutComponent,
		MappingEnvironmentComponent,
		NavigationBarComponent,
		LeafletMapComponent,
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

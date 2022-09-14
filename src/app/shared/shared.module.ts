import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
    declarations: [
        NavbarComponent,
        SidebarComponent
    ],
    imports: [
        CommonModule,
        MatTableModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatSortModule
    ],
    exports: [
        MatTableModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatSortModule,

        NavbarComponent,
        SidebarComponent
    ],
    providers: [],
})
export class SharedModule { }
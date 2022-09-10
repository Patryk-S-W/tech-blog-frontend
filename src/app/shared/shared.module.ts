import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
    declarations: [
    ],
    imports: [CommonModule, MatTableModule, MatCheckboxModule, MatTooltipModule, MatPaginatorModule, MatSortModule
    ],
    exports: [MatTableModule, MatCheckboxModule, MatTooltipModule, MatPaginatorModule, MatSortModule
    ],
    providers: [],
})
export class SharedModule { }
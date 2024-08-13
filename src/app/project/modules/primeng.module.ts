import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';

//
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { StepsModule } from 'primeng/steps';
import { SelectButtonModule  } from 'primeng/selectbutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';

@NgModule({
  declarations: [],
  providers: [ConfirmationService, MessageService],
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    MenuModule,
    CardModule,
    //primeng gp
    BadgeModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DialogModule,
    FileUploadModule,
    InputTextareaModule,
    InputSwitchModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    SelectButtonModule,
    StepsModule,
    OverlayPanelModule
  ],
  exports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    MenuModule,
    CardModule,
    //primeng gp
    BadgeModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DialogModule,
    FileUploadModule,
    InputTextareaModule,
    InputSwitchModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    SelectButtonModule,
    StepsModule,
    OverlayPanelModule
  ],
})
export class PrimengModule {}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionUploadDoc, Reglamento } from '../../../models/Reglamento';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReglamentosService } from '../../../services/reglamentos.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-reglamentos',
  templateUrl: './reglamentos.component.html',
  styles: [
  ]
})

export class ReglamentosComponent implements OnInit, OnDestroy {

  constructor(public reglamentosService: ReglamentosService,
    private confirmationService: ConfirmationService,
    private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  )
    {
      const currentYear = new Date().getFullYear();
      // Establecer la fecha máxima para el final del año actual
      this.maxDate = new Date(currentYear, 11, 31);
  }

  reglamentos: Reglamento[] = [];
  reglamento: Reglamento = {};
  namesCrud! : NamesCrud;
  globalFiltros : any[] = [];
  selectedRowsService: any[] = [];
  dataKeyTable : string = '';
  keyPopups: string = '';
  dialog: boolean = false;
  statusValidatorForm: boolean = false;
  mode: string = '';
  maxDate: Date;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.reglamentosService.modeForm;
  }
  
  set modeForm(_val){
    this.reglamentosService.modeForm = _val;
  }

  get modeCrud() {
    return this.reglamentosService.modeForm;
  }
 
  async ngOnInit() {
    this.namesCrud = {
      singular: 'reglamento',
      plural: 'reglamentos',
      articulo_singular: 'el reglamento',
      articulo_plural: 'los reglamentos',
      genero: 'masculino'
    };

    this.globalFiltros = [ 'Descripcion_regla']
    this.dataKeyTable = 'Cod_reglamento';
    this.keyPopups = 'reglamentos'

    await this.getReglamentos();
    
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.openCreate()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getReglamentos()));
    //this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(file => {file && this.downloadDoc(file)}));
    // this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( event => { event && this.filesChanged(event)} ));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))
    
    
    this.subscription.add(
      this.reglamentosService.modeCrud$.subscribe(crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.reglamento = {};
            this.reglamento = crud.data;
          }
          switch (crud.mode) {
            // case 'show': this.showForm(); break;
            case 'edit': this.openEdit(); break;
            case 'insert': this.insertReglamento(); break;
            // case 'update': this.updateReglamento(); break;
            case 'delete': this.openConfirmationDelete(this.reglamento); break;
          }
        }
      })
    );
    this.menuButtonsTableService.setContext('reglamento','dialog');
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
    // this.uploaderFilesService.updateValidatorFiles(null);
    // this.uploaderFilesService.setFiles(null);
  }

  filesValidator(control: any): { [key: string]: boolean } | null {  
 
    const formGroup = control.parent as FormGroup;
   
    if (!formGroup) {
      return null;
    }
 
    const files = formGroup.get('files')?.value;  
   
    if ( this.modeForm == 'create' ){
      if (files.length === 0 ) {
        return { required: true };
      }
    }else if ( this.modeForm == 'edit'){
      if (files.length === 0 ) {
        return { required: true };
      }
    }
    return null;
  }
  
  async getReglamentos(){
    try {
      this.reglamentos = <Reglamento[]> await this.reglamentosService.getReglamentos();
      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertReglamento(){
    try {
      const result: any = await new Promise <void> ((resolve: Function, reject: Function) => {
        this.reglamentosService.setModeCrud('insert',null, resolve, reject);
      })
      if (result.success) {
        //insert exitoso
        this.getReglamentos();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: result.messageGp
        });
        this.reset();
      }else{
        this.errorTemplateHandler.processError(
          result, {
            notifyMethod: 'alert',
            summary: result.messageGp,
            message: result.e.detail.error.message,
        });
        this.reset();
      }
    } catch (e:any) {
        this.errorTemplateHandler.processError(
          e, {
            notifyMethod: 'alert',
            summary: `Error al guardar ${this.namesCrud.singular}`,
            message: e.detail.error.message.message
          });
      }
  }


  async updateReglamento() {
    try {
      const result: any = await new Promise<void>((resolve: Function, reject: Function) => {
        // Cambiamos el modo CRUD a 'update' y pasamos los datos del reglamento
        this.reglamentosService.setModeCrud('update', this.reglamento, resolve, reject);
      });
  
      if (result.success) {
        // Si la actualización fue exitosa, recargamos la lista de reglamentos
        this.getReglamentos();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: result.messageGp
        });
        this.reset();  // Reseteamos el formulario y el estado
      } else {
        // Si hubo algún error durante la actualización
        this.errorTemplateHandler.processError(
          result, {
            notifyMethod: 'alert',
            summary: result.messageGp,
            message: result.e?.detail?.error?.message || 'Error al actualizar el reglamento',
          }
        );
        this.reset();  // También reseteamos en caso de error
      }
    } catch (e: any) {
      // Manejo de errores en la promesa
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${this.namesCrud.singular}`,
          message: e?.detail?.error?.message || 'Error desconocido',
        }
      );
    }
  }
  

  async deleteReglamentos(reglamentoToDelete: Reglamento[], isFromDeleteSelected = false){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.reglamentosService.deleteReglamento(reglamentoToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_ua')
      if ( deleted.dataWasDeleted ) {
        this.getReglamentos();
        if ( isFromDeleteSelected ){
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud,message,'eliminados',true, true)
          });
        }else{
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud,message,'eliminado',true, false)
          });
        }
        this.reset();
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message
      });
    }
  }

parseNombres(rowsSelected: any[] , withHtml = false){
  const nombresSelected = rowsSelected.map(reglamento => reglamento.Descripcion_regla);

  const message = nombresSelected.length === 1 
    ? `${this.namesCrud.articulo_singular}${withHtml ? ': <b>' : ' '}${nombresSelected[0]}${withHtml ? '</b>' : ''}`
    : `${this.namesCrud.articulo_plural}${withHtml ? ': <b>' : ' '}${nombresSelected.join(', ')}${withHtml ? '</b>' : ''}`;
  
  return message;
}

capitalizeFirstLetter(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

getWordWithGender(word: string, gender: string): string {
  if (gender === 'femenino') {
    if (word.endsWith('os')) {
      return word.replace(/os$/, 'as'); // Plural
    } else if (word.endsWith('o')) {
      return word.replace(/o$/, 'a'); // Singular
    }
  }
  return word;
}

async openConfirmationDeleteSelected(reglamentoSelected: any){
  const message = mergeNames(this.namesCrud,reglamentoSelected,true,'Descripcion_regla'); 
  this.confirmationService.confirm({
    header: "Confirmar",
    message: `Es necesario confirmar la acción para eliminar ${message}. ¿Desea confirmar?`,
    acceptLabel: 'Si',
    rejectLabel: 'No',
    icon: 'pi pi-exclamation-triangle',
    key: this.keyPopups,
    acceptButtonStyleClass: 'p-button-danger p-button-sm',
    rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
    accept: async () => {
      try {
        await this.deleteReglamentos(reglamentoSelected , true);
      } catch (e:any) {
        this.errorTemplateHandler.processError(
          e, {
            notifyMethod: 'alert',
            summary: `Error al eliminar ${this.namesCrud.singular}`,
            message: e.message,
        });
      }
    }
  })
}

async openConfirmationDelete(reglamento: any){
  this.confirmationService.confirm({
    header: 'Confirmar',
    message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${reglamento.Descripcion_regla}</b>. ¿Desea confirmar?`,
    acceptLabel: 'Si',
    rejectLabel: 'No',
    icon: 'pi pi-exclamation-triangle',
    key: this.keyPopups,
    acceptButtonStyleClass: 'p-button-danger p-button-sm',
    rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
    accept: async () => {
        let reglamentoToDelete = []
        reglamentoToDelete.push(reglamento);
        try {
          await this.deleteReglamentos(reglamento);
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al eliminar ${this.namesCrud.singular}`,
              message: e.message,
          });
        }
    }
  })
}

async submit() {
  try {
    console.log("boton funciona");
    
    if ( this.modeCrud == 'create' ) {
      //modo creacion
      await this.insertReglamento()
    }else{
      //modo edit
      await this.updateReglamento();
    }
  } catch (e:any) {
    const action = this.mode === 'create' ? 'guardar' : 'actualizar';
    this.errorTemplateHandler.processError(
      e, {
        notifyMethod: 'alert',
        summary: `Error al ${action} ${this.namesCrud.singular}`,
        message: e.message,
    });
    } finally {
      this.dialog = false;
    }
  }

  openCreate(){
    this.reglamentosService.setModeCrud('create')
    this.reset();
    this.reglamento = {};
    this.dialog = true;
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.setAction('reset')
  }

  async openEdit(){
    try {
      this.reset();
      const data = this.reglamento;
      await new Promise((resolve,reject) => {
        this.reglamentosService.setModeCrud('edit', data, resolve, reject);
      })
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al editar formulario de ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }finally{
      this.dialog = true;
    }

  }

}

  // changeState(){
//   this.fbForm.controls['files'].updateValueAndValidity();
// }

  // public fbForm : FormGroup = this.fb.group({
  //   Descripcion_regla: ['', [Validators.required , Validators.pattern(/^(?!\s*$).+/)]],
  //   anio: ['', Validators.required],
  //   vigencia: [true],
  //   files: [[], this.filesValidator.bind(this)]
  // })

  
// changeState(){
//   this.fbForm.controls['files'].updateValueAndValidity();
// }

  // public fbForm : FormGroup = this.fb.group({
  //   Descripcion_regla: ['', [Validators.required , Validators.pattern(/^(?!\s*$).+/)]],
  //   anio: ['', Validators.required],
  //   vigencia: [true],
  //   files: [[], this.filesValidator.bind(this)]
  // })

  

  // async loadDocsWithBinary(reglamento: Reglamento){
  //   try {    
  //     const files = await this.reglamentosService.getDocumentosWithBinary(reglamento.Cod_reglamento!)  
  //     this.uploaderFilesService.setFiles(files);      
  //     this.filesChanged(files);
  //     return files
  //   } catch (e:any) {
  //     this.errorTemplateHandler.processError(e, {
  //       notifyMethod: 'alert',
  //       summary: 'Error al obtener documentos',
  //       message: e.detail.error.message.message
  //     });
  //   }
  // }
  
  // async downloadDoc(documento: any) {
  //   try {
  //     let blob: Blob = await this.reglamentosService.getArchiveDoc(documento.id);
  //     this.commonUtils.downloadBlob(blob, documento.nombre);      
  //   } catch (e:any) {
  //     this.errorTemplateHandler.processError(
  //       e, {
  //         notifyMethod: 'alert',
  //         summary: 'Error al descargar documento',
  //         message: e.detail.error.message.message
  //     });
  //   }
  // }



  // async showForm(){
  //   try {
  //     this.reset();
  //     this.fbForm.patchValue({...this.reglamento});
  //     this.fbForm.get('Descripcion_regla')?.disable();
  //     this.fbForm.get('vigencia')?.disable();
  //     this.fbForm.get('anio')?.disable();
  //     await this.loadDocsWithBinary(this.reglamento);
  //   } catch (e:any) {
  //     this.errorTemplateHandler.processError(e, {
  //       notifyMethod: 'alert',
  //       summary: `Error al visualizar ${this.namesCrud.articulo_singular}`,
  //       message: e.message,
  //       }
  //     );
  //   }finally{
  //     this.dialog = true;
  //   }
  // }



// filesChanged(files: any){
//   this.fbForm.patchValue({ files });
//   this.fbForm.controls['files'].updateValueAndValidity();
// }

// reset() {
//   this.fbForm.reset({
//     Descripcion_regla: '',
//     vigencia: true,
//     anio: '',
//     files: [],
//   });
//   this.fbForm.get('Descripcion_regla')?.enable();
//   this.fbForm.get('vigencia')?.enable();
//   this.fbForm.get('anio')?.enable();
//   this.tableCrudService.resetSelectedRows();
//   this.uploaderFilesService.setAction('reset');
//   this.fbForm.controls['files'].updateValueAndValidity();
// }

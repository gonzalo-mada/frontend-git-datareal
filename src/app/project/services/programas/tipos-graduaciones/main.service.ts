import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService } from 'primeng/api';
import { CertificacionIntermedia } from 'src/app/project/models/programas/CertificacionIntermedia';
import { BackendTiposGraduacionesService } from './backend.service';
import { FormTiposGraduacionesService } from './form.service';
import { TableTiposGraduacionesService } from './table.service';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
@Injectable({
    providedIn: 'root'
})

export class TiposGraduacionesMainService {

    namesCrud: NamesCrud = {
        singular: 'tipo de graduación colaborativa',
        plural: 'tipos de graduaciones colaborativas',
        articulo_singular: 'el tipo de graduación colaborativa',
        articulo_plural: 'los tipos de graduaciones colaborativas',
        genero: 'masculino'
    }

    tipos: TipoGraduacion[] = [];
    tipo: TipoGraduacion = {};

    //MODAL
    dialogForm: boolean = false

    constructor(
        private backend: BackendTiposGraduacionesService,
        private confirmationService: ConfirmationService,
        private form: FormTiposGraduacionesService,
        private messageService: MessageServiceGP,
        private table: TableTiposGraduacionesService
    ){
        this.form.initForm();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: TipoGraduacion | null){
        this.form.modeForm = mode;
        if (data) this.tipo = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
        }
    }

    reset(){
        this.form.resetForm();
        this.table.resetSelectedRows();
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    async getTiposGraduaciones(showCountTableValues: boolean = true): Promise<TipoGraduacion[]>{
        this.tipos = await this.backend.getTipoGradConjunta(this.namesCrud);
        if (showCountTableValues) this.backend.countTableRegisters(this.tipos.length, this.namesCrud);
        return this.tipos;
    }

    async createForm(){
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        this.form.resetForm();
        this.form.setForm('show',this.tipo);
        this.dialogForm = true;
    }

    async editForm(){
        this.form.resetForm();
        this.form.setForm('edit',this.tipo);
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            let params = { ...this.form.fbForm.value };
            const response = await this.backend.insertTipoGradConjunta(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted,'creado',true,false)
                });
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getTiposGraduaciones(false);
            this.reset()
        }
    }

    async updateForm(){
        try {
            let params = { 
                ...this.form.fbForm.value,
                Cod_TipoColaborativa: this.tipo.Cod_TipoColaborativa
            }
            const response = await this.backend.updateTipoGradConjunta(params,this.namesCrud);
            if ( response && response.dataWasUpdated ) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                });
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getTiposGraduaciones(false);
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: TipoGraduacion[]){
        try {
            const response = await this.backend.deleteTipoGradConjunta(dataToDelete,this.namesCrud);
            if (response && response.notDeleted.length !== 0) {
                for (let i = 0; i < response.notDeleted.length; i++) {
                    const element = response.notDeleted[i];
                    this.messageService.add({
                        key: 'main',
                        severity: 'warn',
                        summary:  `Error al eliminar ${this.namesCrud.singular}`,
                        detail: element.messageError,
                        sticky: true
                    });
                }
            }
            if (response && response.deleted.length !== 0) {
                const message = mergeNames(null,response.deleted,false,'data');
                if ( response.deleted.length > 1 ){
                  this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,message,'eliminados',true, true)
                  });
                }else{
                  this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,message,'eliminado',true, false)
                  });
                }
            }
        } catch (error) {
            console.log(error);
        }finally{
            this.getTiposGraduaciones(false);
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.tipo.Descripcion_tipoColaborativa}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.tipo);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_tipoColaborativa');
        this.confirmationService.confirm({
            header: "Confirmar",
            message: `Es necesario confirmar la acción para eliminar ${message}. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                await this.deleteRegisters(data);
            }
        }) 
    }


}
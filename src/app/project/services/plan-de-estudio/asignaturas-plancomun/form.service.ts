import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionIntermediaPE } from 'src/app/project/models/plan-de-estudio/CertificacionIntermediaPE';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

@Injectable({
    providedIn: 'root'
})

export class FormAsignaturasPlancomunService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Cod_Facultad_Postgrado_Selected: ['', [Validators.required]],
            Cod_Programa_Postgrado_Selected: ['', [Validators.required]],
            Cod_plan_estudio: ['', [Validators.required]],
            Asignaturas: ['', [Validators.required]],
            aux: ['']
        });
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            Cod_Facultad_Postgrado_Selected: '',
            Cod_Programa_Postgrado_Selected: '',
            Cod_plan_estudio: '',
            Asignaturas: '',
            aux: ''
        });
        this.fbForm.enable();
    }

    setForm(mode:'show' | 'edit' ,data: CertificacionIntermediaPE): void{
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }

    resetFormWhenChangedDropdownFacultad(){
		this.fbForm.get('Cod_Programa_Postgrado_Selected')?.reset();
		this.fbForm.get('Cod_plan_estudio')?.reset();
		this.fbForm.patchValue({ Cod_Programa_Postgrado_Selected: '' });
		this.fbForm.patchValue({ Cod_plan_estudio: '' });
		this.fbForm.patchValue({ Asignaturas: '' });
	}

    resetFormWhenChangedDropdownPrograma(){
		this.fbForm.get('Cod_plan_estudio')?.reset();
		this.fbForm.patchValue({ Cod_plan_estudio: '' });
		this.fbForm.patchValue({ Asignaturas: '' });
	}

    resetFormWhenChangedDropdownPE(){
		this.fbForm.patchValue({ Asignaturas: '' });
	}
}
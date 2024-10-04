import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'programa',
    loadChildren: () => import('../pages/programas/programas.module').then((m) => m.ProgramasModule),
  },
  {
    path: 'mantenedores',
    loadChildren: () => import('../pages/mantenedores/mantenedores.module').then((m) => m.MantenedoresModule),
    data: {title:'Mantenedores'} 
  },
  {
    path: 'asignaturas',
    loadChildren: () => import('../pages/mantenedores-plan/jornada/jornada.module').then((m) => m.JornadaModule),
    data: {title:'Mantenedor jornadas'} 
  },
  {
    path: 'planes',
    loadChildren: () => import('../pages/mantenedores-plan/modalidades/modalidades.module').then((m) => m.ModalidadesModule),
    data: {title:'Mantenedor modalidades'} 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { initialNavigation: 'disabled' })],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}

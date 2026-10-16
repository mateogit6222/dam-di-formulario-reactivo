import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

async function sha256(texto: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

@Component({
  selector: 'app-driven',
  templateUrl: './driven.page.html',
  styleUrls: ['./driven.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonInput,
    IonNote,
    IonButton,
    IonSpinner
  ]
})
export class DrivenPage {
  public usuario = {
    nombre: '',
    email: '',
    password: '',
    fechaNacimiento: ''
  };

  public isSubmitting = signal<boolean>(false);
  public maxFechaHoy: string = new Date().toISOString().split('T')[0];

  constructor(private alertController: AlertController) {}

  public async onSubmit(form: NgForm): Promise<void> {
    if (this.usuario.fechaNacimiento > this.maxFechaHoy) {
      alert('La fecha de nacimiento no puede ser posterior a hoy');
      return;
    }

    if (form.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    try {
      const contrasenaCifrada = await sha256(this.usuario.password);

      const payloadSeguro = {
        ...this.usuario,
        password: contrasenaCifrada
      };

      console.log('Template-Driven Form enviado con éxito:', payloadSeguro);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const alert = await this.alertController.create({
        header: '¡Registro Template-Driven!',
        subHeader: 'Formulario enviado correctamente',
        message: `Usuario ${this.usuario.nombre} registrado con Template-Driven Forms.`,
        buttons: ['Aceptar']
      });

      await alert.present();
      form.resetForm();
    } catch (error) {
      console.error('Error al enviar formulario Template-Driven', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
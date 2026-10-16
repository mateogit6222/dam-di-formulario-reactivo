import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
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
  IonRow,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import jsPDF from 'jspdf';

function fechaNoFuturaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const fechaSeleccionada = new Date(control.value);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);

  if (fechaSeleccionada > hoy) {
    return { fechaFutura: true };
  }
  return null;
}

// Función auxiliar para cifrar mediante hash SHA-256
async function sha256(texto: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
    IonButton,
    IonSpinner
  ]
})
export class RegistroPage {
  public registroForm: FormGroup;
  public isSubmitting = signal<boolean>(false);
  public darkMode = signal<boolean>(false);
  public datosEnviados = signal<any>(null);

  public maxFechaHoy: string = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
        ]
      ],
      fechaNacimiento: ['', [Validators.required, fechaNoFuturaValidator]]
    });
  }

  get f() {
    return this.registroForm.controls;
  }

  public toggleDarkMode(): void {
    const nuevoEstado = !this.darkMode();
    this.darkMode.set(nuevoEstado);
    document.documentElement.classList.toggle('ion-palette-dark', nuevoEstado);
    document.body.classList.toggle('dark', nuevoEstado);
  }

  public async onSubmit(): Promise<void> {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formRaw = this.registroForm.value;

      // Cifrado de contraseña con SHA-256 (Punto 10)
      const contrasenaCifrada = await sha256(formRaw.password);

      const payloadSeguro = {
        ...formRaw,
        password: contrasenaCifrada // Se reemplaza el texto plano por el hash
      };

      // Se imprime en consola sin exponer la clave en plano
      console.log('Payload seguro a enviar:', payloadSeguro);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      this.datosEnviados.set({ ...payloadSeguro });

      const alert = await this.alertController.create({
        header: '¡Registro Exitoso!',
        subHeader: 'Formulario enviado correctamente',
        message: `Bienvenido/a, ${formRaw.nombre}. Tu registro se ha procesado con contraseña protegida.`,
        buttons: ['Aceptar']
      });

      await alert.present();
      this.registroForm.reset();
    } catch (error) {
      console.error('Error al procesar el formulario', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public descargarPDF(): void {
    const datos = this.datosEnviados();
    if (!datos) return;

    const doc = new jsPDF();

    doc.setFillColor(56, 128, 255);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Resguardo de Registro de Usuario', 15, 20);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);

    let y = 50;
    doc.text(`Nombre completo: ${datos.nombre}`, 20, y);
    y += 12;
    doc.text(`Correo electrónico: ${datos.email}`, 20, y);
    y += 12;
    doc.text(`Fecha de nacimiento: ${datos.fechaNacimiento}`, 20, y);
    y += 12;
    doc.text(`Hash contraseña (SHA-256): ${datos.password.substring(0, 20)}...`, 20, y);
    y += 12;
    doc.text(`Fecha de expedición: ${new Date().toLocaleString()}`, 20, y);

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Documento generado automáticamente por la aplicación de Formularios Reactivos.', 20, 130);

    doc.save(`registro_${datos.nombre.replace(/\s+/g, '_')}.pdf`);
  }
}
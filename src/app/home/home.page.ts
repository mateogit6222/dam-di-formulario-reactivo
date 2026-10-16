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
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/angular';
import jsPDF from 'jspdf';

// Validador personalizado: La fecha no puede ser posterior al día de hoy
function fechaNoFuturaValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  const fechaSeleccionada = new Date(control.value);
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999); // Final del día actual

  if (fechaSeleccionada > hoy) {
    return { fechaFutura: true };
  }
  return null;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonSpinner
  ]
})
export class HomePage {
  public registroForm: FormGroup;
  public isSubmitting = signal<boolean>(false);
  public darkMode = signal<boolean>(false);
  // Almacena los últimos datos registrados para poder generar el PDF
  public datosEnviados = signal<any>(null);

  // Fecha máxima permitida para el input en formato YYYY-MM-DD
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
      // Requisito 4 y 6: Campo fecha de nacimiento obligatoria y no superior a hoy
      fechaNacimiento: ['', [Validators.required, fechaNoFuturaValidator]]
    });
  }

  get f() {
    return this.registroForm.controls;
  }

  // Requisito 7: Alternar entre modo claro y oscuro
  public toggleDarkMode(): void {
    const nuevoEstado = !this.darkMode();
    this.darkMode.set(nuevoEstado);

    // Conmuta las clases estándar de Ionic para modo oscuro
    document.documentElement.classList.toggle('ion-palette-dark', nuevoEstado);
    document.body.classList.toggle('dark', nuevoEstado);
  }

  // Requisito 5: Enviar formulario y mostrar Alert de Ionic
  public async onSubmit(): Promise<void> {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formData = this.registroForm.value;
      console.log('Datos enviados:', formData);

      // Simulación de petición de guardado
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Guardamos una copia para habilitar la descarga del PDF
      this.datosEnviados.set({ ...formData });

      // Alert nativo de Ionic notificando el éxito
      const alert = await this.alertController.create({
        header: '¡Registro Exitoso!',
        subHeader: 'Formulario enviado correctamente',
        message: `Bienvenido/a, ${formData.nombre}. Tus datos han sido procesados. Ya puedes descargar tu resguardo en PDF.`,
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

  // Requisito 8: Descargar PDF con los datos del usuario registrado
  public descargarPDF(): void {
    const datos = this.datosEnviados();
    if (!datos) {
      return;
    }

    const doc = new jsPDF();

    // Encabezado
    doc.setFillColor(56, 128, 255);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Resguardo de Registro de Usuario', 15, 20);

    // Cuerpo con datos
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);

    let y = 50;
    doc.text(`Nombre completo: ${datos.nombre}`, 20, y);
    y += 12;
    doc.text(`Correo electrónico: ${datos.email}`, 20, y);
    y += 12;
    doc.text(`Fecha de nacimiento: ${datos.fechaNacimiento}`, 20, y);
    y += 12;
    doc.text(`Fecha de expedición: ${new Date().toLocaleString()}`, 20, y);

    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Documento generado automáticamente por la aplicación de Formularios Reactivos.', 20, 120);

    // Guardar archivo
    doc.save(`registro_${datos.nombre.replace(/\s+/g, '_')}.pdf`);
  }
}
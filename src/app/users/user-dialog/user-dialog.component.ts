import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

export interface DialogData {
  title: string;
  user?: User;
}

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule
  ]
})
export class UserDialogComponent implements OnInit {
  userForm!: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      name: [this.data.user?.name || '', [Validators.required]],
      email: [this.data.user?.email || '', [Validators.required, Validators.email]],
      gender: [this.data.user?.gender || 'male', [Validators.required]],
      status: [this.data.user?.status || 'active', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    const formData = this.userForm.value;

    if (this.data.user?.id) {
      // Update existing user
      const updateData: Partial<User> = formData;
      this.userService.updateUser(this.data.user.id, updateData).subscribe({
        next: () => {
          this.snackBar.open('Utente aggiornato con successo', 'Chiudi', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => this.handleError(error)
      });
    } else {
      // Create new user - assicuriamo che tutti i campi richiesti siano presenti
      const newUser = {
        name: formData.name,
        email: formData.email,
        gender: formData.gender,
        status: formData.status
      };
      this.userService.createUser(newUser).subscribe({
        next: () => {
          this.snackBar.open('Utente creato con successo', 'Chiudi', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => this.handleError(error)
      });
    }
  }

  private handleError(error: any): void {
    console.error('Errore durante il salvataggio dell\'utente', error);
    this.isSubmitting = false;
    this.snackBar.open(
      'Errore durante il salvataggio dell\'utente: ' + (error.error?.message || 'Errore sconosciuto'),
      'Chiudi',
      { duration: 5000 }
    );
  }
}

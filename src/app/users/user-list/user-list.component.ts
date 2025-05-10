import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule
  ]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = ['id', 'name', 'email', 'gender', 'status', 'actions'];
  searchForm!: FormGroup;
  loading = false;
  totalUsers = 0;
  perPage = 20;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initSearchForm();
    this.loadUsers();
  }

  initSearchForm(): void {
    this.searchForm = this.fb.group({
      name: [''],
      email: ['']
    });
  }

  loadUsers(page: number = 1): void {
    const { name, email } = this.searchForm.value;
    this.loading = true;

    this.userService.getUsers(page, this.perPage, name, email)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.dataSource.data = users;
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        },
        error: (error) => {
          console.error('Errore nel caricamento degli utenti', error);
          this.snackBar.open('Errore nel caricamento degli utenti', 'Chiudi', {
            duration: 3000
          });
        }
      });
  }

  onSearch(): void {
    this.loadUsers();
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.loadUsers();
  }

  viewUserDetails(userId: number): void {
    this.router.navigate(['/users', userId]);
  }

  createUser(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { title: 'Crea Nuovo Utente' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Ricarica la lista degli utenti dopo la creazione
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { title: 'Modifica Utente', user: {...user} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Ricarica la lista degli utenti dopo la modifica
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Sei sicuro di voler eliminare questo utente?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.snackBar.open('Utente eliminato con successo', 'Chiudi', {
            duration: 3000
          });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Errore durante l\'eliminazione dell\'utente', error);
          this.snackBar.open('Errore durante l\'eliminazione dell\'utente', 'Chiudi', {
            duration: 3000
          });
        }
      });
    }
  }

  onPageChange(event: any): void {
    this.loadUsers(event.pageIndex + 1);
  }
}

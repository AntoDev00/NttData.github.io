import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Post } from '../../core/models/post.model';
import { PostService } from '../../core/services/post.service';
import { UserService } from '../../core/services/user.service';
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
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss'],
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
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  dataSource = new MatTableDataSource<Post>([]);
  displayedColumns: string[] = ['id', 'title', 'actions'];
  searchForm!: FormGroup;
  loading = false;
  perPage = 20;
  newPostForm!: FormGroup;
  showNewPostForm = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private postService: PostService,
    private userService: UserService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initSearchForm();
    this.initNewPostForm();
    this.loadPosts();
  }

  initSearchForm(): void {
    this.searchForm = this.fb.group({
      title: ['']
    });
  }

  initNewPostForm(): void {
    this.newPostForm = this.fb.group({
      title: [''],
      body: [''],
      user_id: ['']
    });
  }

  loadPosts(page: number = 1): void {
    const { title } = this.searchForm.value;
    this.loading = true;
    
    console.log(`Caricamento post: page=${page}, perPage=${this.perPage}`);

    this.postService.getPosts(page, this.perPage, title)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (posts) => {
          console.log(`Post caricati: ${posts.length}`);
          this.posts = posts;
          this.dataSource.data = posts;
          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        },
        error: (error) => {
          console.error('Errore nel caricamento dei post', error);
          this.snackBar.open('Errore nel caricamento dei post', 'Chiudi', {
            duration: 3000
          });
        }
      });
  }

  onSearch(): void {
    this.loadPosts();
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.loadPosts();
  }

  viewPostDetails(postId: number): void {
    this.router.navigate(['/posts', postId]);
  }

  toggleNewPostForm(): void {
    this.showNewPostForm = !this.showNewPostForm;
    if (this.showNewPostForm) {
      this.newPostForm.reset();
    }
  }

  submitNewPost(): void {
    if (this.newPostForm.valid) {
      const post: Omit<Post, 'id'> = this.newPostForm.value;
      
      this.postService.createPost(post).subscribe({
        next: () => {
          this.snackBar.open('Post creato con successo', 'Chiudi', {
            duration: 3000
          });
          this.toggleNewPostForm();
          this.loadPosts();
        },
        error: (error) => {
          console.error('Errore durante la creazione del post', error);
          this.snackBar.open('Errore durante la creazione del post', 'Chiudi', {
            duration: 3000
          });
        }
      });
    }
  }

  onPageChange(event: any): void {
    this.perPage = event.pageSize;
    this.loadPosts(event.pageIndex + 1);
  }
}

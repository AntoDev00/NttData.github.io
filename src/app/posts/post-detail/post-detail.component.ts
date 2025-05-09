import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { Post } from '../../core/models/post.model';
import { Comment } from '../../core/models/comment.model';
import { User } from '../../core/models/user.model';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { UserService } from '../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule
  ]
})
export class PostDetailComponent implements OnInit {
  postId!: number;
  post: Post | null = null;
  comments: Comment[] = [];
  user: User | null = null;
  loadingPost = false;
  loadingComments = false;
  loadingUser = false;
  commentForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private commentService: CommentService,
    private userService: UserService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initCommentForm();
    this.route.paramMap.subscribe(params => {
      const postId = params.get('id');
      if (postId) {
        this.postId = +postId;
        this.loadPostDetails();
        this.loadComments();
      } else {
        this.router.navigate(['/posts']);
      }
    });
  }

  initCommentForm(): void {
    this.commentForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      body: ['', Validators.required]
    });
  }

  loadPostDetails(): void {
    this.loadingPost = true;
    this.postService.getPostById(this.postId)
      .pipe(finalize(() => this.loadingPost = false))
      .subscribe({
        next: (post) => {
          this.post = post;
          this.loadUserDetails(post.user_id);
        },
        error: (error) => {
          console.error('Errore nel caricamento dei dettagli del post', error);
          this.snackBar.open('Errore nel caricamento dei dettagli del post', 'Chiudi', {
            duration: 3000
          });
          this.router.navigate(['/posts']);
        }
      });
  }

  loadUserDetails(userId: number): void {
    this.loadingUser = true;
    this.userService.getUserById(userId)
      .pipe(finalize(() => this.loadingUser = false))
      .subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Errore nel caricamento dei dettagli dell\'utente', error);
        }
      });
  }

  loadComments(): void {
    this.loadingComments = true;
    this.commentService.getPostComments(this.postId)
      .pipe(finalize(() => this.loadingComments = false))
      .subscribe({
        next: (comments) => {
          this.comments = comments;
        },
        error: (error) => {
          console.error('Errore nel caricamento dei commenti', error);
          this.snackBar.open('Errore nel caricamento dei commenti', 'Chiudi', {
            duration: 3000
          });
        }
      });
  }

  submitComment(): void {
    if (this.commentForm.valid) {
      const comment: Omit<Comment, 'id'> = {
        post_id: this.postId,
        name: this.commentForm.value.name,
        email: this.commentForm.value.email,
        body: this.commentForm.value.body
      };

      this.commentService.createComment(comment).subscribe({
        next: (newComment) => {
          this.comments.unshift(newComment); // Aggiungi il nuovo commento all'inizio della lista
          this.commentForm.reset();
          this.snackBar.open('Commento aggiunto con successo', 'Chiudi', {
            duration: 3000
          });
        },
        error: (error) => {
          console.error('Errore durante l\'aggiunta del commento', error);
          this.snackBar.open('Errore durante l\'aggiunta del commento', 'Chiudi', {
            duration: 3000
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }
}

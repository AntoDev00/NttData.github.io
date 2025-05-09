import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import { User } from '../../core/models/user.model';
import { Post } from '../../core/models/post.model';
import { Comment } from '../../core/models/comment.model';
import { UserService } from '../../core/services/user.service';
import { PostService } from '../../core/services/post.service';
import { CommentService } from '../../core/services/comment.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatExpansionModule
  ]
})
export class UserDetailComponent implements OnInit {
  userId!: number;
  user: User | null = null;
  posts: Post[] = [];
  commentsMap: Map<number, Comment[]> = new Map();
  loadingUser = false;
  loadingPosts = false;
  commentForm!: FormGroup;
  selectedPostId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private postService: PostService,
    private commentService: CommentService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initCommentForm();
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id');
      if (userId) {
        this.userId = +userId;
        this.loadUserDetails();
        this.loadUserPosts();
      } else {
        this.router.navigate(['/users']);
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

  loadUserDetails(): void {
    this.loadingUser = true;
    this.userService.getUserById(this.userId)
      .pipe(finalize(() => this.loadingUser = false))
      .subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Errore nel caricamento dei dettagli dell\'utente', error);
          this.snackBar.open('Errore nel caricamento dei dettagli dell\'utente', 'Chiudi', {
            duration: 3000
          });
          this.router.navigate(['/users']);
        }
      });
  }

  loadUserPosts(): void {
    this.loadingPosts = true;
    this.postService.getUserPosts(this.userId)
      .pipe(
        switchMap(posts => {
          this.posts = posts;
          if (posts.length === 0) {
            this.loadingPosts = false;
            return of([]);
          }
          
          // Carica i commenti per ogni post
          const commentObservables: Observable<any>[] = [];
          for (const post of posts) {
            commentObservables.push(
              this.commentService.getPostComments(post.id).pipe(
                catchError(() => of([]))
              )
            );
          }
          
          return forkJoin(commentObservables);
        }),
        finalize(() => this.loadingPosts = false)
      )
      .subscribe({
        next: (commentsArrays: Comment[][]) => {
          // Mappa i commenti per post
          this.posts.forEach((post, index) => {
            if (commentsArrays[index]) {
              this.commentsMap.set(post.id, commentsArrays[index]);
            } else {
              this.commentsMap.set(post.id, []);
            }
          });
        },
        error: (error) => {
          console.error('Errore nel caricamento dei post dell\'utente', error);
          this.snackBar.open('Errore nel caricamento dei post dell\'utente', 'Chiudi', {
            duration: 3000
          });
        }
      });
  }

  getCommentsForPost(postId: number): Comment[] {
    return this.commentsMap.get(postId) || [];
  }

  selectPostForComment(postId: number): void {
    this.selectedPostId = postId;
    this.commentForm.reset();
  }

  submitComment(): void {
    if (this.commentForm.valid && this.selectedPostId) {
      const comment: Omit<Comment, 'id'> = {
        post_id: this.selectedPostId,
        name: this.commentForm.value.name,
        email: this.commentForm.value.email,
        body: this.commentForm.value.body
      };

      this.commentService.createComment(comment).subscribe({
        next: (newComment) => {
          // Aggiorna la lista dei commenti
          const currentComments = this.commentsMap.get(this.selectedPostId!) || [];
          this.commentsMap.set(this.selectedPostId!, [...currentComments, newComment]);
          
          this.commentForm.reset();
          this.selectedPostId = null;
          
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

  cancelComment(): void {
    this.commentForm.reset();
    this.selectedPostId = null;
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}

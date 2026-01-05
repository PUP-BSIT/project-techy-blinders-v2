import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CATEGORY_OPTIONS, Post } from '../../../../models/post.model';

@Component({
  selector: 'app-create-post',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.scss'
})
export class CreatePost {
   @Input() editPost: Post | null = null;
  
  title: string = '';
  category: string = '';
  content: string = '';
  categories = CATEGORY_OPTIONS;
  editMode: boolean = false;

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() createPost = new EventEmitter<Partial<Post>>();
  @Output() updatePost = 
  new EventEmitter<{postId: string, updates: Partial<Post>}>();

  ngOnInit() {
    if (this.editPost) {
      this.editMode = true;
      this.title = this.editPost.title;
      this.category = this.editPost.category;
      this.content = this.editPost.content;
    }
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  isValid(): boolean {
    return !!(this.title.trim() && this.category && this.title.length <= 50);
  }

  onSubmit() {
    if (this.isValid()) {
      if (this.editMode && this.editPost) {
        const updates: Partial<Post> = {
          title: this.title,
          category: this.category,
          content: this.content
        };
        
        if (!this.editPost.slug.startsWith('flashcard-') && 
          !this.editPost.slug.startsWith('quiz-')) {
          updates.slug = this.title.toLowerCase().replace(/\s+/g, '-');
        }
        
        this.updatePost.emit({ postId: this.editPost.post_id, updates });
      } else {
        const newPost: Partial<Post> = {
          title: this.title,
          category: this.category,
          content: this.content,
          slug: this.title.toLowerCase().replace(/\s+/g, '-')
        };
        this.createPost.emit(newPost);
      }
      this.closeModal();
    }
  }
}
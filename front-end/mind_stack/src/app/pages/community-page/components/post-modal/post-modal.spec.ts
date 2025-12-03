import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostModal } from './post-modal';
import { Post } from '../../../../models/post.model';

describe('PostModal', () => {
  let component: PostModal;
  let fixture: ComponentFixture<PostModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostModal);
    component = fixture.componentInstance;
    
    // Provide required post input
    component.post = {
      post_id: '1',
      user_id: 'user1',
      username: 'testuser',
      title: 'Test Post',
      content: 'Test content',
      slug: 'test-post',
      category: 'general',
      is_published: true,
      created_at: new Date(),
      updated_at: new Date(),
      commentcount: 0,
      showcomment: false,
      likes: 0,
      dislikes: 0
    } as Post;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

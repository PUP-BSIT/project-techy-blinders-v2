import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../service/auth.service';
import { StudySet, StudySetsService } from '../../../service/study-sets.service';
import { CommunityService } from '../../../service/community.service';

@Component({
  selector: 'app-study-sets-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './study-sets-page.html',
  styleUrls: ['./study-sets-page.scss']
})
export class StudySetsPage implements OnInit, OnDestroy {
  isModalOpen: boolean = false;
  isFlashcardModalOpen: boolean = false;
  isConfirmModalOpen: boolean = false;
  studySetTitle: string = '';
  studySetDescription: string = '';
  flashcards: { flashcardId?: number; term: string; definition: string; isNew?: boolean }[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 3;
  studySetsCurrentPage: number = 0;
  studySetsPerPage: number = 3;
  editingStudySetId: number | null = null;
  currentStudySetId: number | null = null;
  activeDropdown: number | null = null;
  isPrivacyModalOpen: boolean = false;
  isShareModalOpen: boolean = false;
  selectedStudySetId: number | null = null;
  shareTitle: string = '';
  shareCategory: string = '';
  shareDescription: string = '';
  isLoading: boolean = false;
  studySets: StudySet[] = [];

  private studySetsService = inject(StudySetsService);
  private authService = inject(AuthService);
  private communityService = inject(CommunityService);

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadStudySets();
    this.route.queryParams.subscribe(params => {
      if (params['create'] === 'true') {
        this.openModal();
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          queryParamsHandling: 'merge'
        });
      }
    });

    window.addEventListener('storage', this.onStorageEvent);
  }

  private onStorageEvent = (e: StorageEvent) => {
    if (!e) return;
    if (e.key === 'studySetsUpdated') {
      this.loadStudySets();
    }
  }

  private loadStudySets(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    this.isLoading = true;
    this.studySetsService.getStudySetsByUserId(currentUser.userId).subscribe({
      next: (studySets) => {
        this.studySets = (studySets || []).slice().sort((a, b) => {
          const aId = a.flashcard_id || 0;
          const bId = b.flashcard_id || 0;
          return aId - bId;
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading study sets:', error);
        console.error('Error details:', {
          status: error?.status,
          statusText: error?.statusText,
          message: error?.message,
          error: error?.error
        });
        this.isLoading = false;
        alert('Failed to load study sets. Please check the console for details.');
      }
    });
  }

  get paginatedStudySets(): StudySet[] {
    const startIndex = this.studySetsCurrentPage * this.studySetsPerPage;
    return this.studySets.slice(startIndex, startIndex + this.studySetsPerPage);
  }

  get studySetsTotalPages(): number {
    return Math.ceil(this.studySets.length / this.studySetsPerPage);
  }

  get studySetsPages(): (number | string)[] {
    const totalPages = this.studySetsTotalPages;
    const currentPage = this.studySetsCurrentPage;
    const pages: (number | string)[] = [];

    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    pages.push(0, 1, 2);

    if (totalPages > 4) {
      pages.push('...');
    }

    if (totalPages > 3) {
      pages.push(totalPages - 1);
    }

    return pages;
  }

  goToStudySetsPage(page: number) {
    this.studySetsCurrentPage = page;
  }

  isPageNumber(page: number | string): boolean {
    return typeof page === 'number';
  }

  getPageNumber(page: number | string): number {
    return page as number;
  }

  getPageDisplay(page: number | string): string {
    return typeof page === 'number' ? String((page as number) + 1) : page as string;
  }

  nextStudySetsPage() {
    if (this.studySetsCurrentPage < this.studySetsTotalPages - 1) {
      this.studySetsCurrentPage++;
    }
  }

  previousStudySetsPage() {
    if (this.studySetsCurrentPage > 0) {
      this.studySetsCurrentPage--;
    }
  }

  openModal() {
    this.isModalOpen = true;
    this.studySetTitle = '';
    this.studySetDescription = '';
    this.editingStudySetId = null;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isConfirmModalOpen = false;
    this.editingStudySetId = null;
  }

  openConfirmModal() {
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
  }

  confirmCancel() {
    this.isConfirmModalOpen = false;
    this.isModalOpen = false;
  }

  // Deletion confirmation for study sets
  pendingDeleteStudySetId: number | null = null;

  openDeleteConfirm(id: number) {
    this.pendingDeleteStudySetId = id;
    this.openConfirmModal();
  }

  confirmDelete() {
    if (this.pendingDeleteStudySetId !== null) {
      const id = this.pendingDeleteStudySetId;
      this.pendingDeleteStudySetId = null;
      this.closeConfirmModal();
      this.deleteStudySet(id);
    }
  }

  cancelDelete() {
    this.pendingDeleteStudySetId = null;
    this.closeConfirmModal();
  }

  saveStudySet() {
    if (this.studySetTitle.trim()) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      this.isLoading = true;
      this.studySetsService.createStudySet(
        currentUser.userId,
        this.studySetTitle,
        this.studySetDescription,
        false,
        []
      ).subscribe({
        next: (newStudySet) => {
          this.currentStudySetId = newStudySet.flashcard_id;
          this.flashcards = [];
          this.currentPage = 0;
          this.isLoading = false;
          this.closeModal();
          this.openFlashcardModal();

          this.studySets.push(newStudySet);
          this.studySets.sort((a, b) => (a.flashcard_id || 0) - (b.flashcard_id || 0));

          try { localStorage.setItem('studySetsUpdated', Date.now().toString()); } catch (e) {}
        },
        error: (error) => {
          console.error('Error creating study set:', error);
          console.error('Error details:', {
            status: error?.status,
            statusText: error?.statusText,
            message: error?.message,
            error: error?.error
          });
          this.isLoading = false;
          alert('Failed to create study set. Please check the console for details.');
        }
      });
    }
  }

  openFlashcardModal() {
    this.isFlashcardModalOpen = true;
  }

  closeFlashcardModal() {
    this.isFlashcardModalOpen = false;
    this.flashcards = [];
    this.currentPage = 0;
    this.currentStudySetId = null;
  }

  saveFlashcards() {
    console.log('=== SAVE FLASHCARDS CALLED ===');
    console.log('Current Study Set ID:', this.currentStudySetId);
    console.log('Total Flashcards:', this.flashcards.length);
    
    if (this.currentStudySetId !== null) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      let studySet = this.studySets.find(s => s.flashcard_id === this.currentStudySetId);
      
      if (!studySet) {
        this.isLoading = true;
        this.studySetsService.getStudySetById(this.currentStudySetId).subscribe({
          next: (fetchedSet) => {
            this.proceedWithSave(fetchedSet, currentUser.userId);
          },
          error: (error) => {
            console.error('Error fetching study set:', error);
            this.isLoading = false;
            alert('Failed to fetch study set. Please try again.');
          }
        });
      } else {
        this.proceedWithSave(studySet, currentUser.userId);
      }
    } else {
      this.closeFlashcardModal();
    }
  }

  private proceedWithSave(studySet: StudySet, userId: number) {
    if (!studySet || this.currentStudySetId === null) {
      console.error('Study set not found');
      this.closeFlashcardModal();
      return;
    }

    this.isLoading = true;

    const prepared = this.flashcards
      .map(f => ({ keyTerm: f.term.trim(), definition: f.definition.trim(), flashcardId: f.flashcardId, isNew: f.isNew }))
      .filter(f => f.keyTerm && f.definition);

    console.log('Saving flashcards (individual):', prepared);

    const studySetIdToRefresh = this.currentStudySetId as number;

    const toCreate = prepared.filter(f => !f.flashcardId);
    const toUpdate = prepared.filter(f => !!f.flashcardId);

    const createObs = toCreate.map(f => this.studySetsService.addFlashcardToSet(studySetIdToRefresh, f.keyTerm, f.definition));
    const updateObs = toUpdate.map(f => this.studySetsService.updateFlashcard(f.flashcardId as number, f.keyTerm, f.definition));

    const allObs = [...createObs, ...updateObs];
    const batch$ = allObs.length ? forkJoin(allObs) : of([]);

    batch$.subscribe({
      next: (results) => {
        console.log('Flashcards saved/updated individually:', results);

        const createdIds: number[] = [];
        try {
          for (let i = 0; i < createObs.length; i++) {
            const res = results[i];
            if (res && typeof res === 'object' && res.flashcardId) {
              createdIds.push(Number(res.flashcardId));
              continue;
            }

            if (typeof res === 'string') {
              const m = res.match(/"flashcardId"\s*:\s*(\d+)/);
              if (m && m[1]) {
                createdIds.push(Number(m[1]));
                continue;
              }
              try {
                const parsed = JSON.parse(res);
                if (parsed && parsed.flashcardId) createdIds.push(Number(parsed.flashcardId));
              } catch (err) {
              }
            }
          }
        } catch (e) {
          console.warn('Failed parsing individual responses for created IDs', e);
        }

        this.isLoading = false;
        this.closeFlashcardModal();
        this.refreshStudySetFromBackend(studySetIdToRefresh, createdIds);
      },
      error: (error) => {
        console.error('Error saving individual flashcards:', error);
        this.isLoading = false;
        alert('Failed to save flashcards. Please check the console for details.');
      }
    });
  }

  addFlashcard() {
    const newFlashcard = { term: '', definition: '', isNew: true };
    this.flashcards.push(newFlashcard);
    console.log('Added new flashcard. Total count:', this.flashcards.length);

    this.currentPage = Math.floor((this.flashcards.length - 1) / this.itemsPerPage);
    console.log('Navigated to page:', this.currentPage);
  }

  editFlashcard(index: number) {
    const flashcard = this.flashcards[index];
    if (flashcard && flashcard.flashcardId) {
      flashcard.isNew = false;
    }
    console.log('Editing flashcard:', index, flashcard);
  }

  deleteFlashcard(index: number) {
    const flashcardToDelete = this.flashcards[index];
    
    if (flashcardToDelete.flashcardId) {
      this.isLoading = true;
      this.studySetsService.deleteFlashcard(flashcardToDelete.flashcardId).subscribe({
        next: () => {
          console.log('Flashcard deleted from backend with ID:', flashcardToDelete.flashcardId);
          this.flashcards.splice(index, 1);
          const maxPage = Math.max(0, Math.ceil(this.flashcards.length / this.itemsPerPage) - 1);
          if (this.currentPage > maxPage) {
            this.currentPage = maxPage;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting flashcard:', error);
          this.isLoading = false;
          alert('Failed to delete flashcard. Please try again.');
        }
      });
    } else {
      this.flashcards.splice(index, 1);
      const maxPage = Math.max(0, Math.ceil(this.flashcards.length / this.itemsPerPage) - 1);
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage;
      }
    }
  }

  ngOnDestroy() {
    try { window.removeEventListener('storage', this.onStorageEvent); } catch (e) {}
  }
  get paginatedFlashcards() {
    const startIndex = this.currentPage * this.itemsPerPage;
    return this.flashcards.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.flashcards.length / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  getActualIndex(localIndex: number): number {
    return this.currentPage * this.itemsPerPage + localIndex;
  }

  editStudySet(id: number) {
    this.isLoading = true;
    this.studySetsService.getStudySetById(id).subscribe({
      next: (studySet) => {
        this.currentStudySetId = id;
        
        const sorted = [...studySet.flashcards].sort((a, b) => {
          const aId = a.flashcardId || 0;
          const bId = b.flashcardId || 0;
          return aId - bId;
        });

        this.flashcards = sorted.map(f => ({
          flashcardId: f.flashcardId,
          term: f.keyTerm,
          definition: f.definition || '',
          isNew: false
        }));
        
        this.currentPage = 0;
        this.isLoading = false;
        this.openFlashcardModal();
      },
      error: (error) => {
        console.error('Error loading study set:', error);
        this.isLoading = false;
      }
    });
    this.closeDropdown();
  }

  private refreshStudySetFromBackend(id: number, createdIds: number[] = []) {
    this.studySetsService.getStudySetById(id).subscribe({
      next: (freshStudySet) => {
        const index = this.studySets.findIndex(s => s.flashcard_id === freshStudySet.flashcard_id);
        if (index !== -1) {
          this.studySets[index] = freshStudySet;
          console.log('Refreshed study set in local array');
        }

        if (this.currentStudySetId === id) {
          const createdSet = new Set(createdIds.map(id => Number(id)));
          
          const existingFlashcards = freshStudySet.flashcards.filter(f => 
            !createdSet.has(Number(f.flashcardId))
          );
          
          const newlyCreatedFlashcards = freshStudySet.flashcards.filter(f => 
            createdSet.has(Number(f.flashcardId))
          );
          
          existingFlashcards.sort((a, b) => {
            const aId = a.flashcardId || 0;
            const bId = b.flashcardId || 0;
            return aId - bId;
          });
          
          const orderedNewFlashcards = createdIds
            .map(id => newlyCreatedFlashcards.find(f => Number(f.flashcardId) === Number(id)))
            .filter((f): f is NonNullable<typeof f> => f !== undefined);
          
          this.flashcards = [...existingFlashcards, ...orderedNewFlashcards].map(f => ({
            flashcardId: f.flashcardId,
            term: f.keyTerm,
            definition: f.definition || '',
            isNew: false
          }));
          
          console.log('Updated flashcard order - existing:', existingFlashcards.length, 'new:', orderedNewFlashcards.length);
        }
      },
      error: (error) => {
        console.error('Error refreshing study set:', error);
      }
    });
  }

  deleteStudySet(id: number) {
    this.isLoading = true;
    this.studySetsService.deleteStudySet(id).subscribe({
      next: () => {
        this.studySets = this.studySets.filter(s => s.flashcard_id !== id);
        const maxPage = Math.max(0, Math.ceil(this.studySets.length / this.studySetsPerPage) - 1);
        if (this.studySetsCurrentPage > maxPage) {
          this.studySetsCurrentPage = maxPage;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting study set:', error);
        this.isLoading = false;
      }
    });
    this.closeDropdown();
  }

  playStudySet(id: number) {
    this.router.navigate(['/app/study-sets', id]);
    this.closeDropdown(); // Close any open dropdown
  }

  toggleDropdown(index: number) {
    this.activeDropdown = this.activeDropdown === index ? null : index;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  togglePrivacy(id: number) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    const studySet = this.studySets.find(s => s.flashcard_id === id);
    if (!studySet) {
      console.error('Study set not found');
      return;
    }

    this.isLoading = true;
    const newPrivacyStatus = !studySet.is_public;
    
    this.studySetsService.updateStudySet(
      id,
      currentUser.userId,
      studySet.title,
      studySet.description,
      newPrivacyStatus,
      studySet.flashcards
    ).subscribe({
      next: (updatedStudySet) => {
        const index = this.studySets.findIndex(s => s.flashcard_id === updatedStudySet.flashcard_id);
        if (index !== -1) {
          this.studySets[index] = updatedStudySet;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating privacy:', error);
        this.isLoading = false;
      }
    });
    this.activeDropdown = null;
  }

  openPrivacyModal(studySetId: number) {
    this.selectedStudySetId = studySetId;
    this.isPrivacyModalOpen = true;
  }

  closePrivacyModal() {
    this.isPrivacyModalOpen = false;
    this.selectedStudySetId = null;
  }

  selectShareOption() {
    if (this.selectedStudySetId !== null) {
      const studySetId = this.selectedStudySetId;
      this.closePrivacyModal();
      this.openShareModal(studySetId);
    }
  }

  selectPrivateOption() {
    if (this.selectedStudySetId !== null) {
      this.makeStudySetPrivate(this.selectedStudySetId);
    }
    this.closePrivacyModal();
  }

  openShareModal(studySetId?: number) {
    this.isShareModalOpen = true;
    if (studySetId) {
      this.selectedStudySetId = studySetId;
      const studySet = this.studySets.find(s => s.flashcard_id === studySetId);
      if (studySet) {
        this.shareTitle = studySet.title;
        this.shareDescription = studySet.description || '';
      }
    } else {
      this.selectedStudySetId = null;
      this.shareTitle = '';
      this.shareCategory = '';
      this.shareDescription = '';
    }
    this.closeDropdown();
  }

  closeShareModal() {
    this.isShareModalOpen = false;
    this.selectedStudySetId = null;
    this.shareTitle = '';
    this.shareCategory = '';
    this.shareDescription = '';
  }

  saveShare() {
    if (this.selectedStudySetId && this.shareTitle.trim() && this.shareCategory.trim()) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }

      const studySet = this.studySets.find(s => s.flashcard_id === this.selectedStudySetId);
      if (!studySet) {
        console.error('Study set not found');
        return;
      }

      const flashcardContent = `${studySet.description || 'A flashcard set to help you study!'} • Flashcards`;

      const flashcardSlug = `flashcard-${studySet.flashcard_id}-${this.slugify(this.shareTitle)}`;
      
      this.communityService.createPost({
        user_id: String(currentUser.userId),
        username: currentUser.username,
        title: this.shareTitle,
        content: flashcardContent,
        slug: flashcardSlug,
        category: this.shareCategory,
        is_published: true,
        commentcount: 0,
        showcomment: true,
        likes: 0,
        dislikes: 0
      });

      this.isLoading = true;
      this.studySetsService.updateStudySet(
        this.selectedStudySetId,
        currentUser.userId,
        studySet.title,
        studySet.description || '',
        true,
        studySet.flashcards
      ).subscribe({
        next: (updatedStudySet) => {
          const index = this.studySets.findIndex(s => s.flashcard_id === updatedStudySet.flashcard_id);
          if (index !== -1) {
            this.studySets[index] = updatedStudySet;
          }
          this.isLoading = false;
          alert('Flashcard set shared to community successfully!');
          this.closeShareModal();
        },
        error: (error) => {
          console.error('Error updating flashcard visibility:', error);
          this.isLoading = false;
          alert('Flashcard was shared but visibility update failed.');
          this.closeShareModal();
        }
      });
    } else {
      let errorMessage = 'Please ';
      const missing = [];
      
      if (!this.selectedStudySetId) missing.push('select a flashcard set');
      if (!this.shareTitle.trim()) missing.push('enter a title');
      if (!this.shareCategory.trim()) missing.push('select a category');
      
      errorMessage += missing.join(', ') + ' before sharing.';
      alert(errorMessage);
    }
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  /**
   * Persist a flashcard set as private and remove any associated community post(s).
   * This mirrors the quiz behavior: once made private, it disappears from the
   * community feed and the badge stays Private even after refresh/navigation.
   */
  private makeStudySetPrivate(studySetId: number) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      // Fallback: just toggle locally via existing logic
      this.togglePrivacy(studySetId);
      return;
    }

    const studySet = this.studySets.find(s => s.flashcard_id === studySetId);
    if (!studySet) {
      console.error('Study set not found');
      return;
    }

    this.isLoading = true;

    this.studySetsService.updateStudySet(
      studySetId,
      currentUser.userId,
      studySet.title,
      studySet.description,
      false,
      studySet.flashcards
    ).subscribe({
      next: (updatedStudySet) => {
        const index = this.studySets.findIndex(s => s.flashcard_id === updatedStudySet.flashcard_id);
        if (index !== -1) {
          this.studySets[index] = updatedStudySet;
        }

        // Remove related community post(s) for this flashcard set
        this.removeStudySetFromCommunity(studySetId);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error making study set private:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Find and delete any community post(s) created for the given flashcard set.
   * Flashcard share slugs are in the format: "flashcard-{flashcard_id}-{slugified-title}".
   */
  private removeStudySetFromCommunity(studySetId: number) {
    const slugPrefix = `flashcard-${studySetId}-`;
    const posts = this.communityService.getPosts();

    posts
      .filter(post => post.slug && post.slug.startsWith(slugPrefix))
      .forEach(post => this.communityService.deletePost(post.post_id));
  }
}
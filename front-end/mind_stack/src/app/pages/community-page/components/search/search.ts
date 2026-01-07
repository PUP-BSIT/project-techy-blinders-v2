import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CATEGORY_OPTIONS } from '../../../../models/post.model';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {
  searchQuery: string = '';
  categories = ['All Categories', ...CATEGORY_OPTIONS];
  @Output() searchChange = new EventEmitter<string>();

  onSearchChange() {
    const query = 
      this.searchQuery === 'All Categories' ? '' : this.searchQuery;
    this.searchChange.emit(query);
  }
}
// Advanced Search & Filtering System
class AdvancedSearch {
    constructor() {
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        this.allContent = [];
        this.filteredContent = [];
        this.init();
    }

    init() {
        this.createSearchInterface();
        this.loadContent();
        this.setupEventListeners();
    }

    createSearchInterface() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'advanced-search-container';
        searchContainer.innerHTML = `
            <div class="search-wrapper">
                <div class="search-input-container">
                    <i class="fa-solid fa-search search-icon"></i>
                    <input type="text" id="advanced-search" placeholder="Search content, teachers, subjects..." autocomplete="off">
                    <button id="search-filters-btn" class="filters-btn">
                        <i class="fa-solid fa-filter"></i>
                    </button>
                </div>
                <div id="search-suggestions" class="search-suggestions"></div>
                <div id="search-filters" class="search-filters">
                    <div class="filter-group">
                        <label>Content Type:</label>
                        <select id="filter-type" multiple>
                            <option value="">All Types</option>
                            <option value="homework">Homework</option>
                            <option value="notes">Notes</option>
                            <option value="announcement">Announcement</option>
                            <option value="assignment">Assignment</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Class:</label>
                        <select id="filter-class" multiple>
                            <option value="">All Classes</option>
                            <option value="Grade 5">Grade 5</option>
                            <option value="Grade 6">Grade 6</option>
                            <option value="B.E">B.E</option>
                            <option value="P.E">P.E</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Subject:</label>
                        <select id="filter-subject" multiple>
                            <option value="">All Subjects</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Date Range:</label>
                        <input type="date" id="filter-date-from" placeholder="From">
                        <input type="date" id="filter-date-to" placeholder="To">
                    </div>
                    <div class="filter-actions">
                        <button id="apply-filters" class="btn btn-primary">Apply Filters</button>
                        <button id="clear-filters" class="btn btn-secondary">Clear All</button>
                    </div>
                </div>
            </div>
            <div class="search-results-info">
                <span id="results-count">0 results found</span>
                <div class="search-history-btn">
                    <button id="show-history" title="Search History">
                        <i class="fa-solid fa-history"></i>
                    </button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .advanced-search-container {
                margin: 0.5rem 0;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                overflow: hidden;
            }
            .search-wrapper {
                position: relative;
            }
            .search-input-container {
                display: flex;
                align-items: center;
                padding: 1rem;
                background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%);
                position: relative;
                overflow: hidden;
            }
            .search-input-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                animation: searchShimmer 3s ease-in-out infinite;
            }
            @keyframes searchShimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
            .search-icon {
                color: white;
                margin-right: 1rem;
                font-size: 1.3rem;
                animation: searchPulse 2s ease-in-out infinite;
                position: relative;
                z-index: 2;
            }
            @keyframes searchPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            #advanced-search {
                flex: 1;
                padding: 1rem 1.5rem;
                border: 2px solid rgba(139, 92, 246, 0.3);
                border-radius: 30px;
                font-size: 1rem;
                outline: none;
                background: rgba(255,255,255,0.95);
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(139, 92, 246, 0.1);
            }
            #advanced-search:focus {
                border-color: #8B5CF6;
                box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2), 0 4px 20px rgba(139, 92, 246, 0.2);
                background: white;
            }
            #advanced-search::placeholder {
                color: #9CA3AF;
                font-style: italic;
            }
            .filters-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 0.75rem;
                border-radius: 50%;
                margin-left: 1rem;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            .filters-btn:hover {
                background: rgba(255,255,255,0.3);
            }
            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 1rem;
                right: 1rem;
                background: white;
                border-radius: 0 0 10px 10px;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                max-height: 200px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
            }
            .suggestion-item {
                padding: 0.75rem 1rem;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                display: flex;
                align-items: center;
            }
            .suggestion-item:hover {
                background: #f8f9fa;
            }
            .suggestion-icon {
                margin-right: 0.5rem;
                color: #667eea;
            }
            .search-filters {
                padding: 0.75rem;
                background: #f8f9fa;
                display: none;
                border-top: 1px solid #e9ecef;
            }
            .filter-group {
                margin-bottom: 0.75rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            .filter-group label {
                min-width: 100px;
                font-weight: 500;
            }
            .filter-group select, .filter-group input {
                flex: 1;
                padding: 0.5rem;
                border: 1px solid #ddd;
                border-radius: 5px;
            }
            .filter-actions {
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }
            .search-results-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5rem 1rem;
                background: #f8f9fa;
                border-top: 1px solid #e9ecef;
                font-size: 0.85rem;
                color: #666;
            }
            .search-history-btn button {
                background: none;
                border: none;
                color: #667eea;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            .search-history-btn button:hover {
                background: rgba(102, 126, 234, 0.1);
            }
            .highlight {
                background: yellow;
                padding: 0 2px;
                border-radius: 2px;
            }
        `;
        document.head.appendChild(style);

        // Insert before content list
        const contentList = document.getElementById('contentList');
        contentList.parentNode.insertBefore(searchContainer, contentList);
    }

    async loadContent() {
        try {
            const response = await fetch('http://localhost:8082/schools/');
            this.allContent = await response.json();
            this.filteredContent = [...this.allContent];
            this.populateFilterOptions();
            this.updateResultsCount();
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    populateFilterOptions() {
        const subjects = [...new Set(this.allContent.map(item => item.subject))];
        const subjectSelect = document.getElementById('filter-subject');
        subjectSelect.innerHTML = '<option value="">All Subjects</option>';
        subjects.forEach(subject => {
            subjectSelect.innerHTML += `<option value="${subject}">${subject}</option>`;
        });
    }

    setupEventListeners() {
        const searchInput = document.getElementById('advanced-search');
        const filtersBtn = document.getElementById('search-filters-btn');
        const filtersPanel = document.getElementById('search-filters');
        const applyFiltersBtn = document.getElementById('apply-filters');
        const clearFiltersBtn = document.getElementById('clear-filters');
        const historyBtn = document.getElementById('show-history');

        // Search input with debounce
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });

        // Show suggestions on focus
        searchInput.addEventListener('focus', () => {
            this.showSuggestions(searchInput.value);
        });

        // Hide suggestions on blur (with delay for clicks)
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                document.getElementById('search-suggestions').style.display = 'none';
            }, 200);
        });

        // Toggle filters
        filtersBtn.addEventListener('click', () => {
            const isVisible = filtersPanel.style.display === 'block';
            filtersPanel.style.display = isVisible ? 'none' : 'block';
        });

        // Apply filters
        applyFiltersBtn.addEventListener('click', () => {
            this.applyFilters();
        });

        // Clear filters
        clearFiltersBtn.addEventListener('click', () => {
            this.clearFilters();
        });

        // Show search history
        historyBtn.addEventListener('click', () => {
            this.showSearchHistory();
        });
    }

    performSearch(query) {
        if (!query.trim()) {
            this.filteredContent = [...this.allContent];
            this.updateDisplay();
            return;
        }

        // Add to search history
        this.addToSearchHistory(query);

        const searchTerms = query.toLowerCase().split(' ');
        this.filteredContent = this.allContent.filter(item => {
            const searchableText = `
                ${item.title} ${item.description} ${item.subject} 
                ${item.class_name} ${item.teacher_id} ${item.content_type}
            `.toLowerCase();

            return searchTerms.every(term => searchableText.includes(term));
        });

        this.updateDisplay();
        this.showSuggestions(query);
    }

    showSuggestions(query) {
        const suggestionsContainer = document.getElementById('search-suggestions');
        
        if (!query.trim()) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        const suggestions = this.generateSuggestions(query);
        
        if (suggestions.length === 0) {
            suggestionsContainer.style.display = 'none';
            return;
        }

        suggestionsContainer.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" onclick="this.parentElement.parentElement.querySelector('#advanced-search').value='${suggestion.text}'; this.parentElement.style.display='none'; advancedSearch.performSearch('${suggestion.text}')">
                <i class="fa-solid fa-${suggestion.icon} suggestion-icon"></i>
                <span>${suggestion.text}</span>
            </div>
        `).join('');

        suggestionsContainer.style.display = 'block';
    }

    generateSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();

        // Subject suggestions
        const subjects = [...new Set(this.allContent.map(item => item.subject))];
        subjects.forEach(subject => {
            if (subject.toLowerCase().includes(queryLower)) {
                suggestions.push({ text: subject, icon: 'book' });
            }
        });

        // Teacher suggestions
        const teachers = [...new Set(this.allContent.map(item => item.teacher_id))];
        teachers.forEach(teacher => {
            if (teacher.toLowerCase().includes(queryLower)) {
                suggestions.push({ text: teacher, icon: 'user' });
            }
        });

        // Content type suggestions
        const types = ['homework', 'notes', 'announcement', 'assignment'];
        types.forEach(type => {
            if (type.includes(queryLower)) {
                suggestions.push({ text: type, icon: 'file' });
            }
        });

        // Search history suggestions
        this.searchHistory.forEach(historyItem => {
            if (historyItem.toLowerCase().includes(queryLower) && !suggestions.find(s => s.text === historyItem)) {
                suggestions.push({ text: historyItem, icon: 'history' });
            }
        });

        return suggestions.slice(0, 5);
    }

    applyFilters() {
        const typeFilter = Array.from(document.getElementById('filter-type').selectedOptions).map(o => o.value);
        const classFilter = Array.from(document.getElementById('filter-class').selectedOptions).map(o => o.value);
        const subjectFilter = Array.from(document.getElementById('filter-subject').selectedOptions).map(o => o.value);
        const dateFrom = document.getElementById('filter-date-from').value;
        const dateTo = document.getElementById('filter-date-to').value;

        this.filteredContent = this.allContent.filter(item => {
            // Type filter
            if (typeFilter.length > 0 && typeFilter[0] !== '' && !typeFilter.includes(item.content_type.toLowerCase())) {
                return false;
            }

            // Class filter
            if (classFilter.length > 0 && classFilter[0] !== '' && !classFilter.includes(item.class_name)) {
                return false;
            }

            // Subject filter
            if (subjectFilter.length > 0 && subjectFilter[0] !== '' && !subjectFilter.includes(item.subject)) {
                return false;
            }

            // Date filter
            if (dateFrom && item.date_uploaded < dateFrom) return false;
            if (dateTo && item.date_uploaded > dateTo) return false;

            return true;
        });

        this.updateDisplay();
        document.getElementById('search-filters').style.display = 'none';
    }

    clearFilters() {
        document.getElementById('filter-type').selectedIndex = 0;
        document.getElementById('filter-class').selectedIndex = 0;
        document.getElementById('filter-subject').selectedIndex = 0;
        document.getElementById('filter-date-from').value = '';
        document.getElementById('filter-date-to').value = '';
        document.getElementById('advanced-search').value = '';
        
        this.filteredContent = [...this.allContent];
        this.updateDisplay();
    }

    updateDisplay() {
        this.updateResultsCount();
        this.displayFilteredContent();
    }

    updateResultsCount() {
        const count = this.filteredContent.length;
        document.getElementById('results-count').textContent = 
            `${count} result${count !== 1 ? 's' : ''} found`;
    }

    displayFilteredContent() {
        const contentList = document.getElementById('contentList');
        
        if (this.filteredContent.length === 0) {
            contentList.innerHTML = '<p class="no-results">No content matches your search criteria.</p>';
            return;
        }

        contentList.innerHTML = '';
        this.filteredContent.forEach(content => {
            const contentCard = document.createElement('div');
            contentCard.className = 'content-card';
            contentCard.innerHTML = `
                <div class="card-header">
                    <h3>${this.highlightSearchTerms(content.title)}</h3>
                    <span class="content-type ${content.content_type.toLowerCase()}">${content.content_type}</span>
                </div>
                <div class="card-body">
                    <p><strong>Subject:</strong> ${this.highlightSearchTerms(content.subject)}</p>
                    <p><strong>Class:</strong> ${content.class_name}</p>
                    <p><strong>Teacher:</strong> ${content.teacher_id}</p>
                    <p><strong>Date:</strong> ${content.date_uploaded}</p>
                    <p>${this.highlightSearchTerms(content.description || '')}</p>
                </div>
                <div class="card-actions">
                    <button onclick="editContent(${content.content_id})" class="btn btn-edit">
                        <i class="fa-solid fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteContent(${content.content_id})" class="btn btn-delete">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            `;
            contentList.appendChild(contentCard);
        });
    }

    highlightSearchTerms(text) {
        const searchQuery = document.getElementById('advanced-search').value.trim();
        if (!searchQuery || !text) return text;

        const searchTerms = searchQuery.split(' ');
        let highlightedText = text;

        searchTerms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="highlight">$1</span>');
        });

        return highlightedText;
    }

    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        }
    }

    showSearchHistory() {
        if (this.searchHistory.length === 0) {
            alert('No search history available.');
            return;
        }

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 10001; display: flex;
            align-items: center; justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 10px; max-width: 400px; width: 90%;">
                <h3>Search History</h3>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${this.searchHistory.map(query => `
                        <div style="padding: 0.5rem; border-bottom: 1px solid #eee; cursor: pointer;"
                             onclick="document.getElementById('advanced-search').value='${query}'; advancedSearch.performSearch('${query}'); this.parentElement.parentElement.parentElement.remove();">
                            <i class="fa-solid fa-history" style="margin-right: 0.5rem; color: #667eea;"></i>
                            ${query}
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                    <button onclick="advancedSearch.clearSearchHistory(); this.parentElement.parentElement.parentElement.remove();" 
                            style="padding: 0.5rem 1rem; background: #dc3545; color: white; border: none; border-radius: 5px;">
                        Clear History
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 5px;">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('searchHistory');
    }
}

// Initialize advanced search
const advancedSearch = new AdvancedSearch();
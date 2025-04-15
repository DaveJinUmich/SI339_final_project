// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Media Recommendations website initialized");
    
    // Setup custom filtering for movies
    setupCustomFiltering();
    
    // Set up click events for media cards to expand/collapse details
    setupMediaCardInteractions();
    
    // Set up enhanced rating button interactions
    setupEnhancedRatingButtons();
    
    // Setup keyboard accessibility
    setupKeyboardAccessibility();

    // Setup audio player
    setupAudioPlayer();
});

// Setup custom filtering functionality to replace mixitup
function setupCustomFiltering() {
    const filterButtons = document.querySelectorAll('.filter-button');
    const mediaItems = document.querySelectorAll('.media-item');
    
    // Add click event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            
            // Get the filter value from data-filter attribute
            const filterValue = this.getAttribute('data-filter');
            console.log("Filtering by:", filterValue);
            
            // Add active class to clicked button
            this.classList.add('active');
            this.setAttribute('aria-pressed', 'true');
            
            // Filter the media items
            mediaItems.forEach(item => {
                if (filterValue === '.action' && !item.classList.contains('action')) {
                    item.style.display = 'none';
                } else if (filterValue === '.drama' && !item.classList.contains('drama')) {
                    item.style.display = 'none';
                } else if (filterValue === '.scifi' && !item.classList.contains('scifi')) {
                    item.style.display = 'none';
                } else if (filterValue === '.comedy' && !item.classList.contains('comedy')) {
                    item.style.display = 'none';
                } else if (filterValue === '.fantasy' && !item.classList.contains('fantasy')) {
                    item.style.display = 'none';
                } else if (filterValue === 'all') {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'block';
                }
            });
        });
    });
}

// Setup interaction for media cards
function setupMediaCardInteractions() {
    const mediaCards = document.querySelectorAll('.media-card');
    
    mediaCards.forEach(card => {
        // Remove the click event from the card itself 
        // We don't want the card to expand when clicked anywhere
        
        // Set initial state of details (collapsed)
        const details = card.querySelector('.media-details');
        if (details) {
            details.style.maxHeight = '100px';
            details.style.overflow = 'hidden';
            
            // Create toggle button container below the details
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'toggle-button-container';
            card.appendChild(buttonContainer);
            
            // Create "more" button
            const toggleButton = document.createElement('button');
            toggleButton.className = 'toggle-details-button';
            toggleButton.textContent = 'Click for more';
            toggleButton.setAttribute('aria-expanded', 'false');
            buttonContainer.appendChild(toggleButton);
            
            // Add click event for toggle button
            toggleButton.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent any other handlers
                
                const isExpanded = details.classList.contains('expanded');
                
                if (isExpanded) {
                    // Collapse
                    details.classList.remove('expanded');
                    details.style.maxHeight = '100px';
                    details.style.overflow = 'hidden';
                    toggleButton.textContent = 'Click for more';
                    toggleButton.setAttribute('aria-expanded', 'false');
                } else {
                    // Expand
                    details.classList.add('expanded');
                    details.style.maxHeight = '1000px'; // A large value to ensure all content is visible
                    details.style.overflow = 'visible';
                    toggleButton.textContent = 'Compress';
                    toggleButton.setAttribute('aria-expanded', 'true');
                }
            });
            
            // Remove any existing "more indicators" if they exist
            const existingIndicator = details.querySelector('.more-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
        }
    });
}

// Setup enhanced rating button interactions with toggle functionality
function setupEnhancedRatingButtons() {
    const mediaItems = document.querySelectorAll('.media-item');
    
    mediaItems.forEach(item => {
        const agreeButton = item.querySelector('.agree');
        const disagreeButton = item.querySelector('.disagree');
        
        if (!agreeButton || !disagreeButton) return;
        
        // Load any saved state from localStorage
        const itemId = item.id;
        const savedState = localStorage.getItem('rating_' + itemId);
        
        if (savedState) {
            const state = JSON.parse(savedState);
            const agreeCount = item.querySelector('.agree .count');
            const disagreeCount = item.querySelector('.disagree .count');
            
            if (state.voted === 'agree') {
                agreeButton.classList.add('voted');
                agreeButton.setAttribute('aria-pressed', 'true');
            } else if (state.voted === 'disagree') {
                disagreeButton.classList.add('voted');
                disagreeButton.setAttribute('aria-pressed', 'true');
            }
            
            // Update displayed counts
            if (agreeCount) agreeCount.textContent = state.agreeCount;
            if (disagreeCount) disagreeCount.textContent = state.disagreeCount;
        }
        
        // Handle agree button click
        agreeButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card from toggling
            
            const agreeCount = this.querySelector('.count');
            const disagreeCount = disagreeButton.querySelector('.count');
            let agreeValue = parseInt(agreeCount.textContent);
            let disagreeValue = parseInt(disagreeCount.textContent);
            
            // Check if this button is already voted
            if (this.classList.contains('voted')) {
                // Unvote
                this.classList.remove('voted');
                this.setAttribute('aria-pressed', 'false');
                agreeCount.textContent = --agreeValue;
                
                // Save state to localStorage
                localStorage.setItem('rating_' + itemId, JSON.stringify({
                    voted: null,
                    agreeCount: agreeValue,
                    disagreeCount: disagreeValue
                }));
                
                // Show feedback
                showFeedback(this, 'Vote removed');
            } else {
                // Vote for agree
                this.classList.add('voted');
                this.setAttribute('aria-pressed', 'true');
                agreeCount.textContent = ++agreeValue;
                
                // If disagree was selected, remove that vote
                if (disagreeButton.classList.contains('voted')) {
                    disagreeButton.classList.remove('voted');
                    disagreeButton.setAttribute('aria-pressed', 'false');
                    disagreeCount.textContent = --disagreeValue;
                }
                
                // Save state to localStorage
                localStorage.setItem('rating_' + itemId, JSON.stringify({
                    voted: 'agree',
                    agreeCount: agreeValue,
                    disagreeCount: disagreeValue
                }));
                
                // Show feedback
                showFeedback(this, 'Thanks for agreeing!');
            }
        });
        
        // Handle disagree button click
        disagreeButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card from toggling
            
            const disagreeCount = this.querySelector('.count');
            const agreeCount = agreeButton.querySelector('.count');
            let disagreeValue = parseInt(disagreeCount.textContent);
            let agreeValue = parseInt(agreeCount.textContent);
            
            // Check if this button is already voted
            if (this.classList.contains('voted')) {
                // Unvote
                this.classList.remove('voted');
                this.setAttribute('aria-pressed', 'false');
                disagreeCount.textContent = --disagreeValue;
                
                // Save state to localStorage
                localStorage.setItem('rating_' + itemId, JSON.stringify({
                    voted: null,
                    agreeCount: agreeValue,
                    disagreeCount: disagreeValue
                }));
                
                // Show feedback
                showFeedback(this, 'Vote removed');
            } else {
                // Vote for disagree
                this.classList.add('voted');
                this.setAttribute('aria-pressed', 'true');
                disagreeCount.textContent = ++disagreeValue;
                
                // If agree was selected, remove that vote
                if (agreeButton.classList.contains('voted')) {
                    agreeButton.classList.remove('voted');
                    agreeButton.setAttribute('aria-pressed', 'false');
                    agreeCount.textContent = --agreeValue;
                }
                
                // Save state to localStorage
                localStorage.setItem('rating_' + itemId, JSON.stringify({
                    voted: 'disagree',
                    agreeCount: agreeValue,
                    disagreeCount: disagreeValue
                }));
                
                // Show feedback
                showFeedback(this, 'Thanks for your feedback!');
            }
        });
    });
}

// Helper function to show feedback message
function showFeedback(element, message) {
    // Only announce for screen readers, no visible feedback
    const liveRegion = document.getElementById('live-region') || createLiveRegion();
    liveRegion.textContent = message;
    
    // Clear announcement after 3 seconds
    setTimeout(() => {
        liveRegion.textContent = '';
    }, 3000);
}

// Create a live region for screen reader announcements
function createLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.className = 'visually-hidden';
    liveRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveRegion);
    return liveRegion;
}

// Setup keyboard accessibility features
function setupKeyboardAccessibility() {
    const toggleButtons = document.querySelectorAll('.toggle-details-button');
    
    toggleButtons.forEach(button => {
        // Get the details section this button controls
        const detailsId = button.getAttribute('aria-controls');
        
        // Only proceed if detailsId exists
        if (detailsId) {
            const detailsSection = document.getElementById(detailsId);
            
            // Only proceed if detailsSection exists
            if (detailsSection) {
                // Initially hide details (if they should be hidden at start)
                if (button.getAttribute('aria-expanded') === 'false') {
                    detailsSection.style.display = 'none';
                }
                
                // Add click event listener
                button.addEventListener('click', function() {
                    const expanded = button.getAttribute('aria-expanded') === 'true';
                    
                    // Toggle expanded state
                    button.setAttribute('aria-expanded', !expanded);
                    
                    // Toggle visibility of details section
                    if (expanded) {
                        detailsSection.style.display = 'none';
                        button.textContent = 'Click for more';
                    } else {
                        detailsSection.style.display = 'block';
                        button.textContent = 'Show less';
                    }
                });
            }
        }
    });
    
    // Make filter buttons keyboard accessible
    const filterButtons = document.querySelectorAll('.filter-button');
    
    filterButtons.forEach(button => {
        button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');
        
        button.addEventListener('click', function() {
            // Update aria-pressed state for all buttons
            filterButtons.forEach(btn => {
                btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
            });
        });
        
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                button.click();
            }
        });
    });
}

// Setup audio player functionality
function setupAudioPlayer() {
    const audioPlayer = document.getElementById('theme-player');
    const nowPlaying = document.getElementById('now-playing');
    
    if (!audioPlayer || !nowPlaying) {
        console.error('Audio player elements not found');
        return;
    }
    
    // Define audio sources for different pages
    const audioSources = {
        'movies.html': {
            src: 'assets/junnymovie.mp3',
            name: 'Movie by Junny'
        },
        'tvshows.html': {
            src: 'assets/enjoytheshow.mp3',
            name: 'Enjoy The Show by The Weeknd'
        },
        'index.html': {
            src: 'assets/stayawhile.mp3',
            name: 'Stay A While by niko rain'
        },
        'about.html': {
            src: 'assets/hello.mp3',
            name: 'hello! by ROLE MODEL'
        }
    };
    
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Set the appropriate audio source based on the current page
    const currentAudio = audioSources[currentPage] || audioSources['index.html'];
    
    // Update audio source and related elements
    const audioSource = audioPlayer.querySelector('source');
    if (audioSource) {
        audioSource.src = currentAudio.src;
        audioPlayer.load(); // Important: reload the audio after changing source
    }
    
    // Hide now playing text initially until play starts
    nowPlaying.style.display = 'none';
    
    // Create audio controls container if it doesn't exist
    let audioControls = document.querySelector('.audio-controls');
    if (!audioControls) {
        audioControls = document.createElement('div');
        audioControls.className = 'audio-controls';
        
        // Create skip backward button
        const skipBackwardBtn = document.createElement('button');
        skipBackwardBtn.className = 'skip-button';
        skipBackwardBtn.innerHTML = '&laquo; 10s';
        skipBackwardBtn.setAttribute('aria-label', 'Skip backward 10 seconds');
        
        // Create skip forward button
        const skipForwardBtn = document.createElement('button');
        skipForwardBtn.className = 'skip-button';
        skipForwardBtn.innerHTML = '10s &raquo;';
        skipForwardBtn.setAttribute('aria-label', 'Skip forward 10 seconds');
        
        // Add buttons to controls container
        audioControls.appendChild(skipBackwardBtn);
        audioControls.appendChild(skipForwardBtn);
        
        // Find the parent of the audio player
        const audioPlayerParent = audioPlayer.parentElement;
        
        // Insert controls after the audio player
        audioPlayerParent.insertBefore(audioControls, nowPlaying);
        
        // Skip backward functionality
        skipBackwardBtn.addEventListener('click', function() {
            // Calculate new time
            let newTime = audioPlayer.currentTime - 10;
            
            // Handle edge case: if we'd go before start, set to beginning
            if (newTime < 0) {
                newTime = 0;
            }
            
            // Set the new time
            audioPlayer.currentTime = newTime;
            console.log('Skipped backward to: ' + newTime.toFixed(2) + 's');
        });
        
        // Skip forward functionality
        skipForwardBtn.addEventListener('click', function() {
            // Calculate new time
            let newTime = audioPlayer.currentTime + 10;
            
            // Handle edge case: if we'd go past end, set to end
            if (newTime > audioPlayer.duration) {
                newTime = audioPlayer.duration;
            }
            
            // Set the new time
            audioPlayer.currentTime = newTime;
            console.log('Skipped forward to: ' + newTime.toFixed(2) + 's');
        });
    }
    
    // Ensure volume slider works - add specific event listener
    audioPlayer.addEventListener('volumechange', function() {
        console.log('Volume changed to: ' + audioPlayer.volume);
    });
    
    // Update the now playing text when audio loads
    audioPlayer.addEventListener('loadeddata', function() {
        console.log('Audio loaded successfully: ' + currentAudio.name);
    });
    
    // Show the now playing text when audio plays
    audioPlayer.addEventListener('play', function() {
        console.log('Audio started playing');
        nowPlaying.textContent = 'Now playing: ' + currentAudio.name;
        nowPlaying.style.display = 'block';
    });
    
    // Update text when audio is paused
    audioPlayer.addEventListener('pause', function() {
        console.log('Audio paused');
        nowPlaying.textContent = 'Paused: ' + currentAudio.name;
    });
    
    // Hide the now playing text when audio ends
    audioPlayer.addEventListener('ended', function() {
        console.log('Audio ended');
        nowPlaying.textContent = 'Playback ended';
    });
    
    console.log('Audio player setup complete with skip controls for: ' + currentPage);
}
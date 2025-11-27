// NZSL Speech to Sign Language App
// Main Application JavaScript

class NZSLApp {
    constructor() {
        // Sign dictionary data
        this.signs = {};
        this.signIndex = {}; // Quick lookup by word
        
        // Speech recognition
        this.recognition = null;
        this.isListening = false;
        
        // Current translation state
        this.currentSigns = [];
        this.currentSignIndex = 0;
        
        // Slideshow state
        this.slideshowPlaying = false;
        this.slideshowPaused = false;
        this.slideshowIndex = 0;
        
        // DOM Elements
        this.elements = {};
        
        // Initialize the app
        this.init();
    }
    
    async init() {
        this.cacheElements();
        this.setupSpeechRecognition();
        this.attachEventListeners();
        await this.loadSignData();
        console.log('NZSL App initialized successfully!');
    }
    
    cacheElements() {
        this.elements = {
            startBtn: document.getElementById('startBtn'),
            stopBtn: document.getElementById('stopBtn'),
            statusIndicator: document.getElementById('statusIndicator'),
            textInput: document.getElementById('textInput'),
            translateBtn: document.getElementById('translateBtn'),
            recognizedText: document.getElementById('recognizedText'),
            wordList: document.getElementById('wordList'),
            videoContainer: document.getElementById('videoContainer'),
            videoControls: document.getElementById('videoControls'),
            prevSign: document.getElementById('prevSign'),
            nextSign: document.getElementById('nextSign'),
            signProgress: document.getElementById('signProgress'),
            currentSignInfo: document.getElementById('currentSignInfo'),
            searchInput: document.getElementById('searchInput'),
            searchBtn: document.getElementById('searchBtn'),
            searchResults: document.getElementById('searchResults'),
            // Slideshow elements
            slideshowPlayBtn: document.getElementById('slideshowPlayBtn'),
            slideshowPauseBtn: document.getElementById('slideshowPauseBtn'),
            slideshowStopBtn: document.getElementById('slideshowStopBtn'),
            slideshowStatus: document.getElementById('slideshowStatus'),
            slideshowVideoContainer: document.getElementById('slideshowVideoContainer'),
            slideshowProgress: document.getElementById('slideshowProgress'),
            slideshowProgressBar: document.getElementById('slideshowProgressBar'),
            slideshowCounter: document.getElementById('slideshowCounter'),
            slideshowSignInfo: document.getElementById('slideshowSignInfo'),
            slideshowSection: document.querySelector('.slideshow-section')
        };
    }
    
    setupSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.updateStatus('Speech recognition not supported in this browser', 'error');
            this.elements.startBtn.disabled = true;
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-NZ'; // New Zealand English
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateStatus('Listening...', 'listening');
            this.elements.startBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateStatus('Ready to listen', 'ready');
            this.elements.startBtn.disabled = false;
            this.elements.stopBtn.disabled = true;
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Display the recognized text
            const displayText = finalTranscript || interimTranscript;
            this.displayRecognizedText(displayText);
            
            // If we have a final result, process it
            if (finalTranscript) {
                this.translateText(finalTranscript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.updateStatus(`Error: ${event.error}`, 'error');
            this.elements.startBtn.disabled = false;
            this.elements.stopBtn.disabled = true;
        };
    }
    
    attachEventListeners() {
        // Speech controls
        this.elements.startBtn.addEventListener('click', () => this.startListening());
        this.elements.stopBtn.addEventListener('click', () => this.stopListening());
        
        // Text input translation
        this.elements.translateBtn.addEventListener('click', () => {
            const text = this.elements.textInput.value.trim();
            if (text) {
                this.displayRecognizedText(text);
                this.translateText(text);
            }
        });
        
        // Enter key for text input
        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.elements.translateBtn.click();
            }
        });
        
        // Video navigation
        this.elements.prevSign.addEventListener('click', () => this.showPreviousSign());
        this.elements.nextSign.addEventListener('click', () => this.showNextSign());
        
        // Search functionality
        this.elements.searchBtn.addEventListener('click', () => this.performSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Live search
        this.elements.searchInput.addEventListener('input', () => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => this.performSearch(), 300);
        });
        
        // Slideshow controls
        this.elements.slideshowPlayBtn.addEventListener('click', () => this.startSlideshow());
        this.elements.slideshowPauseBtn.addEventListener('click', () => this.pauseSlideshow());
        this.elements.slideshowStopBtn.addEventListener('click', () => this.stopSlideshow());
    }
    
    async loadSignData() {
        this.updateStatus('Loading sign dictionary...', 'loading');
        
        try {
            // Try to load the pre-generated index first (much faster)
            const response = await fetch('signs-index.json');
            
            if (response.ok) {
                const indexData = await response.json();
                this.signs = indexData.signs;
                this.signIndex = indexData.index;
                console.log(`Loaded ${indexData.totalSigns} signs and ${indexData.totalWords} indexed words from pre-built index`);
            } else {
                // Fallback: load individual files
                console.log('Pre-built index not found, loading individual files...');
                await this.loadSignsFromFiles();
            }
            
            this.updateStatus('Ready to listen', 'ready');
        } catch (error) {
            console.error('Error loading sign data:', error);
            // Try fallback loading
            try {
                await this.loadSignsFromFiles();
                this.updateStatus('Ready to listen', 'ready');
            } catch (fallbackError) {
                this.updateStatus('Error loading data. Some features may be limited.', 'error');
            }
        }
    }
    
    async loadSignsFromFiles() {
        // Fallback: Load signs by trying to fetch files in known range
        // Based on the scrape.js, IDs range from 233 to 7100
        const promises = [];
        
        for (let id = 233; id <= 7100; id++) {
            promises.push(this.loadSingleSign(id));
        }
        
        await Promise.allSettled(promises);
        console.log(`Loaded ${Object.keys(this.signs).length} signs from individual files`);
    }
    
    async loadSingleSign(id) {
        try {
            const response = await fetch(`data/${id}.json`);
            if (response.ok) {
                const data = await response.json();
                this.signs[id] = data;
                
                // Index by English words
                if (data.gloss && data.gloss.english) {
                    data.gloss.english.forEach(word => {
                        const normalizedWord = word.toLowerCase().trim();
                        if (!this.signIndex[normalizedWord]) {
                            this.signIndex[normalizedWord] = [];
                        }
                        this.signIndex[normalizedWord].push(id);
                    });
                }
                
                // Also index secondary English words
                if (data.gloss && data.gloss.english_secondary) {
                    data.gloss.english_secondary.forEach(word => {
                        if (word && word.trim()) {
                            const normalizedWord = word.toLowerCase().trim();
                            if (!this.signIndex[normalizedWord]) {
                                this.signIndex[normalizedWord] = [];
                            }
                            if (!this.signIndex[normalizedWord].includes(id)) {
                                this.signIndex[normalizedWord].push(id);
                            }
                        }
                    });
                }
            }
        } catch (error) {
            // File doesn't exist or error loading - skip silently
        }
    }
    
    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
            }
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    updateStatus(message, state) {
        const statusIndicator = this.elements.statusIndicator;
        const statusText = statusIndicator.querySelector('.status-text');
        
        statusIndicator.className = 'status-indicator';
        if (state) {
            statusIndicator.classList.add(state);
        }
        
        statusText.textContent = message;
    }
    
    displayRecognizedText(text) {
        this.elements.recognizedText.innerHTML = `
            <p class="actual-text">${text}</p>
        `;
    }
    
    translateText(text) {
        // Split text into words
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove punctuation
            .split(/\s+/)
            .filter(word => word.length > 0);
        
        // Find signs for each word
        this.currentSigns = [];
        const wordListHtml = [];
        
        words.forEach(word => {
            const signIds = this.findSignsForWord(word);
            
            if (signIds.length > 0) {
                wordListHtml.push(`
                    <span class="word-item found" data-word="${word}" data-sign-id="${signIds[0]}">
                        ${word} ✓
                    </span>
                `);
                
                // Add the first matching sign to our sequence
                this.currentSigns.push({
                    word: word,
                    signId: signIds[0],
                    sign: this.signs[signIds[0]]
                });
            } else {
                wordListHtml.push(`
                    <span class="word-item not-found" data-word="${word}">
                        ${word} ✗
                    </span>
                `);
            }
        });
        
        // Display word list
        this.elements.wordList.innerHTML = wordListHtml.join('');
        
        // Add click handlers to word items
        this.elements.wordList.querySelectorAll('.word-item.found').forEach(item => {
            item.addEventListener('click', () => {
                const signId = parseInt(item.dataset.signId);
                const index = this.currentSigns.findIndex(s => s.signId === signId);
                if (index !== -1) {
                    this.currentSignIndex = index;
                    this.displayCurrentSign();
                }
            });
        });
        
        // Display signs
        if (this.currentSigns.length > 0) {
            this.currentSignIndex = 0;
            this.displayCurrentSign();
            this.elements.videoControls.style.display = 'flex';
            // Enable slideshow
            this.updateSlideshowAvailability();
        } else {
            this.showNoSignsFound();
            // Disable slideshow
            this.updateSlideshowAvailability();
        }
    }
    
    findSignsForWord(word) {
        const normalizedWord = word.toLowerCase().trim();
        
        // Direct match
        if (this.signIndex[normalizedWord]) {
            return this.signIndex[normalizedWord];
        }
        
        // Try without 's' suffix (simple plural handling)
        if (normalizedWord.endsWith('s') && normalizedWord.length > 2) {
            const singular = normalizedWord.slice(0, -1);
            if (this.signIndex[singular]) {
                return this.signIndex[singular];
            }
        }
        
        // Try without 'ing' suffix
        if (normalizedWord.endsWith('ing') && normalizedWord.length > 4) {
            const base = normalizedWord.slice(0, -3);
            if (this.signIndex[base]) {
                return this.signIndex[base];
            }
            // Try with 'e' added back
            if (this.signIndex[base + 'e']) {
                return this.signIndex[base + 'e'];
            }
        }
        
        // Try without 'ed' suffix
        if (normalizedWord.endsWith('ed') && normalizedWord.length > 3) {
            const base = normalizedWord.slice(0, -2);
            if (this.signIndex[base]) {
                return this.signIndex[base];
            }
            if (this.signIndex[base.slice(0, -1)]) {
                return this.signIndex[base.slice(0, -1)];
            }
        }
        
        // Partial match - find words that start with this word
        const partialMatches = Object.keys(this.signIndex)
            .filter(key => key.startsWith(normalizedWord))
            .slice(0, 1);
        
        if (partialMatches.length > 0) {
            return this.signIndex[partialMatches[0]];
        }
        
        return [];
    }
    
    displayCurrentSign() {
        if (this.currentSigns.length === 0) return;
        
        const current = this.currentSigns[this.currentSignIndex];
        const sign = current.sign;
        
        // Build video URL - try local first, then online source
        // Videos are hosted on AWS S3: nzsl-signbank-media-production.s3.amazonaws.com
        const videoFilename = sign.video;
        const localVideoPath = `video/${sign.nzsl_id}/${videoFilename}`;
        const onlineVideoPath = `https://nzsl-signbank-media-production.s3.amazonaws.com/glossvideo/${sign.nzsl_id}/${videoFilename}`;
        
        const imagePath = `image/${sign.image}`;
        
        // Try local video first, fallback to online
        this.elements.videoContainer.innerHTML = `
            <video controls autoplay loop class="fade-in" id="signVideo">
                <source src="${localVideoPath}" type="video/mp4">
                <source src="${onlineVideoPath}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        
        // Handle video error - try online source
        const video = this.elements.videoContainer.querySelector('video');
        video.onerror = () => {
            // If local fails, try online source directly
            video.src = onlineVideoPath;
            video.load();
        };
        
        // Update progress
        this.elements.signProgress.textContent = 
            `${this.currentSignIndex + 1} / ${this.currentSigns.length}`;
        
        // Update navigation buttons
        this.elements.prevSign.disabled = this.currentSignIndex === 0;
        this.elements.nextSign.disabled = this.currentSignIndex === this.currentSigns.length - 1;
        
        // Update sign info
        const englishWords = sign.gloss.english.join(', ');
        const secondaryWords = sign.gloss.english_secondary.filter(w => w).join(', ');
        const maoriWords = sign.gloss.maori.filter(w => w).join(', ');
        
        this.elements.currentSignInfo.innerHTML = `
            <div class="fade-in">
                <h3>${englishWords}</h3>
                <div class="sign-details">
                    ${secondaryWords ? `<p><strong>Also means:</strong> ${secondaryWords}</p>` : ''}
                    ${maoriWords ? `<p><strong>Māori:</strong> ${maoriWords}</p>` : ''}
                    <p><strong>Word in sentence:</strong> "${current.word}"</p>
                </div>
                <img src="${imagePath}" alt="${englishWords}" class="sign-image" 
                     onerror="this.style.display='none'">
            </div>
        `;
        
        // Highlight current word in word list
        this.elements.wordList.querySelectorAll('.word-item').forEach((item, index) => {
            item.classList.remove('active');
        });
        const currentWordItem = this.elements.wordList.querySelector(
            `.word-item[data-sign-id="${sign.nzsl_id}"]`
        );
        if (currentWordItem) {
            currentWordItem.classList.add('active');
        }
        
        // Auto-advance when video ends (optional)
        // The video element is already assigned above
    }
    
    showPreviousSign() {
        if (this.currentSignIndex > 0) {
            this.currentSignIndex--;
            this.displayCurrentSign();
        }
    }
    
    showNextSign() {
        if (this.currentSignIndex < this.currentSigns.length - 1) {
            this.currentSignIndex++;
            this.displayCurrentSign();
        }
    }
    
    showNoSignsFound() {
        this.elements.videoContainer.innerHTML = `
            <div class="no-signs-message">
                <span class="icon">😔</span>
                <p>No signs found for the spoken words.</p>
                <p>Try saying different words or search for specific signs below.</p>
            </div>
        `;
        this.elements.videoControls.style.display = 'none';
        this.elements.currentSignInfo.innerHTML = '';
    }
    
    performSearch() {
        const query = this.elements.searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            this.elements.searchResults.innerHTML = '';
            return;
        }
        
        // Search through the index
        const results = [];
        
        for (const [word, signIds] of Object.entries(this.signIndex)) {
            if (word.includes(query)) {
                signIds.forEach(id => {
                    const sign = this.signs[id];
                    if (sign && !results.find(r => r.id === id)) {
                        results.push({
                            id: id,
                            word: word,
                            sign: sign
                        });
                    }
                });
            }
        }
        
        // Limit results
        const limitedResults = results.slice(0, 20);
        
        // Display results
        if (limitedResults.length > 0) {
            this.elements.searchResults.innerHTML = limitedResults.map(result => {
                const sign = result.sign;
                const imagePath = `image/${sign.image}`;
                const englishWords = sign.gloss.english.join(', ');
                
                return `
                    <div class="search-result-item" data-sign-id="${result.id}">
                        <img src="${imagePath}" alt="${englishWords}" 
                             onerror="this.style.display='none'">
                        <h4>${englishWords}</h4>
                        <p>ID: ${result.id}</p>
                    </div>
                `;
            }).join('');
            
            // Add click handlers
            this.elements.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const signId = parseInt(item.dataset.signId);
                    this.showSingleSign(signId);
                });
            });
        } else {
            this.elements.searchResults.innerHTML = `
                <div class="no-signs-message">
                    <p>No signs found matching "${query}"</p>
                </div>
            `;
        }
    }
    
    showSingleSign(signId) {
        const sign = this.signs[signId];
        if (!sign) return;
        
        this.currentSigns = [{
            word: sign.gloss.english[0],
            signId: signId,
            sign: sign
        }];
        this.currentSignIndex = 0;
        
        this.displayCurrentSign();
        this.elements.videoControls.style.display = 'flex';
        
        // Scroll to video section
        this.elements.videoContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Slideshow Methods
    updateSlideshowAvailability() {
        const hasContent = this.currentSigns.length > 0;
        this.elements.slideshowPlayBtn.disabled = !hasContent || this.slideshowPlaying;
        
        if (hasContent) {
            this.elements.slideshowStatus.querySelector('.status-text').textContent = 
                `${this.currentSigns.length} sign${this.currentSigns.length > 1 ? 's' : ''} ready to play`;
        } else {
            this.elements.slideshowStatus.querySelector('.status-text').textContent = 
                'Translate some words to start the slideshow';
        }
    }
    
    startSlideshow() {
        if (this.currentSigns.length === 0) return;
        
        if (this.slideshowPaused) {
            // Resume from pause
            this.slideshowPaused = false;
        } else {
            // Start fresh
            this.slideshowIndex = 0;
        }
        
        this.slideshowPlaying = true;
        this.updateSlideshowControls();
        this.elements.slideshowProgress.style.display = 'flex';
        this.elements.slideshowSection.classList.add('playing');
        
        this.playSlideshowSign();
    }
    
    pauseSlideshow() {
        this.slideshowPaused = true;
        this.slideshowPlaying = false;
        this.updateSlideshowControls();
        this.elements.slideshowSection.classList.remove('playing');
        
        const video = this.elements.slideshowVideoContainer.querySelector('video');
        if (video) {
            video.pause();
        }
        
        this.elements.slideshowStatus.querySelector('.status-text').textContent = 'Paused';
        this.elements.slideshowStatus.classList.add('paused');
        this.elements.slideshowStatus.classList.remove('playing');
    }
    
    stopSlideshow() {
        this.slideshowPlaying = false;
        this.slideshowPaused = false;
        this.slideshowIndex = 0;
        
        this.updateSlideshowControls();
        this.elements.slideshowProgress.style.display = 'none';
        this.elements.slideshowSection.classList.remove('playing');
        this.elements.slideshowStatus.classList.remove('playing', 'paused');
        
        this.elements.slideshowVideoContainer.innerHTML = `
            <div class="slideshow-placeholder">
                <span class="placeholder-icon">🎬</span>
                <p>Slideshow stopped</p>
            </div>
        `;
        this.elements.slideshowSignInfo.innerHTML = '';
        this.updateSlideshowAvailability();
    }
    
    updateSlideshowControls() {
        this.elements.slideshowPlayBtn.disabled = this.slideshowPlaying || this.currentSigns.length === 0;
        this.elements.slideshowPauseBtn.disabled = !this.slideshowPlaying;
        this.elements.slideshowStopBtn.disabled = !this.slideshowPlaying && !this.slideshowPaused;
    }
    
    playSlideshowSign() {
        if (!this.slideshowPlaying || this.currentSigns.length === 0) return;
        
        const current = this.currentSigns[this.slideshowIndex];
        const sign = current.sign;
        
        // Build video URL
        const videoFilename = sign.video;
        const localVideoPath = `video/${sign.nzsl_id}/${videoFilename}`;
        const onlineVideoPath = `https://nzsl-signbank-media-production.s3.amazonaws.com/glossvideo/${sign.nzsl_id}/${videoFilename}`;
        const imagePath = `image/${sign.image}`;
        
        // Update status
        this.elements.slideshowStatus.querySelector('.status-text').textContent = 
            `Playing: ${sign.gloss.english.join(', ')}`;
        this.elements.slideshowStatus.classList.add('playing');
        this.elements.slideshowStatus.classList.remove('paused');
        
        // Update progress
        const progress = ((this.slideshowIndex + 1) / this.currentSigns.length) * 100;
        this.elements.slideshowProgressBar.style.width = `${progress}%`;
        this.elements.slideshowCounter.textContent = 
            `${this.slideshowIndex + 1} / ${this.currentSigns.length}`;
        
        // Create video element
        this.elements.slideshowVideoContainer.innerHTML = `
            <video autoplay class="fade-in" id="slideshowVideo">
                <source src="${localVideoPath}" type="video/mp4">
                <source src="${onlineVideoPath}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
        
        const video = this.elements.slideshowVideoContainer.querySelector('video');
        
        // Handle video error - try online source
        video.onerror = () => {
            video.src = onlineVideoPath;
            video.load();
            video.play();
        };
        
        // When video ends, play the next one
        video.onended = () => {
            if (!this.slideshowPlaying) return;
            
            this.slideshowIndex++;
            
            // Loop back to start
            if (this.slideshowIndex >= this.currentSigns.length) {
                this.slideshowIndex = 0;
            }
            
            this.playSlideshowSign();
        };
        
        // Update sign info
        const englishWords = sign.gloss.english.join(', ');
        const secondaryWords = sign.gloss.english_secondary.filter(w => w).join(', ');
        const maoriWords = sign.gloss.maori.filter(w => w).join(', ');
        
        this.elements.slideshowSignInfo.innerHTML = `
            <div class="fade-in">
                <h3>${englishWords}</h3>
                <div class="sign-details">
                    ${secondaryWords ? `<p><strong>Also means:</strong> ${secondaryWords}</p>` : ''}
                    ${maoriWords ? `<p><strong>Māori:</strong> ${maoriWords}</p>` : ''}
                    <p><strong>Word in sentence:</strong> "${current.word}"</p>
                </div>
                <img src="${imagePath}" alt="${englishWords}" class="sign-image" 
                     onerror="this.style.display='none'">
            </div>
        `;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.nzslApp = new NZSLApp();
});

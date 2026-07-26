// ============================================
// CEPL English Learning App - Main JavaScript
// ============================================

// Application State
const state = {
    currentScreen: 0,
    totalScreens: 12,
    stars: 0,
    progress: 0,
    teacherName: '',
    classSize: 20,
    isPaused: false,
    answers: {
        exercise1: null,
        exercise2: null,
        exercise3: null,
        assessment1: null,
        assessment2: null,
        assessment3: null
    },
    gameMatches: 0,
    flashcardIndex: 0,
    objectivesCompleted: [false, false, false, false], // Track completion of 4 objectives
    animalGame: {
        animalIndex: 0,
        phase: 'intro', // intro | clues | guess | teach | repeat | celebrate
        clueIndex: 0,
        repeatCount: 0,
        completed: []
    },
    voice: {
        celebrationIndex: 0,
        encouragementIndex: 0,
        spokenScreens: new Set(),
        pronunciationStep: {} // screenId -> step completed
    },
    // Narration controls
    narration: {
        speed: 'normal',   // 'normal' | 'slow' | 'very-slow'
        audioMode: 'tts'   // 'tts' | 'files' (auto-switches when mp3s detected)
    }
};

// Objective completion mapping by screen
const objectiveMapping = {
    'teaching-hello': 0,
    'teaching-name': 1,
    'teaching-question': 2,
    'teaching-dialogue': 3
};

// Screen Data with Enhanced Teacher Notes
const screens = [
    {
        id: 'welcome',
        teacherNotes: 'TEACHER SAYS: "Welcome to our English class! Today we\'re going to learn how to greet people in English." | STUDENTS RESPOND: Students listen and get excited | TEACHER ACTION: Point to screen, smile, gesture to class | EXPECTED LEARNING OUTCOME: Students understand they will learn English greetings | ESTIMATED DURATION: 2 minutes | TEACHING TIPS: Ensure Smart Board is connected and audio is working. Have students seated comfortably where they can see the screen. Use Buddy the Parrot to build excitement.'
    },
    {
        id: 'teacher-setup',
        teacherNotes: 'TEACHER SAYS: "Let me set up our class for today." | STUDENTS RESPOND: Students watch setup | TEACHER ACTION: Enter name, select class size | EXPECTED LEARNING OUTCOME: Personalized learning experience | ESTIMATED DURATION: 1 minute | TEACHING TIPS: Enter your name for personalized experience. Select class size for group activities. This helps tailor activities to your class size.'
    },
    {
        id: 'lesson-intro',
        teacherNotes: 'TEACHER SAYS: "Today we will learn: Say Hello, Introduce yourself, Ask someone\'s name, and Respond naturally." | STUDENTS RESPOND: Students nod, show understanding | TEACHER ACTION: Point to each objective, read in Marathi first | EXPECTED LEARNING OUTCOME: Students understand lesson goals | ESTIMATED DURATION: 3 minutes | TEACHING TIPS: Read objectives in Marathi first so students understand what they will learn. Explain that learning English will help them in the future. Use Buddy to explain each objective.'
    },
    {
        id: 'warmup',
        teacherNotes: 'TEACHER SAYS: "Let\'s warm up! Wave your hand and say Hello with me!" | STUDENTS RESPOND: Students wave and say "Hello" | TEACHER ACTION: Play greeting animation, wave with students | EXPECTED LEARNING OUTCOME: Students feel comfortable speaking English | ESTIMATED DURATION: 3 minutes | TEACHING TIPS: Play the greeting animation. Ask students to wave and say "Hello" along with the characters. Encourage everyone to participate - no wrong answers! Make it fun and energetic.'
    },
    {
        id: 'teaching-hello',
        teacherNotes: 'TEACHER SAYS: "Listen carefully: Hello. Now say it with me: Hello." | STUDENTS RESPOND: Students repeat "Hello" 3-4 times | TEACHER ACTION: Click audio button, break down word, connect to Marathi | EXPECTED LEARNING OUTCOME: Students pronounce "Hello" correctly | ESTIMATED DURATION: 4 minutes | TEACHING TIPS: Click the audio button to play pronunciation. Have students repeat 3-4 times together. Break down the word: heh-LOH. Connect to Marathi "नमस्कार". Buddy will demonstrate the pronunciation.'
    },
    {
        id: 'teaching-name',
        teacherNotes: 'TEACHER SAYS: "My name is [your name]. Now you say: My name is [your name]." | STUDENTS RESPOND: Students practice with their names | TEACHER ACTION: Give example, call on 3-4 students | EXPECTED LEARNING OUTCOME: Students can introduce themselves | ESTIMATED DURATION: 5 minutes | TEACHING TIPS: Explain that they replace the blank with their own name. Give example: "My name is [Teacher\'s name]". Have 3-4 students practice with their real names. Buddy will encourage shy students.'
    },
    {
        id: 'teaching-question',
        teacherNotes: 'TEACHER SAYS: "What is your name? Ask me: What is your name?" | STUDENTS RESPOND: Students practice asking the question | TEACHER ACTION: Demonstrate to a student, use hand gestures | EXPECTED LEARNING OUTCOME: Students can ask someone\'s name | ESTIMATED DURATION: 4 minutes | TEACHING TIPS: Demonstrate asking the question to a student. Have students practice asking each other. Explain the difference between asking and telling. Use hand gestures. Buddy will explain the difference.'
    },
    {
        id: 'teaching-dialogue',
        teacherNotes: 'TEACHER SAYS: "Watch how two people greet each other. Group A asks, Group B responds." | STUDENTS RESPOND: Students watch, then practice in groups | TEACHER ACTION: Play dialogue, divide class into groups | EXPECTED LEARNING OUTCOME: Students understand conversation flow | ESTIMATED DURATION: 6 minutes | TEACHING TIPS: Play the complete dialogue. Explain the flow of conversation. Divide class into two groups for role-play. Group A asks, Group B responds. Buddy will guide the conversation.'
    },
    {
        id: 'guided-practice',
        teacherNotes: 'TEACHER SAYS: "Which word goes here? Point to the correct word." | STUDENTS RESPOND: Students point, teacher clicks correct word | EXPECTED LEARNING OUTCOME: Students can construct sentences | ESTIMATED DURATION: 4 minutes | TEACHING TIPS: Read the sentence with blanks. Ask students which word fits first blank. Click correct word to place it. Celebrate correct answers. Buddy will celebrate with students.'
    },
    {
        id: 'pair-activity',
        teacherNotes: 'TEACHER SAYS: "Turn to your neighbor. Practice greeting each other. Switch roles after 1 minute." | STUDENTS RESPOND: Students practice in pairs | TEACHER ACTION: Set timer, walk around, help struggling students | EXPECTED LEARNING OUTCOME: Students practice in realistic scenario | ESTIMATED DURATION: 3 minutes | TEACHING TIPS: Pair students with neighbors. Set timer for 2 minutes. Walk around and help struggling students. Have pairs switch roles. Buddy will encourage participation.'
    },
    {
        id: 'guess-animal-game',
        teacherNotes: 'TEACHER SAYS: "What animal is this?" Point to the silhouette. Read each clue aloud. | STUDENTS RESPOND: Students guess in English, then say "This is a cat." three times together | TEACHER ACTION: Click clues one by one, let students guess, use Repeat Together button | EXPECTED LEARNING OUTCOME: Students practice simple English speaking with animal vocabulary | ESTIMATED DURATION: 8 minutes | TEACHING TIPS: Ask "What animal is this?" before revealing clues. After correct answer, have everyone repeat the sentence three times. Use the pronunciation and sound buttons. Celebrate each animal with stars!'
    },
    {
        id: 'interactive-game',
        teacherNotes: 'TEACHER SAYS: "Let\'s play a matching game! Match English with Marathi." | STUDENTS RESPOND: Students come to board, make matches | TEACHER ACTION: Explain rules, call students to board | EXPECTED LEARNING OUTCOME: Students reinforce learning through game | ESTIMATED DURATION: 5 minutes | TEACHING TIPS: Explain the game rules. Call on students to come to board and make matches. Keep energy high. Celebrate every correct match. Buddy will cheer for correct answers.'
    },
    {
        id: 'revision',
        teacherNotes: 'TEACHER SAYS: "Let\'s review everything we learned. Say each phrase with me." | STUDENTS RESPOND: Students say each phrase together | TEACHER ACTION: Flip through phrases, keep fast pace | EXPECTED LEARNING OUTCOME: Students recall all learned phrases | ESTIMATED DURATION: 3 minutes | TEACHING TIPS: Quick flip through all phrases. Have students say each phrase together. Ask if anyone needs clarification. Keep it fast-paced and energetic. Buddy will help with recall.'
    },
    {
        id: 'assessment',
        teacherNotes: 'TEACHER SAYS: "Let\'s check what we learned. I\'ll read each question. Think carefully, then answer." | STUDENTS RESPOND: Students think and answer | TEACHER ACTION: Read questions, give thinking time | EXPECTED LEARNING OUTCOME: Teacher assesses student understanding | ESTIMATED DURATION: 5 minutes | TEACHING TIPS: Explain this is a check of what they learned. Read each question aloud. Give students time to think before answering. No pressure - this is practice. Buddy will encourage regardless of answers.'
    },
    {
        id: 'congratulations',
        teacherNotes: 'TEACHER SAYS: "Amazing work everyone! Look at all the stars you earned! You can use these phrases in real life!" | STUDENTS RESPOND: Students clap, celebrate | TEACHER ACTION: Show stars, celebrate achievement | EXPECTED LEARNING OUTCOME: Students feel proud and motivated | ESTIMATED DURATION: 2 minutes | TEACHING TIPS: Celebrate the class achievement! Show total stars. Have students clap for themselves. Explain they can use these phrases in real life. Buddy will dance and celebrate with them.'
    },
    {
        id: 'lesson-complete',
        teacherNotes: 'TEACHER SAYS: "You earned this certificate by working together! Practice at home. Thank you for your effort!" | STUDENTS RESPOND: Students feel proud, excited | TEACHER ACTION: Show certificate, thank students | EXPECTED LEARNING OUTCOME: Students feel accomplished and motivated | ESTIMATED DURATION: 2 minutes | TEACHING TIPS: Show certificate. Explain they earned this by working together. Encourage them to practice at home. Thank students for their effort. Buddy will give final encouragement.'
    }
];

// Flashcard Data
const flashcards = [
    {
        front: 'Hello',
        back: 'नमस्कार',
        phonetic: 'heh-LOH'
    },
    {
        front: 'My name is...',
        back: 'माझे नाव आहे...',
        phonetic: 'my neym iz'
    },
    {
        front: 'What is your name?',
        back: 'तुमचे नाव काय आहे?',
        phonetic: 'wot iz yor neym?'
    },
    {
        front: 'Complete Dialogue',
        back: 'A: Hello! What is your name?\nB: Hello! My name is Riya.',
        phonetic: ''
    }
];

// Assessment Questions
const assessmentQuestions = [
    {
        question: 'How do you say "नमस्कार" in English?',
        options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'],
        correct: 0
    },
    {
        question: 'Complete: My name is _____',
        options: ['Riya', 'is', 'name', 'what'],
        correct: 0
    },
    {
        question: 'Which means "तुमचे नाव काय आहे?"',
        options: ['My name is...', 'What is your name?', 'Hello!', 'Goodbye!'],
        correct: 1
    }
];

// DOM Elements
const mainContent = document.getElementById('main-content');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const starsCount = document.getElementById('stars-count');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pauseBtn = document.getElementById('pause-btn');
const toggleNotes = document.getElementById('toggle-notes');
const notesContent = document.getElementById('notes-content');
const notesText = document.getElementById('notes-text');
const toggleObjectives = document.getElementById('toggle-objectives');
const objectivesContent = document.getElementById('objectives-content');
const restartBtn = document.getElementById('restart-btn');
const buddyMascot = document.getElementById('buddy-mascot');
const buddySpeech = document.getElementById('buddy-speech');

// Initialize Application
function init() {
    renderScreen();
    updateProgress();
    updateStars();
    setupEventListeners();
    updateTeacherNotes();
    updateBuddyMessage();
}

// Setup Event Listeners
function setupEventListeners() {
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartLesson);
    toggleNotes.addEventListener('click', () => {
        notesContent.classList.toggle('hidden');
    });
    toggleObjectives.addEventListener('click', () => {
        objectivesContent.classList.toggle('hidden');
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
    // Don't handle if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            if (!prevBtn.disabled) navigate(-1);
            break;
        case 'ArrowRight':
            if (!nextBtn.disabled) navigate(1);
            break;
        case ' ':
        case 'p':
        case 'P':
            togglePause();
            e.preventDefault();
            break;
        case 'r':
        case 'R':
            restartLesson();
            break;
        case 'n':
        case 'N':
            notesContent.classList.toggle('hidden');
            break;
        case 'o':
        case 'O':
            objectivesContent.classList.toggle('hidden');
            break;
    }
}

// Restart lesson
function restartLesson() {
    if (confirm('Are you sure you want to restart the lesson? All progress will be lost.')) {
        state.currentScreen = 0;
        state.stars = 0;
        state.objectivesCompleted = [false, false, false, false];
        selectedWords = [];
        selectedGameCards = [];
        gameStars = 0;
        currentAssessmentQuestion = 0;
        state.flashcardIndex = 0;
        state.animalGame = {
            animalIndex: 0,
            phase: 'intro',
            clueIndex: 0,
            repeatCount: 0,
            completed: []
        };
        state.voice = {
            celebrationIndex: 0,
            encouragementIndex: 0,
            spokenScreens: new Set(),
            pronunciationStep: {}
        };
        
        // Reset objectives display
        const objectiveItems = document.querySelectorAll('.objective-item');
        objectiveItems.forEach(item => {
            item.setAttribute('data-complete', 'false');
        });
        
        updateProgress();
        updateStars();
        renderScreen();
        updateTeacherNotes();
        updateNavigationButtons();
    }
}

// Navigation
function navigate(direction) {
    BuddyVoice.cancel();
    const newScreen = state.currentScreen + direction;
    if (newScreen >= 0 && newScreen < screens.length) {
        state.currentScreen = newScreen;
        updateObjectives();
        renderScreen();
        updateProgress();
        updateTeacherNotes();
        updateBuddyMessage();
        updateNavigationButtons();
    }
}

// Update objectives based on current screen
function updateObjectives() {
    const screenId = screens[state.currentScreen].id;
    const objectiveIndex = objectiveMapping[screenId];
    
    if (objectiveIndex !== undefined && !state.objectivesCompleted[objectiveIndex]) {
        state.objectivesCompleted[objectiveIndex] = true;
        
        const objectiveItems = document.querySelectorAll('.objective-item');
        if (objectiveItems[objectiveIndex]) {
            objectiveItems[objectiveIndex].setAttribute('data-complete', 'true');
            objectiveItems[objectiveIndex].style.animation = 'celebrate 0.5s ease';
        }
    }
}

function updateNavigationButtons() {
    prevBtn.disabled = state.currentScreen === 0;
    nextBtn.disabled = state.currentScreen === screens.length - 1;
}

// Pause Functionality
function togglePause() {
    state.isPaused = !state.isPaused;
    pauseBtn.textContent = state.isPaused ? '▶ Resume' : '⏸ Pause';
    if (state.isPaused) {
        BuddyVoice.cancel();
        mainContent.style.opacity = '0.5';
    } else {
        mainContent.style.opacity = '1';
        updateBuddyMessage();
    }
}

// Update Progress
function updateProgress() {
    const progress = Math.round((state.currentScreen / (screens.length - 1)) * 100);
    state.progress = progress;
    
    // Use requestAnimationFrame for smooth progress bar animation
    requestAnimationFrame(() => {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
    });
}

// Update Stars
function updateStars() {
    requestAnimationFrame(() => {
        starsCount.textContent = state.stars;
    });
}

// Update Teacher Notes
function updateTeacherNotes() {
    if (screens[state.currentScreen]) {
        requestAnimationFrame(() => {
            notesText.textContent = screens[state.currentScreen].teacherNotes;
        });
    }
}

// Add Star
function addStar() {
    state.stars++;
    updateStars();
    animateStar();
    createSparkle();
}

function animateStar() {
    const starsContainer = document.getElementById('stars-container');
    starsContainer.style.animation = 'none';
    setTimeout(() => {
        starsContainer.style.animation = 'starPulse 0.5s ease';
    }, 10);
}

// Create sparkle effect
function createSparkle() {
    const overlay = document.getElementById('celebration-overlay');
    if (!overlay) return;
    
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = '✨';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    overlay.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 1000);
}

// Create confetti celebration
function createConfetti() {
    const overlay = document.getElementById('celebration-overlay');
    if (!overlay) return;
    
    const colors = ['#FFD93D', '#4ECDC4', '#6BCB77', '#FF9F43', '#A29BFE', '#FF6B6B'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            overlay.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 50);
    }
}

// ============================================
// MARATHI NARRATION ENGINE
// Sounds like a real Marathi primary school teacher
// Teaching pattern:
//   1. Buddy explains in Marathi
//   2. Children listen
//   3. English phrase — spoken slowly & clearly
//   4. Buddy explains meaning in Marathi
//   5. Buddy asks children to repeat together
//   6. Buddy praises children in Marathi
// ============================================

// ── Voice selection speeds ──────────────────────────────
// Marathi speech: slow, warm, clear
// English phrase: very slow so children can catch each word
const RATE_MR  = 1.0;    // Marathi narration (1x speed as requested)
const RATE_EN  = 0.42;   // English phrase (slow & clear)
const RATE_EN_REPEAT = 0.38; // Even slower when children repeat
const RATE_ANIMAL = 0.55;
const PITCH_TEACHER = 1.10; // Warm female-teacher pitch
const PAUSE_SHORT  = 700;
const PAUSE_MEDIUM = 1200;
const PAUSE_LONG   = 1800;

// ── Marathi Script Library ──────────────────────────────
// Every screen gets its own Marathi narration script.
// Each property is spoken by Buddy in sequence.
const marathiScripts = {
    'welcome': {
        intro:  'नमस्कार मित्रांनो! मी तुमचा मित्र Buddy आहे.',
        next:   'आज आपण इंग्रजी शिकणार आहोत. तयार आहात?',
        bubble: '👋 नमस्कार मित्रांनो!'
    },
    'teacher-setup': {
        intro:  'शिक्षकजी, आपले नाव आणि वर्गाची माहिती टाका.',
        bubble: '🎒 वर्गाची माहिती भरा!'
    },
    'lesson-intro': {
        intro:  'मित्रांनो, आज आपण चार गोष्टी शिकणार आहोत.',
        next:   'नीट ऐका आणि लक्षात ठेवा.',
        bubble: '📚 आज आपण शिकणार आहोत!'
    },
    'warmup': {
        intro:  'चला सुरुवात करूया! हात हलवा आणि माझ्यासोबत म्हणा.',
        bubble: '🎵 आपण सराव करूया!'
    },
    'teaching-hello': {
        intro:       'मित्रांनो, आधी नीट ऐका.',
        english:     'Hello.',
        meaning:     "'Hello' म्हणजे 'नमस्कार'.",
        repeatCue:   'आता सगळे मिळून म्हणा...',
        praise:      'खूप छान! तुम्ही खूप छान बोललात.',
        bubble:      "👋 'Hello' म्हणजे 'नमस्कार'!"
    },
    'teaching-name': {
        intro:       'आता आपण स्वतःची ओळख करून देणार आहोत.',
        english:     'My name is.',
        meaning:     "'My name is' म्हणजे 'माझे नाव आहे'.",
        repeatCue:   'आता सगळे मिळून म्हणा...',
        praise:      'शाब्बास! तुम्ही खूप छान ओळख करून दिली.',
        bubble:      "✨ 'My name is' म्हणजे 'माझे नाव आहे'!"
    },
    'teaching-question': {
        intro:       'आता आपण एक प्रश्न शिकणार आहोत.',
        english:     'What is your name?',
        meaning:     "'What is your name?' म्हणजे 'तुमचे नाव काय आहे?'.",
        repeatCue:   'आता सगळे मिळून म्हणा...',
        praise:      'अप्रतिम! तुम्ही खूप हुशार आहात.',
        bubble:      "❓ 'What is your name?' म्हणजे 'तुमचे नाव काय आहे?'!"
    },
    'teaching-dialogue': {
        intro:       'आता दोन मित्र एकमेकांशी बोलत आहेत. नीट ऐका.',
        lineA:       'Hello! What is your name?',
        lineB:       'Hello! My name is Riya.',
        meaning:     'हे एक छान संभाषण आहे. दोन मित्र एकमेकांना ओळखत आहेत.',
        repeatCue:   'आता सगळे एकत्र सराव करूया!',
        praise:      'वाहवा! खूप छान संभाषण केले तुम्ही!',
        bubble:      '💬 चला संभाषण शिकूया!'
    },
    'guided-practice': {
        intro:  'आता तुम्ही स्वतः प्रयत्न करा. रिकाम्या जागी बरोबर शब्द टाका.',
        bubble: '🎯 स्वतः करून पाहा!'
    },
    'pair-activity': {
        intro:  'आता शेजारी बसलेल्या मित्राशी सराव करा. एकमेकांना Hello म्हणा.',
        bubble: '👫 मित्राशी सराव करा!'
    },
    'guess-animal-game': {
        intro:   'मित्रांनो, आता आपण एक खेळ खेळणार आहोत. प्राणी ओळखा आणि इंग्रजीत बोला!',
        clue:    'नीट ऐका, मी तुम्हाला संकेत देतो.',
        guess:   'हा कोणता प्राणी आहे? सांगा!',
        correct: 'बरोबर! आता सगळे मिळून म्हणा...',
        praise:  'खूप छान! तुम्ही हा प्राणी ओळखला!',
        bubble:  '🐾 प्राणी ओळखा आणि इंग्रजीत बोला!'
    },
    'interactive-game': {
        intro:  'आता आपण जोड्या शोधण्याचा खेळ खेळूया. इंग्रजी आणि मराठी जोड्या शोधा.',
        bubble: '🎮 जोड्या शोधा!'
    },
    'revision': {
        intro:  'आता आपण आज काय शिकलो ते आठवूया. माझ्यासोबत म्हणा.',
        bubble: '📖 आज काय शिकलो ते आठवूया!'
    },
    'assessment': {
        intro:  'आता आपण एक छोटी परीक्षा देणार आहोत. घाबरू नका, शांतपणे विचार करा.',
        bubble: '📝 शांतपणे विचार करा!'
    },
    'congratulations': {
        intro:  'वाहवा! तुम्ही सगळ्यांनी खूप छान काम केले! मला तुमचा अभिमान आहे!',
        next:   'तुम्ही आज इंग्रजीत खूप काही शिकले. हे सगळे रोजच्या आयुष्यात वापरा.',
        bubble: '🎉 खूप छान! अभिनंदन!'
    },
    'lesson-complete': {
        intro:  'तुम्ही मिळून हे प्रमाणपत्र मिळवले! घरी सराव करा. धन्यवाद!',
        bubble: '🏆 तुम्ही इंग्रजी तारे आहात!'
    }
};

// ── Marathi Celebration Phrases ─────────────────────────
const marathiCelebrations = [
    'खूप छान!',
    'शाब्बास!',
    'अप्रतिम!',
    'वाहवा!',
    'तुम्ही खूप हुशार आहात!',
    'मला तुमचा अभिमान आहे!',
    'खूप सुंदर!',
    'बरोबर आहे! छान केले!'
];

// ── Marathi Encouragement Phrases ───────────────────────
const marathiEncouragements = [
    'घाबरू नका, परत प्रयत्न करा.',
    'छान प्रयत्न! आणखी एकदा म्हणा.',
    'जवळजवळ बरोबर! पुन्हा एकदा.',
    'थोडे वेगळे. परत म्हणा.',
    'हिम्मत ठेवा! तुम्ही करू शकता.'
];

// ── AudioFilePlayer ──────────────────────────────────────
// Plays pre-recorded Marathi MP3 files when available.
// Transparently falls back to TTS if file is missing.
const AudioFilePlayer = {
    // Map: screenKey_segment -> Audio object (loaded on demand)
    _cache: {},
    // Set of confirmed-available file paths
    _available: new Set(),
    // Base folder for audio files
    BASE: 'audio/',

    // Build expected filename for a screen+segment
    filename(screenKey, segment) {
        return `${this.BASE}${screenKey}_${segment}.mp3`;
    },

    // Check if a file exists (probe once, cache result)
    async probe(path) {
        if (this._available.has(path)) return true;
        try {
            const res = await fetch(path, { method: 'HEAD' });
            if (res.ok) { this._available.add(path); return true; }
        } catch (_) {}
        return false;
    },

    // Play an audio file; returns Promise that resolves when done.
    // Returns false if file not found so caller can use TTS instead.
    async play(screenKey, segment) {
        const path = this.filename(screenKey, segment);
        const found = await this.probe(path);
        if (!found) return false;

        return new Promise(resolve => {
            const audio = new Audio(path);
            audio.playbackRate = state.narration.speed === 'slow' ? 0.85 :
                                 state.narration.speed === 'very-slow' ? 0.70 : 1.0;
            audio.play().catch(() => resolve(false));
            audio.onended = () => resolve(true);
            audio.onerror = () => resolve(false);
        });
    }
};

// ── BuddyVoice – Dual-language narration engine ──────────
const BuddyVoice = {
    abortToken: 0,

    // Speed presets (controlled via narration controls UI)
    get speedMult() {
        if (state.narration.speed === 'slow') return 0.80;
        if (state.narration.speed === 'very-slow') return 0.65;
        return 1.0;
    },

    cancel() {
        this.abortToken++;
        if ('speechSynthesis' in window) {
            if (speechSynthesis.speaking || speechSynthesis.pending) {
                speechSynthesis.cancel();
                // Brief delay to unstick Chrome's speech engine
                setTimeout(() => speechSynthesis.resume(), 10);
            }
        }
        if (buddyMascot) buddyMascot.classList.remove('talking');
        document.querySelectorAll('.word.active, .word.emphasized').forEach(w => {
            w.classList.remove('active', 'emphasized');
        });
    },

    delay(ms) {
        const token = this.abortToken;
        return new Promise(resolve => {
            setTimeout(() => {
                if (token === this.abortToken) resolve();
            }, ms);
        });
    },

    // ── Voice selection ──────────────────────────────────
    // Returns the best available voice for the given language
    getVoice(lang) {
        if (!('speechSynthesis' in window)) return null;
        const voices = speechSynthesis.getVoices();
        if (lang === 'mr') {
            // Priority: Marathi → Hindi (very close phonetics) → English
            return voices.find(v => v.lang === 'mr-IN') ||
                   voices.find(v => v.lang.startsWith('mr')) ||
                   voices.find(v => v.lang === 'hi-IN' && v.name.includes('Female')) ||
                   voices.find(v => v.lang === 'hi-IN') ||
                   voices.find(v => v.lang.startsWith('hi')) ||
                   voices.find(v => v.lang === 'en-IN') ||
                   voices.find(v => v.lang.startsWith('en')) ||
                   null;
        } else {
            // English voice: prefer clear female US English
            return voices.find(v => v.lang === 'en-US' && (
                       v.name.includes('Samantha') ||
                       v.name.includes('Zira') ||
                       v.name.includes('Google US English') ||
                       v.name.includes('Female')
                   )) ||
                   voices.find(v => v.lang === 'en-US') ||
                   voices.find(v => v.lang === 'en-IN') ||
                   voices.find(v => v.lang.startsWith('en')) ||
                   null;
        }
    },

    // ── Core speak primitive ─────────────────────────────
    speakOne(text, options = {}) {
        return new Promise(resolve => {
            if (!('speechSynthesis' in window) || state.isPaused) { resolve(); return; }
            const token = this.abortToken;

            // Try audio file first if mode allows
            if (options.audioKey) {
                AudioFilePlayer.play(options.audioKey, options.audioSeg || 'intro')
                    .then(played => {
                        if (played) { resolve(); return; }
                        this._ttsSpeak(text, options, token, resolve);
                    });
            } else {
                this._ttsSpeak(text, options, token, resolve);
            }
        });
    },

    _ttsSpeak(text, options, token, resolve) {
        const utterance = new SpeechSynthesisUtterance(text);
        const lang = options.lang || 'mr';
        const baseRate = options.rate ?? (lang === 'en' ? RATE_EN : RATE_MR);
        utterance.rate  = baseRate * this.speedMult;
        utterance.pitch = options.pitch ?? PITCH_TEACHER;
        utterance.volume = 1;

        const voice = this.getVoice(lang);
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang; // Must match voice to prevent browser silent block
        } else {
            utterance.lang = lang === 'en' ? 'en-US' : 'mr-IN';
        }

        if (options.buddyTalks !== false && buddyMascot) {
            buddyMascot.classList.add('talking');
        }
        utterance.onend = () => {
            if (token !== this.abortToken) return;
            if (buddyMascot && !options.keepTalking) buddyMascot.classList.remove('talking');
            resolve();
        };
        utterance.onerror = (e) => {
            console.error('TTS Error for text:', text, e);
            if (token !== this.abortToken) return;
            if (buddyMascot && !options.keepTalking) buddyMascot.classList.remove('talking');
            resolve();
        };
        speechSynthesis.speak(utterance);
    },

    // ── Speak Marathi (warm teacher voice) ──────────────
    async sayMarathi(text, bubbleText = null, animation = 'talking') {
        if (bubbleText || text) showBuddySpeech(bubbleText || text, animation);
        await this.speakOne(text, { lang: 'mr', rate: RATE_MR });
    },

    // ── Speak English phrase (slow & clear for children) ─
    async sayEnglish(text, elementId = null, opts = {}) {
        const rate = opts.emphasis ? RATE_EN_REPEAT : RATE_EN;
        if (elementId) {
            await this.highlightAndSpeak(text, elementId, { lang: 'en', rate, emphasis: opts.emphasis });
        } else {
            await this.speakOne(text, { lang: 'en', rate });
        }
    },

    // ── Word-highlight while speaking ───────────────────
    wrapWords(element, text) {
        if (!element) return [];
        const words = text.match(/[\w']+|[.,!?…]/g) || [text];
        element.innerHTML = words.map(w =>
            `<span class="word${/[.,!?]/.test(w) ? ' word-punct' : ''}">${w}</span>`
        ).join(' ');
        return element.querySelectorAll('.word:not(.word-punct)');
    },

    clearHighlights(element) {
        if (!element) return;
        element.querySelectorAll('.word').forEach(w => w.classList.remove('active', 'emphasized'));
    },

    async highlightAndSpeak(text, elementId, options = {}) {
        const element = elementId ? document.getElementById(elementId) : null;
        const wordEls = element ? this.wrapWords(element, text) : [];
        const rate = (options.rate ?? RATE_EN) * this.speedMult;
        const token = this.abortToken;

        if (buddyMascot) buddyMascot.classList.add('talking');

        const speakPromise = this._ttsSpeak(text,
            { lang: options.lang || 'en', rate: options.rate ?? RATE_EN, buddyTalks: true, keepTalking: true },
            token, () => {});

        if (wordEls.length > 0) {
            const msPerChar = 130 / rate;
            let elapsed = 0;
            wordEls.forEach(wordEl => {
                const wordDuration = Math.max(350, wordEl.textContent.length * msPerChar);
                const t = elapsed;
                setTimeout(() => {
                    if (token !== this.abortToken) return;
                    this.clearHighlights(element);
                    wordEl.classList.add(options.emphasis ? 'emphasized' : 'active');
                }, t);
                elapsed += wordDuration + PAUSE_SHORT * 0.35;
            });
        }

        // Properly await TTS
        await new Promise(resolve => {
            this._ttsSpeak(text,
                { lang: options.lang || 'en', rate: options.rate ?? RATE_EN, buddyTalks: true, keepTalking: false },
                token, resolve);
        });

        if (token === this.abortToken) {
            this.clearHighlights(element);
            if (buddyMascot) buddyMascot.classList.remove('talking');
        }
    },

    // ── 6-Step Teaching Pattern ──────────────────────────
    // This is the core teaching loop used on every lesson screen.
    async teachingSequence(screenKey, englishPhrase, elementId = null) {
        const s = marathiScripts[screenKey];
        if (!s) return;
        const token = this.abortToken;

        // Step 1: Buddy explains in Marathi
        await this.sayMarathi(s.intro, s.bubble || s.intro, 'pointing');
        if (token !== this.abortToken) return;
        await this.delay(PAUSE_MEDIUM);

        // Step 2–3: English phrase spoken slowly & clearly (twice)
        if (token !== this.abortToken) return;
        await this.sayEnglish(englishPhrase, elementId);
        await this.delay(PAUSE_MEDIUM);

        // Step 4: Buddy explains meaning in Marathi
        if (token !== this.abortToken) return;
        await this.sayMarathi(s.meaning, s.meaning, 'talking');
        await this.delay(PAUSE_MEDIUM);

        // Step 5: Repeat invitation + English phrase again (slower)
        if (token !== this.abortToken) return;
        await this.sayMarathi(s.repeatCue, s.repeatCue, 'talking');
        await this.delay(PAUSE_SHORT);
        if (token !== this.abortToken) return;
        await this.sayEnglish(englishPhrase, elementId, { emphasis: true });
        await this.delay(PAUSE_MEDIUM);

        // Step 6: Buddy praises in Marathi
        if (token !== this.abortToken) return;
        await this.sayMarathi(s.praise, s.praise, 'happy-dance');
    },

    // ── Pronunciation Panel Steps (3-step listen/repeat) ─
    // step 1 = Listen (Marathi cue + English)
    // step 2 = Listen Again (Marathi cue + English)
    // step 3 = Repeat Together (Marathi invite + English slower)
    async pronunciationStep(step, phrase, elementId) {
        if (step === 1) {
            await this.sayMarathi('आधी नीट ऐका.', 'आधी नीट ऐका.', 'pointing');
            await this.delay(PAUSE_MEDIUM);
            await this.sayEnglish(phrase, elementId);
        } else if (step === 2) {
            await this.sayMarathi('आता परत ऐका.', 'आता परत ऐका.', 'talking');
            await this.delay(PAUSE_MEDIUM);
            await this.sayEnglish(phrase, elementId);
        } else if (step === 3) {
            await this.sayMarathi('आता सगळे मिळून म्हणा...', 'आता सगळे मिळून म्हणा...', 'happy-dance');
            await this.delay(PAUSE_SHORT);
            await this.sayEnglish(phrase, elementId, { emphasis: true });
            await this.delay(PAUSE_SHORT);
            const praise = marathiCelebrations[Math.floor(Math.random() * marathiCelebrations.length)];
            await this.sayMarathi(praise, praise, 'happy-dance');
        }
    },

    // ── Legacy compat: teach new phrase (used by animal game etc.)
    async teachNewPhrase(phrase, elementId) {
        await this.sayMarathi('नीट ऐका.', 'नीट ऐका.', 'pointing');
        await this.delay(PAUSE_MEDIUM);
        for (let i = 0; i < 2; i++) {
            await this.sayEnglish(phrase, elementId);
            await this.delay(PAUSE_SHORT);
        }
        await this.sayMarathi('आता सगळे मिळून म्हणा...', 'आता सगळे मिळून म्हणा...', 'talking');
        await this.delay(PAUSE_MEDIUM);
        await this.sayEnglish(phrase, elementId, { emphasis: true });
    },

    // ── sayWithBubble: Marathi bubble + speech ───────────
    async sayWithBubble(text, animation = 'talking') {
        showBuddySpeech(text, animation);
        // Detect if text is Marathi (has Devanagari chars) or English
        const isMarathi = /[\u0900-\u097F]/.test(text);
        await this.speakOne(text, { lang: isMarathi ? 'mr' : 'en' });
    },

    // ── speakSequence: generic step runner ───────────────
    async speakSequence(steps) {
        for (const step of steps) {
            if (this.abortToken !== (step._token ?? this.abortToken)) break;
            if (typeof step === 'string') {
                await this.speakOne(step);
            } else if (step.text) {
                if (step.bubble) showBuddySpeech(step.text, step.animation || 'talking');
                if (step.highlight && step.elementId) {
                    await this.highlightAndSpeak(step.text, step.elementId, step);
                } else {
                    await this.speakOne(step.text, step);
                }
            }
            if (step.pauseAfter) await this.delay(step.pauseAfter);
        }
    }
};

// ── Phrase Library ───────────────────────────────────────
const phraseLibrary = {
    hello: 'Hello',
    helloExclaim: 'Hello!',
    name: 'My name is',
    nameExample: 'My name is Riya',
    question: 'What is your name?',
    dialogueA: 'Hello! What is your name?',
    dialogueB: 'Hello! My name is Riya.'
};

// ── Screen activity intro ────────────────────────────────
// Fires when navigating to a new screen.
// For teaching screens: triggers the full 6-step sequence.
// For other screens: speaks the Marathi intro line only.
function speakActivityIntro(screenId) {
    const script = marathiScripts[screenId];
    if (!script) return;

    BuddyVoice.cancel();
    showBuddySpeech(script.bubble || script.intro, 'talking');

    // Screens that use the full 6-step teaching pattern
    const teachingScreens = {
        'teaching-hello':    { phrase: phraseLibrary.hello,    elementId: 'pronunciation-phrase' },
        'teaching-name':     { phrase: phraseLibrary.name,     elementId: 'pronunciation-phrase' },
        'teaching-question': { phrase: phraseLibrary.question, elementId: 'pronunciation-phrase' }
    };

    setTimeout(async () => {
        if (screens[state.currentScreen]?.id !== screenId) return;

        if (teachingScreens[screenId]) {
            const { phrase, elementId } = teachingScreens[screenId];
            await BuddyVoice.teachingSequence(screenId, phrase, elementId);
        } else if (screenId === 'teaching-dialogue') {
            await runDialogueSequence();
        } else {
            // Just speak the intro line
            if (script.intro) await BuddyVoice.sayMarathi(script.intro, script.bubble || script.intro, 'talking');
            if (script.next)  { await BuddyVoice.delay(PAUSE_MEDIUM); await BuddyVoice.sayMarathi(script.next, script.next, 'talking'); }
        }
        if (buddyMascot) buddyMascot.classList.remove('talking');
    }, 500);
}

// 6-step sequence for the dialogue screen (two lines)
async function runDialogueSequence() {
    const s = marathiScripts['teaching-dialogue'];
    const token = BuddyVoice.abortToken;

    await BuddyVoice.sayMarathi(s.intro, s.bubble, 'pointing');
    if (token !== BuddyVoice.abortToken) return;
    await BuddyVoice.delay(PAUSE_MEDIUM);

    // Line A
    await BuddyVoice.sayEnglish(s.lineA, 'dialogue-a');
    await BuddyVoice.delay(PAUSE_LONG);
    if (token !== BuddyVoice.abortToken) return;

    // Line B
    await BuddyVoice.sayEnglish(s.lineB, 'dialogue-b');
    await BuddyVoice.delay(PAUSE_MEDIUM);
    if (token !== BuddyVoice.abortToken) return;

    await BuddyVoice.sayMarathi(s.meaning, s.meaning, 'talking');
    await BuddyVoice.delay(PAUSE_MEDIUM);
    if (token !== BuddyVoice.abortToken) return;

    await BuddyVoice.sayMarathi(s.repeatCue, s.repeatCue, 'talking');
    await BuddyVoice.delay(PAUSE_SHORT);
    if (token !== BuddyVoice.abortToken) return;
    await BuddyVoice.sayEnglish(s.lineA, 'dialogue-a', { emphasis: true });
    await BuddyVoice.delay(PAUSE_SHORT);
    await BuddyVoice.sayEnglish(s.lineB, 'dialogue-b', { emphasis: true });
    await BuddyVoice.delay(PAUSE_MEDIUM);
    if (token !== BuddyVoice.abortToken) return;

    await BuddyVoice.sayMarathi(s.praise, s.praise, 'happy-dance');
}

function getNextEncouragement() {
    const msg = marathiEncouragements[state.voice.encouragementIndex % marathiEncouragements.length];
    state.voice.encouragementIndex++;
    return msg;
}

function getNextCelebration() {
    const msg = marathiCelebrations[state.voice.celebrationIndex % marathiCelebrations.length];
    state.voice.celebrationIndex++;
    return msg;
}

// Show Buddy speech bubble
function showBuddySpeech(message, animation = 'talking') {
    if (!buddySpeech || !buddyMascot) return;

    buddySpeech.textContent = message;
    buddySpeech.classList.remove('hidden');

    buddyMascot.classList.remove('happy-dance', 'thinking', 'pointing', 'talking');
    buddyMascot.classList.add(animation);

    setTimeout(() => { buddyMascot.classList.remove(animation); }, 2500);
}

function hideBuddySpeech() {
    if (!buddySpeech) return;
    buddySpeech.classList.add('hidden');
}

function updateBuddyMessage() {
    const screenId = screens[state.currentScreen].id;
    speakActivityIntro(screenId);
}

async function buddyCelebrate() {
    const message = getNextCelebration();
    showBuddySpeech(message, 'happy-dance');
    await BuddyVoice.speakOne(message, { lang: 'mr', rate: RATE_MR });
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createSparkle(), i * 100);
    }
}

async function buddyEncourage() {
    const message = getNextEncouragement();
    showBuddySpeech(message, 'thinking');
    await BuddyVoice.speakOne(message, { lang: 'mr', rate: RATE_MR });
}

function renderPronunciationPanel(phrase, elementId, screenKey) {
    const step = state.voice.pronunciationStep[screenKey] || 0;
    return `
        <div class="pronunciation-panel">
            <div class="pronunciation-steps">
                <span class="pron-step ${step >= 1 ? 'done' : step === 0 ? 'active' : ''}">1. Listen</span>
                <span class="pron-step ${step >= 2 ? 'done' : step === 1 ? 'active' : ''}">2. Listen Again</span>
                <span class="pron-step ${step >= 3 ? 'done' : step === 2 ? 'active' : ''}">3. Repeat Together</span>
            </div>
            <div id="${elementId}" class="word-display pronunciation-text text-english">${phrase}</div>
            <div class="pronunciation-buttons">
                <button class="btn-pronunciation ${step >= 1 ? 'done' : ''}" onclick="runPronunciationStep('${screenKey}', 1, '${elementId}')">
                    👂 1. Listen
                </button>
                <button class="btn-pronunciation ${step >= 2 ? 'done' : ''}" onclick="runPronunciationStep('${screenKey}', 2, '${elementId}')" ${step < 1 ? 'disabled' : ''}>
                    👂 2. Listen Again
                </button>
                <button class="btn-pronunciation ${step >= 3 ? 'done' : ''}" onclick="runPronunciationStep('${screenKey}', 3, '${elementId}')" ${step < 2 ? 'disabled' : ''}>
                    🗣️ 3. Repeat Together
                </button>
            </div>
            <button class="btn-secondary mt-md" onclick="buddyTeachFullPhrase('${elementId}')">
                🔊 Learn Full Phrase
            </button>
        </div>
    `;
}

async function runPronunciationStep(screenKey, step, elementId) {
    const phraseMap = {
        'warmup': phraseLibrary.helloExclaim,
        'teaching-hello': phraseLibrary.hello,
        'teaching-name': phraseLibrary.name,
        'teaching-question': phraseLibrary.question
    };
    const phrase = phraseMap[screenKey] || document.getElementById(elementId)?.textContent?.trim();
    if (!phrase) return;

    BuddyVoice.cancel();
    setAudioButtonPlaying(event?.target);

    await BuddyVoice.pronunciationStep(step, phrase, elementId);

    if (!state.voice.pronunciationStep[screenKey] || state.voice.pronunciationStep[screenKey] < step) {
        state.voice.pronunciationStep[screenKey] = step;
    }

    const screenId = screens[state.currentScreen].id;
    if (screenId === screenKey || (screenKey === 'warmup' && screenId === 'warmup')) {
        const renderers = {
            'warmup': renderWarmupScreen,
            'teaching-hello': renderTeachingHelloScreen,
            'teaching-name': renderTeachingNameScreen,
            'teaching-question': renderTeachingQuestionScreen
        };
        if (renderers[screenKey]) renderers[screenKey]();
    }
}

async function buddyTeachFullPhrase(elementId) {
    const el = document.getElementById(elementId);
    const phrase = el?.textContent?.trim();
    if (!phrase) return;

    BuddyVoice.cancel();
    setAudioButtonPlaying(event?.target);
    await BuddyVoice.teachNewPhrase(phrase, elementId);
}

function setAudioButtonPlaying(btn) {
    const audioBtn = btn?.closest?.('.btn-audio, .btn-pronunciation, .btn-secondary');
    if (!audioBtn) return;
    audioBtn.classList.add('playing');
    setTimeout(() => audioBtn.classList.remove('playing'), 2000);
}

async function playAudio(type, elementId = null) {
    BuddyVoice.cancel();
    setAudioButtonPlaying(event?.target);

    if (type === 'dialogue') {
        await BuddyVoice.sayWithBubble('नीट ऐका. दोन मित्र बोलत आहेत.', 'pointing');
        await BuddyVoice.delay(PAUSE_MEDIUM);
        await BuddyVoice.sayEnglish(phraseLibrary.dialogueA, elementId || 'dialogue-a');
        await BuddyVoice.delay(PAUSE_LONG);
        await BuddyVoice.sayEnglish(phraseLibrary.dialogueB, elementId || 'dialogue-b');
        return;
    }

    const phraseMap = {
        hello: phraseLibrary.hello,
        name: phraseLibrary.name,
        question: phraseLibrary.question
    };
    const phrase = phraseMap[type] || type;
    const targetId = elementId || 'pronunciation-phrase';
    await BuddyVoice.teachNewPhrase(phrase, targetId);
}

async function speakText(text, elementId = null, options = {}) {
    BuddyVoice.cancel();
    // Detect language: if it's an English phrase use en voice, else mr
    const isMarathi = /[\u0900-\u097F]/.test(text);
    if (elementId) {
        await BuddyVoice.highlightAndSpeak(text, elementId,
            { lang: isMarathi ? 'mr' : 'en', rate: isMarathi ? RATE_MR : RATE_EN, ...options });
    } else {
        await BuddyVoice.speakOne(text,
            { lang: isMarathi ? 'mr' : 'en', rate: isMarathi ? RATE_MR : RATE_EN, buddyTalks: true });
    }
}

// ── Narration Control Functions ──────────────────────────

// Replay the narration for the current screen
function replayNarration() {
    const screenId = screens[state.currentScreen].id;
    const btn = document.getElementById('replay-narration-btn');
    if (btn) btn.classList.add('narrating');
    speakActivityIntro(screenId);
    // Remove pulse class after narration would have ended (12s max)
    setTimeout(() => { if (btn) btn.classList.remove('narrating'); }, 12000);
}

// Set narration speed from the speed dropdown
function setNarrationSpeed(value) {
    state.narration.speed = value; // 'normal' | 'slow' | 'very-slow'
}

// Update the mode indicator pill based on available audio
function updateNarrationModeIndicator(hasFiles) {
    const indicator = document.getElementById('narration-mode-indicator');
    if (!indicator) return;
    if (hasFiles) {
        indicator.className = 'narration-mode-files';
        indicator.textContent = '🎵 Audio Files';
        state.narration.audioMode = 'files';
    } else {
        indicator.className = 'narration-mode-tts';
        indicator.textContent = '🔊 TTS';
        state.narration.audioMode = 'tts';
    }
}

// Probe for at least one audio file to switch indicator
async function detectAudioFiles() {
    const testPath = AudioFilePlayer.filename('teaching-hello', 'intro');
    const found = await AudioFilePlayer.probe(testPath);
    updateNarrationModeIndicator(found);
}

// Preload voices on first interaction (both Marathi and English)
if ('speechSynthesis' in window) {
    // Load voices immediately
    speechSynthesis.getVoices();
    // Chrome fires voiceschanged asynchronously
    speechSynthesis.addEventListener('voiceschanged', () => speechSynthesis.getVoices());
}

// On DOM ready, probe for audio files
document.addEventListener('DOMContentLoaded', () => {
    detectAudioFiles();
});


// ============================================
// Buddy the Parrot Mascot (visual helpers)
// ============================================

// ============================================
// Achievement Badges System
// ============================================

const achievements = {
    'greeting-champion': {
        name: 'Greeting Champion',
        icon: '👋',
        description: 'Mastered saying Hello!',
        unlocked: false
    },
    'english-star': {
        name: 'English Star',
        icon: '⭐',
        description: 'Completed all exercises!',
        unlocked: false
    },
    'excellent-listener': {
        name: 'Excellent Listener',
        icon: '👂',
        description: 'Listened carefully throughout!',
        unlocked: false
    },
    'fantastic-speaker': {
        name: 'Fantastic Speaker',
        icon: '🗣️',
        description: 'Spoke confidently!',
        unlocked: false
    },
    'lesson-master': {
        name: 'Lesson Master',
        icon: '🏆',
        description: 'Completed Lesson 1!',
        unlocked: false
    }
};

// Unlock achievement
function unlockAchievement(achievementId) {
    if (achievements[achievementId] && !achievements[achievementId].unlocked) {
        achievements[achievementId].unlocked = true;
        buddyCelebrate();
        createSparkle();
    }
}

// Render achievement badges
function renderAchievementBadges() {
    const badgesHTML = Object.entries(achievements).map(([id, achievement]) => {
        const lockedClass = achievement.unlocked ? '' : 'locked';
        return `
            <div class="achievement-wrapper">
                <div class="achievement-badge-display ${lockedClass}">
                    ${achievement.icon}
                </div>
                <div class="achievement-label">${achievement.name}</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="achievements-grid">
            ${badgesHTML}
        </div>
    `;
}

// Create fireworks
function createFireworks() {
    const overlay = document.getElementById('celebration-overlay');
    if (!overlay) return;
    
    const colors = ['#FFD93D', '#4ECDC4', '#6BCB77', '#FF9F43', '#A29BFE', '#FF6B6B', '#FF6B6B', '#FF9F43'];
    
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 60 + 20 + '%';
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            overlay.appendChild(firework);
            
            // Create particles
            for (let j = 0; j < 12; j++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.className = 'firework-particle';
                    particle.style.left = firework.style.left;
                    particle.style.top = firework.style.top;
                    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    const angle = (j / 12) * 360;
                    const distance = 50 + Math.random() * 30;
                    particle.style.setProperty('--tx', Math.cos(angle * Math.PI / 180) * distance + 'px');
                    particle.style.setProperty('--ty', Math.sin(angle * Math.PI / 180) * distance + 'px');
                    
                    overlay.appendChild(particle);
                    setTimeout(() => particle.remove(), 1000);
                }, j * 30);
            }
            
            setTimeout(() => firework.remove(), 1500);
        }, i * 300);
    }
}

// Render Screen
function renderScreen() {
    const screenId = screens[state.currentScreen].id;
    
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
        mainContent.innerHTML = '';
        
        const screenRenderers = {
            'welcome': renderWelcomeScreen,
            'teacher-setup': renderTeacherSetupScreen,
            'lesson-intro': renderLessonIntroScreen,
            'warmup': renderWarmupScreen,
            'teaching-hello': renderTeachingHelloScreen,
            'teaching-name': renderTeachingNameScreen,
            'teaching-question': renderTeachingQuestionScreen,
            'teaching-dialogue': renderTeachingDialogueScreen,
            'guided-practice': renderGuidedPracticeScreen,
            'pair-activity': renderPairActivityScreen,
            'guess-animal-game': renderGuessAnimalGameScreen,
            'interactive-game': renderInteractiveGameScreen,
            'revision': renderRevisionScreen,
            'assessment': renderAssessmentScreen,
            'congratulations': renderCongratulationsScreen,
            'lesson-complete': renderLessonCompleteScreen
        };
        
        const renderer = screenRenderers[screenId] || renderWelcomeScreen;
        renderer();
        
        updateNavigationButtons();
    });
}

// ============================================
// Screen Render Functions
// ============================================

function renderWelcomeScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active welcome-screen';
    screen.innerHTML = `
        <div class="logo">CEPL English Learning</div>
        <h1 class="text-english">Welcome to English Class!</h1>
        <h2 class="text-marathi">इंग्रजी वर्गात स्वागत आहे!</h2>
        <p class="text-medium text-english mt-lg">Lesson 1: Greetings & Self Introduction</p>
        <p class="text-medium text-marathi">सत्र १: शुभेच्छा आणि स्वतःची ओळख</p>
        <div class="welcome-characters">
            <div class="character">👋</div>
            <div class="character">👧</div>
            <div class="character">👦</div>
        </div>
        <button class="btn-primary mt-xl" onclick="navigate(1)">Start Lesson</button>
    `;
    mainContent.appendChild(screen);
}

function renderTeacherSetupScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large flex-column flex-center gap-lg">
            <h2 class="text-english">Teacher Setup</h2>
            <h3 class="text-marathi">शिक्षक सेटअप</h3>
            <div class="flex-column gap-md mt-lg">
                <label class="text-medium text-english">Teacher Name:</label>
                <input type="text" id="teacher-name-input" class="text-medium" 
                       placeholder="Enter your name" 
                       style="padding: 16px; font-size: 20px; border-radius: 8px; border: 2px solid var(--sky-blue);">
                <label class="text-medium text-english mt-md">Class Size:</label>
                <select id="class-size-input" style="padding: 16px; font-size: 20px; border-radius: 8px; border: 2px solid var(--sky-blue);">
                    <option value="20">20 students</option>
                    <option value="25">25 students</option>
                    <option value="30">30 students</option>
                </select>
            </div>
            <button class="btn-primary mt-lg" onclick="saveTeacherSetup()">Continue</button>
            <button class="btn-secondary mt-md" onclick="navigate(1)">Skip</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

function saveTeacherSetup() {
    const nameInput = document.getElementById('teacher-name-input');
    const sizeInput = document.getElementById('class-size-input');
    if (nameInput) {
        state.teacherName = nameInput.value;
    }
    if (sizeInput) {
        state.classSize = parseInt(sizeInput.value);
    }
    navigate(1);
}

function renderLessonIntroScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large">
            <h2 class="text-english text-center">Today We Will Learn:</h2>
            <h3 class="text-marathi text-center mb-lg">आज आपण शिकणार आहोत:</h3>
            <ul class="learning-list">
                <li class="text-english">Say "Hello!"</li>
                <li class="text-marathi">"Hello!" म्हणणे</li>
                <li class="text-english">Say "My name is..."</li>
                <li class="text-marathi">"My name is..." म्हणणे</li>
                <li class="text-english">Ask "What is your name?"</li>
                <li class="text-marathi">"What is your name?" विचारणे</li>
                <li class="text-english">Respond confidently</li>
                <li class="text-marathi">आत्मविश्वासाने उत्तर देणे</li>
            </ul>
            <div class="text-center mt-xl">
                <div style="font-size: 80px; animation: bounce 2s infinite;">🎯</div>
            </div>
            <button class="btn-primary mt-xl" style="width: 100%;" onclick="navigate(1)">Let's Begin!</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

function renderWarmupScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large flex-column flex-center gap-lg">
            <h2 class="text-english">Let's Warm Up!</h2>
            <h3 class="text-marathi">आपण सराव करूया!</h3>
            <p class="text-medium text-english">Watch and Repeat</p>
            <p class="text-medium text-marathi">पाहा आणि पुनरावृत्ती करा</p>
            <div class="welcome-characters">
                <div class="character">👋</div>
                <div class="character">👧</div>
            </div>
            ${renderPronunciationPanel('Hello!', 'pronunciation-phrase', 'warmup')}
            <button class="btn-primary mt-lg" onclick="addStar(); navigate(1)">Next</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

function renderTeachingHelloScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large teaching-content">
            <h2 class="text-english text-center">Learn: Hello</h2>
            <div class="phonetic text-english">heh-LOH</div>
            <div class="translation text-marathi">नमस्कार</div>
            <p class="text-medium text-marathi mt-md">आपण लोकांना भेटताना 'Hello' म्हणतो</p>
            ${renderPronunciationPanel('Hello', 'pronunciation-phrase', 'teaching-hello')}
            <button class="btn-primary mt-lg" onclick="addStar(); navigate(1)">Next Word</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

function renderTeachingNameScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large teaching-content">
            <h2 class="text-english text-center">Learn: My name is...</h2>
            <div class="phonetic text-english">my neym iz</div>
            <div class="translation text-marathi">माझे नाव आहे...</div>
            <p class="text-medium text-marathi mt-md">आपण स्वतःची ओळख करून देण्यासाठी हे वाक्य वापरतो</p>
            <div class="text-medium text-english mt-lg">Example:</div>
            <div id="name-example" class="pronunciation-text text-medium text-english">My name is Riya</div>
            <button class="btn-audio mt-md" onclick="speakText('My name is Riya', 'name-example')">🔊 Example</button>
            ${renderPronunciationPanel('My name is', 'pronunciation-phrase', 'teaching-name')}
            <button class="btn-primary mt-lg" onclick="addStar(); navigate(1)">Next Phrase</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

function renderTeachingQuestionScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large teaching-content">
            <h2 class="text-english text-center">Learn: What is your name?</h2>
            <div class="phonetic text-english">wot iz yor neym?</div>
            <div class="translation text-marathi">तुमचे नाव काय आहे?</div>
            <p class="text-medium text-marathi mt-md">आपण इतरांची नावे विचारण्यासाठी हे वाक्य वापरतो</p>
            <div class="flex-center gap-lg mt-lg">
                <div style="font-size: 60px;">👧</div>
                <div style="font-size: 60px;">❓</div>
                <div style="font-size: 60px;">👦</div>
            </div>
            ${renderPronunciationPanel('What is your name?', 'pronunciation-phrase', 'teaching-question')}
            <button class="btn-primary mt-lg" onclick="addStar(); navigate(1)">Next Phrase</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

function renderTeachingDialogueScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large teaching-content">
            <h2 class="text-english text-center">Complete Dialogue</h2>
            <div class="flex-center gap-xl mt-lg">
                <div class="flex-column gap-md" style="background: var(--light-gray); padding: 24px; border-radius: 16px;">
                    <div style="font-size: 48px;">👧</div>
                    <div id="dialogue-a" class="text-medium text-english pronunciation-text">Hello! What is your name?</div>
                    <div class="text-small text-marathi">Hello! तुमचे नाव काय आहे?</div>
                </div>
                <div class="flex-column gap-md" style="background: var(--light-gray); padding: 24px; border-radius: 16px;">
                    <div style="font-size: 48px;">👦</div>
                    <div id="dialogue-b" class="text-medium text-english pronunciation-text">Hello! My name is Riya.</div>
                    <div class="text-small text-marathi">Hello! माझे नाव रिया आहे.</div>
                </div>
            </div>
            <button class="btn-audio mt-lg" onclick="playAudio('dialogue')">🔊 Play Dialogue</button>
            <button class="btn-primary mt-lg" onclick="addStar(); navigate(1)">Practice Together</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

function renderGuidedPracticeScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large">
            <h2 class="text-english text-center">Fill in the Blanks</h2>
            <h3 class="text-marathi text-center mb-lg">रिकाम्या जागा भरा</h3>
            <div class="exercise-card text-english">
                _____ ! My name is _____ .
            </div>
            <div class="word-bank">
                <button class="word-option" onclick="selectWord(this, 'Hello')">Hello</button>
                <button class="word-option" onclick="selectWord(this, 'name')">name</button>
                <button class="word-option" onclick="selectWord(this, 'is')">is</button>
                <button class="word-option" onclick="selectWord(this, 'What')">What</button>
            </div>
            <div id="exercise-feedback" class="text-medium text-center mt-lg"></div>
            <button class="btn-primary mt-lg" onclick="checkExercise()">Check Answer</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

let selectedWords = [];

function selectWord(button, word) {
    button.classList.toggle('selected');
    if (button.classList.contains('selected')) {
        selectedWords.push(word);
    } else {
        selectedWords = selectedWords.filter(w => w !== word);
    }
}

function checkExercise() {
    const feedback = document.getElementById('exercise-feedback');
    if (selectedWords.length === 2 && selectedWords.includes('Hello') && selectedWords.includes('is')) {
        const msg = getNextCelebration();
        feedback.innerHTML = `<span class="text-success">✓ ${msg}</span>`;
        feedback.innerHTML += '<span class="text-marathi">✓ बरोबर! छान केले!</span>';
        addStar();
        buddyCelebrate();
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createSparkle(), i * 100);
        }
        setTimeout(() => navigate(1), 2500);
    } else {
        const msg = getNextEncouragement();
        feedback.innerHTML = `<span class="text-warning">💪 ${msg}</span>`;
        feedback.innerHTML += '<span class="text-marathi">पुन्हा प्रयत्न करा!</span>';
        buddyEncourage();
    }
}

function renderPairActivityScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large">
            <h2 class="text-english text-center">Practice with a Partner!</h2>
            <h3 class="text-marathi text-center mb-lg">पार्टनरसोबत सराव करा!</h3>
            <div class="flex-column gap-lg">
                <div style="background: var(--light-gray); padding: 24px; border-radius: 16px;">
                    <div class="text-medium text-english"><strong>Student A:</strong> Hello! What is your name?</div>
                    <div class="text-small text-marathi">विद्यार्थी A: Hello! तुमचे नाव काय आहे?</div>
                </div>
                <div style="background: var(--light-gray); padding: 24px; border-radius: 16px;">
                    <div class="text-medium text-english"><strong>Student B:</strong> Hello! My name is _____. What is your name?</div>
                    <div class="text-small text-marathi">विद्यार्थी B: Hello! माझे नाव _____. तुमचे नाव काय आहे?</div>
                </div>
                <div style="background: var(--light-gray); padding: 24px; border-radius: 16px;">
                    <div class="text-medium text-english"><strong>Student A:</strong> My name is _____.</div>
                    <div class="text-small text-marathi">विद्यार्थी A: माझे नाव _____.</div>
                </div>
            </div>
            <button class="btn-primary mt-lg" onclick="addStar(); navigate(1)">Next Activity</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

// ============================================
// Guess the Animal Mini-Game
// ============================================

const animalGameData = [
    {
        id: 'cat',
        emoji: '🐱',
        name: 'Cat',
        marathi: 'मांजर',
        phonetic: 'kat',
        sound: 'Meow',
        sentence: 'This is a cat.',
        clues: ['It says "Meow."', 'It likes milk.', 'It has a tail.']
    },
    {
        id: 'dog',
        emoji: '🐶',
        name: 'Dog',
        marathi: 'कुत्रा',
        phonetic: 'dog',
        sound: 'Woof woof',
        sentence: 'This is a dog.',
        clues: ['It says "Woof woof."', 'It is a good friend.', 'It wags its tail.']
    },
    {
        id: 'cow',
        emoji: '🐄',
        name: 'Cow',
        marathi: 'गाय',
        phonetic: 'kow',
        sound: 'Moo',
        sentence: 'This is a cow.',
        clues: ['It says "Moo."', 'It gives us milk.', 'It eats grass.']
    },
    {
        id: 'goat',
        emoji: '🐐',
        name: 'Goat',
        marathi: 'शेळी',
        phonetic: 'goht',
        sound: 'Baa',
        sentence: 'This is a goat.',
        clues: ['It says "Baa."', 'It has horns.', 'It climbs hills.']
    },
    {
        id: 'lion',
        emoji: '🦁',
        name: 'Lion',
        marathi: 'सिंह',
        phonetic: 'LY-un',
        sound: 'Roar',
        sentence: 'This is a lion.',
        clues: ['It says "Roar!"', 'It is the king of the jungle.', 'It has a big mane.']
    },
    {
        id: 'elephant',
        emoji: '🐘',
        name: 'Elephant',
        marathi: 'हत्ती',
        phonetic: 'EL-uh-funt',
        sound: 'Trumpet',
        sentence: 'This is an elephant.',
        clues: ['It is very big.', 'It has a long trunk.', 'It has big ears.']
    },
    {
        id: 'bird',
        emoji: '🐦',
        name: 'Bird',
        marathi: 'पक्षी',
        phonetic: 'burd',
        sound: 'Tweet tweet',
        sentence: 'This is a bird.',
        clues: ['It says "Tweet tweet."', 'It can fly.', 'It has wings.']
    },
    {
        id: 'monkey',
        emoji: '🐵',
        name: 'Monkey',
        marathi: 'माकड',
        phonetic: 'MUNG-kee',
        sound: 'Ooh ooh ah ah',
        sentence: 'This is a monkey.',
        clues: ['It says "Ooh ooh ah ah."', 'It loves bananas.', 'It swings on trees.']
    }
];

function resetAnimalGame() {
    state.animalGame = {
        animalIndex: 0,
        phase: 'intro',
        clueIndex: 0,
        repeatCount: 0,
        completed: []
    };
}

function getCurrentAnimal() {
    return animalGameData[state.animalGame.animalIndex];
}

function getAnimalGuessOptions(correctAnimal) {
    const others = animalGameData
        .filter(a => a.id !== correctAnimal.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    const options = [...others, correctAnimal].sort(() => Math.random() - 0.5);
    return options;
}

function renderGuessAnimalGameScreen() {
    const game = state.animalGame;
    const animal = getCurrentAnimal();
    const total = animalGameData.length;
    const screen = document.createElement('div');
    screen.className = 'screen active animal-game-screen';

    let contentHTML = '';

    if (game.phase === 'intro') {
        contentHTML = `
            <div class="animal-game-intro">
                <div class="animal-game-title">🐾 Guess the Animal – Speak in English!</div>
                <div class="animal-game-subtitle text-marathi">प्राणी ओळखा आणि इंग्रजीत बोला!</div>
                <div class="animal-game-buddy-msg speech-bubble-pop">
                    <span class="bubble-icon">💬</span>
                    Let's play! Guess the animal and speak in English!
                </div>
                <div class="animal-game-intro-animals">
                    ${animalGameData.slice(0, 4).map(a => `<span class="intro-animal">${a.emoji}</span>`).join('')}
                </div>
                <button class="btn-primary animal-game-start-btn" onclick="startAnimalGame()">Let's Play! 🎮</button>
            </div>
        `;
    } else if (game.phase === 'complete') {
        contentHTML = `
            <div class="animal-game-complete">
                <div class="animal-game-title">🎉 Amazing Job!</div>
                <div class="animal-game-subtitle text-marathi">छान केले! तुम्ही सर्व प्राणी शिकले!</div>
                <div class="animal-game-all-animals">
                    ${animalGameData.map(a => `<span class="completed-animal" title="${a.name}">${a.emoji}</span>`).join('')}
                </div>
                <p class="text-medium text-english text-center">You learned ${total} animals in English!</p>
                <button class="btn-primary mt-lg" onclick="addStar(); navigate(1)">Continue →</button>
            </div>
        `;
    } else {
        const showAnimal = ['teach', 'repeat', 'celebrate'].includes(game.phase);
        const isSilhouette = !showAnimal;

        contentHTML = `
            <div class="animal-game-progress">
                <span>Animal ${game.animalIndex + 1} of ${total}</span>
                <div class="animal-progress-dots">
                    ${animalGameData.map((a, i) => `
                        <span class="progress-dot ${i < game.animalIndex ? 'done' : ''} ${i === game.animalIndex ? 'active' : ''}">${a.emoji}</span>
                    `).join('')}
                </div>
            </div>

            <div class="animal-display-area">
                <div class="animal-picture ${isSilhouette ? 'silhouette' : 'revealed bounce-in'}" id="animal-picture">
                    <span class="animal-emoji">${animal.emoji}</span>
                </div>
                ${game.phase === 'clues' || game.phase === 'guess' ? `
                    <button class="btn-animal-sound" onclick="playAnimalSound('${animal.id}')" aria-label="Play animal sound">
                        🔊 ${animal.sound}
                    </button>
                ` : ''}
            </div>

            ${game.phase === 'clues' ? `
                <div class="clues-section">
                    <div class="clues-header text-english">Clues:</div>
                    <div class="clues-list" id="clues-list">
                        ${animal.clues.slice(0, game.clueIndex).map((clue, i) => `
                            <div class="clue-item speech-bubble-pop" style="animation-delay: ${i * 0.15}s">
                                <span class="clue-dot">🟡</span> ${clue}
                            </div>
                        `).join('')}
                    </div>
                    ${game.clueIndex < animal.clues.length ? `
                        <button class="btn-clue-next" onclick="showNextClue()">
                            Show Clue ${game.clueIndex + 1} 👉
                        </button>
                    ` : `
                        <button class="btn-clue-next btn-ready-guess" onclick="startAnimalGuess()">
                            Ready to Guess! 🎯
                        </button>
                    `}
                </div>
            ` : ''}

            ${game.phase === 'guess' ? `
                <div class="guess-section speech-bubble-pop">
                    <p class="guess-prompt text-english">What animal is this?</p>
                    <p class="guess-prompt-marathi text-marathi">हा कोणता प्राणी आहे?</p>
                    <div class="animal-guess-options">
                        ${getAnimalGuessOptions(animal).map(opt => `
                            <button class="animal-guess-btn" data-animal-id="${opt.id}" onclick="checkAnimalGuess('${opt.id}')">
                                <span class="guess-emoji">${opt.emoji}</span>
                                <span class="guess-name">${opt.name}</span>
                            </button>
                        `).join('')}
                    </div>
                    <div id="guess-feedback" class="guess-feedback"></div>
                </div>
            ` : ''}

            ${game.phase === 'teach' || game.phase === 'repeat' || game.phase === 'celebrate' ? `
                <div class="teach-section speech-bubble-pop">
                    <div class="correct-badge bounce-in">✓ Great Job!</div>
                    <div class="animal-names">
                        <div class="animal-name-en">${animal.emoji} ${animal.name}</div>
                        <div class="animal-name-mr text-marathi">${animal.marathi}</div>
                        <div class="animal-phonetic">${animal.phonetic}</div>
                    </div>
                    <div class="animal-action-buttons">
                        <button class="btn-game-action" onclick="playAnimalSound('${animal.id}')">🔊 Sound</button>
                        <button class="btn-game-action" onclick="speakText('${animal.name}', true)">🔊 Say "${animal.name}"</button>
                    </div>
                    <div class="sentence-teach">
                        <div class="sentence-label">👉 Say together:</div>
                        <div class="sentence-display" id="sentence-display">${animal.sentence}</div>
                        <button class="btn-game-action btn-buddy-speak" onclick="speakText('${animal.sentence}', true)">🔊 Buddy Says</button>
                    </div>
                    ${game.phase === 'repeat' ? `
                        <div class="repeat-section">
                            <div class="repeat-counter">
                                ${[1, 2, 3].map(n => `
                                    <span class="repeat-dot ${n <= game.repeatCount ? 'filled' : ''}">${n}</span>
                                `).join('')}
                            </div>
                            <p class="repeat-instruction text-english">Repeat together ${3 - game.repeatCount} more time${3 - game.repeatCount !== 1 ? 's' : ''}!</p>
                            <button class="btn-repeat-together" onclick="repeatTogether()">
                                🗣️ Repeat Together
                            </button>
                        </div>
                    ` : ''}
                    ${game.phase === 'celebrate' ? `
                        <button class="btn-primary animal-next-btn bounce-in" onclick="nextAnimal()">
                            ${game.animalIndex < total - 1 ? 'Next Animal →' : 'Finish Game 🎉'}
                        </button>
                    ` : ''}
                </div>
            ` : ''}
        `;
    }

    screen.innerHTML = `<div class="card card-large animal-game-card">${contentHTML}</div>`;
    mainContent.appendChild(screen);

    if (game.phase === 'intro') {
        setTimeout(() => speakActivityIntro('guess-animal-game'), 300);
    } else if (game.phase === 'clues' && game.clueIndex === 0) {
        setTimeout(async () => {
            await BuddyVoice.sayWithBubble('Look at the animal! I will give you clues!', 'pointing');
        }, 500);
    }
}

function startAnimalGame() {
    state.animalGame.phase = 'clues';
    state.animalGame.clueIndex = 0;
    renderGuessAnimalGameScreen();
    BuddyVoice.sayWithBubble('Here comes your first clue!', 'pointing');
}

function showNextClue() {
    const animal = getCurrentAnimal();
    if (state.animalGame.clueIndex < animal.clues.length) {
        state.animalGame.clueIndex++;
        renderGuessAnimalGameScreen();
        if (state.animalGame.clueIndex >= animal.clues.length) {
            BuddyVoice.sayWithBubble('Now can you guess?', 'thinking');
        } else {
            BuddyVoice.speakOne(animal.clues[state.animalGame.clueIndex - 1], { rate: BuddyVoice.RATE_INSTRUCTION });
        }
    }
}

function startAnimalGuess() {
    state.animalGame.phase = 'guess';
    renderGuessAnimalGameScreen();
    BuddyVoice.sayWithBubble('What animal is this?', 'pointing');
}

function checkAnimalGuess(guessedId) {
    const animal = getCurrentAnimal();
    const feedback = document.getElementById('guess-feedback');
    const buttons = document.querySelectorAll('.animal-guess-btn');

    if (guessedId === animal.id) {
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.animalId === guessedId) {
                btn.classList.add('correct');
            }
        });
        if (feedback) {
            feedback.innerHTML = '<span class="correct-text">🎉 Yes! It\'s a ' + animal.name + '!</span>';
        }
        setTimeout(async () => {
            state.animalGame.phase = 'teach';
            renderGuessAnimalGameScreen();
            const msg = getNextCelebration();
            showBuddySpeech(msg, 'happy-dance');
            await BuddyVoice.speakOne(msg, { rate: BuddyVoice.RATE_INSTRUCTION });
            await BuddyVoice.delay(BuddyVoice.PAUSE_MEDIUM);
            await BuddyVoice.teachNewPhrase(animal.sentence, 'sentence-display');
            setTimeout(() => {
                state.animalGame.phase = 'repeat';
                state.animalGame.repeatCount = 0;
                renderGuessAnimalGameScreen();
            }, 500);
        }, 1000);
    } else {
        const wrongBtn = document.querySelector(`.animal-guess-btn[data-animal-id="${guessedId}"]`);
        if (wrongBtn) {
            wrongBtn.classList.add('incorrect');
            wrongBtn.disabled = true;
        }
        const msg = getNextEncouragement();
        if (feedback) {
            feedback.innerHTML = `<span class="try-again-text">💪 ${msg}</span>`;
        }
        buddyEncourage();
    }
}

async function repeatTogether() {
    const animal = getCurrentAnimal();
    state.animalGame.repeatCount++;

    await BuddyVoice.sayWithBubble('आता सगळे मिळून म्हणा...', 'talking');
    await BuddyVoice.sayEnglish(animal.sentence, 'sentence-display', { emphasis: true });

    const dots = document.querySelectorAll('.repeat-dot');
    if (dots[state.animalGame.repeatCount - 1]) {
        dots[state.animalGame.repeatCount - 1].classList.add('filled', 'pop');
    }

    if (state.animalGame.repeatCount >= 3) {
        setTimeout(() => {
            state.animalGame.phase = 'celebrate';
            renderGuessAnimalGameScreen();
            celebrateAnimalComplete();
        }, 2000);
    } else {
        const remaining = 3 - state.animalGame.repeatCount;
        const countText = remaining === 1 ? 'आणखी एकदा' : `आणखी ${remaining} वेळा`;
        BuddyVoice.sayWithBubble(`${countText} म्हणा!`, 'talking');
    }
}

async function celebrateAnimalComplete() {
    const animal = getCurrentAnimal();
    state.animalGame.completed.push(animal.id);
    addStar();
    const msg = getNextCelebration();
    showBuddySpeech(msg + ' ⭐', 'happy-dance');
    await BuddyVoice.speakOne(msg + ' मला तुमचा अभिमान आहे!', { lang: 'mr', rate: RATE_MR });
    createConfetti();
    animateStarFly();
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createSparkle(), i * 100);
    }
}

function animateStarFly() {
    const starsContainer = document.getElementById('stars-container');
    const overlay = document.getElementById('celebration-overlay');
    if (!starsContainer || !overlay) return;

    const rect = starsContainer.getBoundingClientRect();
    const flyingStar = document.createElement('div');
    flyingStar.className = 'flying-star';
    flyingStar.textContent = '⭐';
    flyingStar.style.left = (window.innerWidth / 2 - 20) + 'px';
    flyingStar.style.top = (window.innerHeight / 2 - 20) + 'px';
    overlay.appendChild(flyingStar);

    requestAnimationFrame(() => {
        flyingStar.style.left = rect.left + 20 + 'px';
        flyingStar.style.top = rect.top + 10 + 'px';
        flyingStar.style.transform = 'scale(0.5)';
        flyingStar.style.opacity = '0';
    });

    setTimeout(() => flyingStar.remove(), 1000);
}

function nextAnimal() {
    if (state.animalGame.animalIndex < animalGameData.length - 1) {
        state.animalGame.animalIndex++;
        state.animalGame.phase = 'clues';
        state.animalGame.clueIndex = 0;
        state.animalGame.repeatCount = 0;
        renderGuessAnimalGameScreen();
        BuddyVoice.sayWithBubble('नवा प्राणी! संकेत नीट ऐका!', 'pointing');
    } else {
        state.animalGame.phase = 'complete';
        renderGuessAnimalGameScreen();
        createConfetti();
        createFireworks();
        buddyCelebrate();
    }
}

async function playAnimalSound(animalId) {
    const animal = animalGameData.find(a => a.id === animalId);
    if (!animal) return;

    BuddyVoice.cancel();
    setAudioButtonPlaying(event?.target);

    // Animal sounds are always in English, spoken with a fun pitch
    await BuddyVoice.speakOne(animal.sound, {
        lang: 'en',
        rate: RATE_ANIMAL,
        pitch: animal.id === 'lion' ? 0.65 : animal.id === 'bird' ? 1.25 : PITCH_TEACHER
    });
}

function renderInteractiveGameScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large">
            <h2 class="text-english text-center">Match the Greetings!</h2>
            <h3 class="text-marathi text-center mb-lg">शुभेच्छा जोडा शोधा!</h3>
            <div class="text-center text-medium mb-lg">
                Stars: <span id="game-stars">0</span>/5
            </div>
            <div class="game-board">
                <button class="game-card" onclick="selectGameCard(this, 'Hello')">Hello</button>
                <button class="game-card" onclick="selectGameCard(this, 'नमस्कार')">नमस्कार</button>
                <button class="game-card" onclick="selectGameCard(this, 'My name is')">My name is</button>
                <button class="game-card" onclick="selectGameCard(this, 'माझे नाव आहे')">माझे नाव आहे</button>
            </div>
            <div id="game-feedback" class="text-medium text-center mt-lg"></div>
            <button class="btn-primary mt-lg" onclick="navigate(1)">Next</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

let selectedGameCards = [];
let gameStars = 0;

function selectGameCard(card, value) {
    if (card.classList.contains('matched')) return;
    
    card.classList.add('selected');
    selectedGameCards.push({ card, value });
    
    if (selectedGameCards.length === 2) {
        checkGameMatch();
    }
}

function checkGameMatch() {
    const [first, second] = selectedGameCards;
    const feedback = document.getElementById('game-feedback');
    
    const pairs = [
        ['Hello', 'नमस्कार'],
        ['My name is', 'माझे नाव आहे']
    ];
    
    const isMatch = pairs.some(pair => 
        (pair[0] === first.value && pair[1] === second.value) ||
        (pair[1] === first.value && pair[0] === second.value)
    );
    
    if (isMatch) {
        first.card.classList.add('matched');
        second.card.classList.add('matched');
        first.card.classList.remove('selected');
        second.card.classList.remove('selected');
        gameStars++;
        document.getElementById('game-stars').textContent = gameStars;
        addStar();
        buddyCelebrate();
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createSparkle(), i * 100);
        }
        feedback.innerHTML = '<span class="text-success">✓ Match found!</span>';
    } else {
        first.card.classList.remove('selected');
        second.card.classList.remove('selected');
        feedback.innerHTML = '<span class="text-error">Try again!</span>';
        buddyEncourage();
    }
    
    selectedGameCards = [];
    
    if (gameStars >= 2) {
        setTimeout(() => {
            feedback.innerHTML += '<br><span class="text-success">🎉 All matches found!</span>';
            buddyCelebrate();
            for (let i = 0; i < 8; i++) {
                setTimeout(() => createSparkle(), i * 150);
            }
        }, 500);
    }
}

function renderRevisionScreen() {
    const card = flashcards[state.flashcardIndex];
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large teaching-content">
            <h2 class="text-english text-center">Let's Review!</h2>
            <h3 class="text-marathi text-center mb-lg">आपण आज काय शिकलो?</h3>
            <div class="text-center text-medium mb-lg">
                Card ${state.flashcardIndex + 1} of ${flashcards.length}
            </div>
            <div id="flashcard" class="flex-column flex-center gap-lg" style="background: var(--light-gray); padding: 48px; border-radius: 24px; min-height: 300px;">
                <div class="word-display text-english">${card.front}</div>
                ${card.phonetic ? `<div class="phonetic text-english">${card.phonetic}</div>` : ''}
                <div class="translation text-marathi">${card.back}</div>
            </div>
            <div class="flex-center gap-lg mt-lg">
                <button class="btn-secondary" onclick="previousFlashcard()">← Previous</button>
                <button class="btn-secondary" onclick="nextFlashcard()">Next →</button>
            </div>
            <button class="btn-primary mt-lg" onclick="addStar(); navigate(1)">Finish Review</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

function nextFlashcard() {
    if (state.flashcardIndex < flashcards.length - 1) {
        state.flashcardIndex++;
        renderRevisionScreen();
    }
}

function previousFlashcard() {
    if (state.flashcardIndex > 0) {
        state.flashcardIndex--;
        renderRevisionScreen();
    }
}

let currentAssessmentQuestion = 0;

function renderAssessmentScreen() {
    const question = assessmentQuestions[currentAssessmentQuestion];
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
        <div class="card card-large">
            <h2 class="text-english text-center">Show What You Learned!</h2>
            <h3 class="text-marathi text-center mb-lg">तुम्ही काय शिकले ते दाखवा!</h3>
            <div class="text-center text-medium mb-lg">
                Question ${currentAssessmentQuestion + 1} of ${assessmentQuestions.length}
            </div>
            <div class="question-card text-english">${question.question}</div>
            <div class="options-grid">
                ${question.options.map((option, index) => `
                    <button class="option-btn" onclick="checkAnswer(this, ${index}, ${question.correct})">${option}</button>
                `).join('')}
            </div>
            <div id="assessment-feedback" class="text-medium text-center mt-lg"></div>
            <button id="next-question-btn" class="btn-primary mt-lg hidden" onclick="nextAssessmentQuestion()">Next Question</button>
        </div>
    `;
    mainContent.appendChild(screen);
}

function checkAnswer(button, selected, correct) {
    const feedback = document.getElementById('assessment-feedback');
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => btn.disabled = true);
    
    if (selected === correct) {
        button.classList.add('correct');
        feedback.innerHTML = '<span class="text-success">✓ Correct! Great job!</span>';
        feedback.innerHTML += '<span class="text-marathi">✓ बरोबर! छान केले!</span>';
        addStar();
        buddyCelebrate();
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createSparkle(), i * 100);
        }
    } else {
        button.classList.add('incorrect');
        buttons[correct].classList.add('correct');
        feedback.innerHTML = '<span class="text-error">Not quite. The correct answer is highlighted.</span>';
        feedback.innerHTML += '<span class="text-marathi">थोडे वेगळे. बरोबर उत्तर हायलाइट केले आहे.</span>';
        buddyEncourage();
    }
    
    document.getElementById('next-question-btn').classList.remove('hidden');
}

function nextAssessmentQuestion() {
    currentAssessmentQuestion++;
    if (currentAssessmentQuestion < assessmentQuestions.length) {
        renderAssessmentScreen();
    } else {
        navigate(1);
    }
}

function renderCongratulationsScreen() {
    // Unlock achievements based on performance
    if (state.stars >= 10) {
        unlockAchievement('english-star');
    }
    unlockAchievement('lesson-master');
    unlockAchievement('greeting-champion');
    unlockAchievement('excellent-listener');
    unlockAchievement('fantastic-speaker');
    
    const screen = document.createElement('div');
    screen.className = 'screen active congratulations-screen';
    screen.innerHTML = `
        <div class="card card-large">
            <div class="achievement-badge">🏆</div>
            <h1 class="text-english">Great Job, Class!</h1>
            <h2 class="text-marathi">छान केले, वर्ग!</h2>
            <p class="text-medium text-english">You completed Lesson 1!</p>
            <p class="text-medium text-marathi">तुम्ही सत्र १ पूर्ण केले!</p>
            <div class="text-center mt-lg">
                <div style="font-size: 48px;">⭐ ${state.stars} Stars Collected!</div>
            </div>
            <h3 class="text-english mt-xl">Your Achievements</h3>
            ${renderAchievementBadges()}
            <ul class="learning-list">
                <li class="text-english">Say "Hello!"</li>
                <li class="text-english">Say "My name is..."</li>
                <li class="text-english">Ask "What is your name?"</li>
                <li class="text-english">Respond confidently</li>
            </ul>
            <button class="btn-primary mt-xl" onclick="navigate(1)">View Certificate</button>
        </div>
    `;
    mainContent.appendChild(screen);
    
    // Trigger celebration
    setTimeout(() => {
        createConfetti();
        createFireworks();
        for (let i = 0; i < 10; i++) {
            setTimeout(() => createSparkle(), i * 200);
        }
    }, 300);
}

function renderLessonCompleteScreen() {
    const screen = document.createElement('div');
    screen.className = 'screen active';
    
    const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    screen.innerHTML = `
        <div class="card card-large">
            <div class="certificate-container">
                <div class="certificate-header">
                    <div class="certificate-title">Certificate of Achievement</div>
                    <div class="certificate-subtitle">CEPL English Learning Program</div>
                </div>
                <div class="certificate-body">
                    <p class="text-medium text-english">This certifies that</p>
                    <div class="certificate-student-name">Amazing Student</div>
                    <p class="text-medium text-english">has successfully completed</p>
                    <div class="certificate-achievement">Lesson 1: Greetings & Self Introduction</div>
                    <div class="certificate-seal">⭐</div>
                </div>
                <div class="certificate-footer">
                    <div class="certificate-date">${today}</div>
                    <div class="text-medium text-english mt-lg">Total Stars: ${state.stars} ⭐</div>
                </div>
            </div>
            <div class="text-center mt-xl">
                <h3 class="text-english">Your Achievements</h3>
                ${renderAchievementBadges()}
            </div>
            <button class="btn-primary mt-xl" onclick="location.reload()">Start Over</button>
            <button class="btn-secondary mt-md" onclick="window.close()">Exit</button>
        </div>
    `;
    mainContent.appendChild(screen);
    
    // Trigger celebration
    setTimeout(() => {
        createConfetti();
        createFireworks();
        for (let i = 0; i < 15; i++) {
            setTimeout(() => createSparkle(), i * 150);
        }
    }, 300);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

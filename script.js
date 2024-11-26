// Elements

// Reader View Elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const lineHeightSlider = document.getElementById('lineHeightSlider');
const wordSpacingSlider = document.getElementById('wordSpacingSlider');
const fontSizeValue = document.getElementById('fontSizeValue');
const lineHeightValue = document.getElementById('lineHeightValue');
const wordSpacingValue = document.getElementById('wordSpacingValue');
const wordCountElem = document.getElementById('wordCount');
const readingTimeElem = document.getElementById('readingTime');
const readAloudBtn = document.getElementById('readAloudBtn');
const translateBtn = document.getElementById('translateBtn');
const themeSelect = document.getElementById('themeSelect');
const sourceLanguage = document.getElementById('sourceLanguage');
const targetLanguage = document.getElementById('targetLanguage');
const clearBtn = document.getElementById('clearBtn');
const saveSessionBtn = document.getElementById('saveSessionBtn');
const historyList = document.getElementById('historyList');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const copyTextBtn = document.getElementById('copyTextBtn');

// New Font Selector
const fontSelect = document.getElementById('fontSelect');

// Read Aloud Settings Elements
const speechRateSlider = document.getElementById('speechRateSlider');
const speechRateValue = document.getElementById('speechRateValue');
const speechPitchSlider = document.getElementById('speechPitchSlider');
const speechPitchValue = document.getElementById('speechPitchValue');
const speechVolumeSlider = document.getElementById('speechVolumeSlider');
const speechVolumeValue = document.getElementById('speechVolumeValue');
const voiceSelect = document.getElementById('voiceSelect');
const highlightWordsCheckbox = document.getElementById('highlightWords');

// View Elements
const viewSelect = document.getElementById('viewSelect');
const readerView = document.getElementById('readerView');
const calendarView = document.getElementById('calendarView');

// Calendar Elements
const addTaskBtn = document.getElementById('addTaskBtn');
const taskModal = document.getElementById('taskModal');
const closeModalBtn = document.querySelector('#taskModal .close');
const taskForm = document.getElementById('taskForm');
const modalTitle = document.getElementById('modalTitle');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskDeadlineInput = document.getElementById('taskDeadline');
const taskList = document.getElementById('taskList');
const searchTasks = document.getElementById('searchTasks');
const filterTasks = document.getElementById('filterTasks');
const calendarGrid = document.getElementById('calendarGrid');

// Chatbot Elements
const chatbotBtn = document.getElementById('chatbotBtn');
const chatbotModal = document.getElementById('chatbotModal');
const chatbotCloseBtn = chatbotModal.querySelector('.close');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const sendChatbotMsgBtn = document.getElementById('sendChatbotMsg');
const chatbotTyping = document.getElementById('chatbotTyping');

let historyData = [];
let tasks = [];
let editingTaskIndex = null;
let voices = [];
let isSpeaking = false;
let currentUtterance = null;

let selectedDate = new Date();

// Reader View Functions

// Update formatted text
function updateOutput() {
    const text = inputText.value;
    outputText.textContent = text;
    updateStats(text);
}

// Update stats
function updateStats(text) {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    wordCountElem.textContent = wordCount;
    readingTimeElem.textContent = readingTime;
}

// Update styles
function updateStyles() {
    outputText.style.fontSize = fontSizeSlider.value + 'px';
    outputText.style.lineHeight = lineHeightSlider.value;
    outputText.style.wordSpacing = wordSpacingSlider.value + 'px';
    outputText.style.fontFamily = fontSelect.value;
    fontSizeValue.textContent = fontSizeSlider.value;
    lineHeightValue.textContent = lineHeightSlider.value;
    wordSpacingValue.textContent = wordSpacingSlider.value;
}

// Copy Text Function
function copyText() {
    const text = outputText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('Text copied to clipboard!');
    }).catch(err => {
        console.error('Error copying text:', err);
    });
}

// Load voices
function loadVoices() {
    voices = speechSynthesis.getVoices();
    voiceSelect.innerHTML = '';
    voices.forEach(voice => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = voice.name;
        voiceSelect.appendChild(option);
    });
}

// Read aloud function
function readAloud() {
    if (isSpeaking) {
        speechSynthesis.cancel();
        isSpeaking = false;
        readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> Read Aloud';
        outputText.innerHTML = outputText.textContent; // Remove highlights
        return;
    }

    const text = outputText.textContent;
    const utterance = new SpeechSynthesisUtterance(text);

    // Set speech settings
    utterance.rate = parseFloat(speechRateSlider.value);
    utterance.pitch = parseFloat(speechPitchSlider.value);
    utterance.volume = parseFloat(speechVolumeSlider.value);

    // Set voice
    const selectedVoice = voices.find(voice => voice.name === voiceSelect.value);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    // Word highlighting
    if (highlightWordsCheckbox.checked) {
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                highlightWord(event.charIndex, event.charIndex + event.charLength);
            }
        };
    }

    utterance.onstart = () => {
        isSpeaking = true;
        readAloudBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
    };

    utterance.onend = () => {
        isSpeaking = false;
        readAloudBtn.innerHTML = '<i class="fas fa-volume-up"></i> Read Aloud';
        outputText.innerHTML = outputText.textContent; // Remove highlights
    };

    speechSynthesis.speak(utterance);
    currentUtterance = utterance;
}

function highlightWord(start, end) {
    const text = outputText.textContent;
    const before = text.substring(0, start);
    const word = text.substring(start, end);
    const after = text.substring(end);
    outputText.innerHTML = `${before}<span class="highlight">${word}</span>${after}`;
}

// Update speech settings display
function updateSpeechSettings() {
    speechRateValue.textContent = speechRateSlider.value;
    speechPitchValue.textContent = speechPitchSlider.value;
    speechVolumeValue.textContent = speechVolumeSlider.value;
}

// Translate function
function translateText() {
    const text = outputText.textContent;
    const apiKey = window.API_KEY; // Access API key from config.js
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    // Prepare request body
    const requestBody = {
        q: text,
        target: targetLanguage.value,
        format: 'text',
    };

    // Include source language if it's set
    if (sourceLanguage.value) {
        requestBody.source = sourceLanguage.value;
    }

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.data) {
            outputText.textContent = data.data.translations[0].translatedText;
            updateStats(outputText.textContent);
        } else {
            console.error('Translation error:', data);
            alert('Translation failed. Please check your API key and quotas.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Theme switcher
function switchTheme() {
    const theme = themeSelect.value;
    document.body.className = ''; // Reset class names
    document.body.classList.add(`${theme}-theme`);
}

// Clear input
function clearInput() {
    inputText.value = '';
    updateOutput();
}

// Save session
function saveSession() {
    const sessionData = {
        text: inputText.value,
        fontSize: fontSizeSlider.value,
        lineHeight: lineHeightSlider.value,
        wordSpacing: wordSpacingSlider.value,
        fontFamily: fontSelect.value,
        theme: themeSelect.value,
        timestamp: new Date().toLocaleString(),
    };

    historyData.push(sessionData);
    localStorage.setItem('historyData', JSON.stringify(historyData));
    renderHistory();
}

// Render history
function renderHistory() {
    historyList.innerHTML = '';
    historyData.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `Session from ${item.timestamp}`;
        li.addEventListener('click', () => loadSession(index));
        historyList.appendChild(li);
    });
}

// Load session
function loadSession(index) {
    const sessionData = historyData[index];
    inputText.value = sessionData.text;
    fontSizeSlider.value = sessionData.fontSize;
    lineHeightSlider.value = sessionData.lineHeight;
    wordSpacingSlider.value = sessionData.wordSpacing;
    fontSelect.value = sessionData.fontFamily;
    themeSelect.value = sessionData.theme;
    switchTheme();
    updateStyles();
    updateOutput();
}

// Load history from localStorage
function loadHistory() {
    const data = localStorage.getItem('historyData');
    if (data) {
        historyData = JSON.parse(data);
        renderHistory();
    }
}

// Handle file upload
function handleFileUpload(file) {
    const reader = new FileReader();
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        // PDF handling
        const fileURL = URL.createObjectURL(file);
        pdfjsLib.getDocument(fileURL).promise.then(pdf => {
            let pagesPromises = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                pagesPromises.push(pdf.getPage(i).then(page => {
                    return page.getTextContent().then(textContent => {
                        return textContent.items.map(item => item.str).join(' ');
                    });
                }));
            }
            Promise.all(pagesPromises).then(pagesText => {
                inputText.value = pagesText.join(' ');
                updateOutput();
            });
        });
    } else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // DOC/DOCX handling
        alert('DOC/DOCX files are not supported in this demo due to browser limitations.');
    } else if (fileType === 'text/plain') {
        // TXT handling
        reader.onload = function(e) {
            inputText.value = e.target.result;
            updateOutput();
        };
        reader.readAsText(file);
    } else {
        alert('Unsupported file type.');
    }
}

// View Switcher
function switchView() {
    const view = viewSelect.value;
    if (view === 'reader') {
        readerView.style.display = 'block';
        calendarView.style.display = 'none';
    } else if (view === 'calendar') {
        readerView.style.display = 'none';
        calendarView.style.display = 'block';
    }
}

// Calendar View Functions

// Generate Calendar
function generateCalendar(date) {
    calendarGrid.innerHTML = '';
    const month = date.getMonth();
    const year = date.getFullYear();

    // First day of the month
    const firstDay = new Date(year, month, 1).getDay();

    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Previous month days
    const prevMonthDays = firstDay;

    // Total grid slots (weeks * 7)
    const totalSlots = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    // Create days
    for (let i = 0; i < totalSlots; i++) {
        const dayElem = document.createElement('div');
        dayElem.classList.add('calendar-day');

        const dayNumber = i - firstDay + 1;

        if (i >= firstDay && dayNumber <= daysInMonth) {
            dayElem.textContent = dayNumber;

            const currentDate = new Date(year, month, dayNumber);

            // Mark today
            const today = new Date();
            if (currentDate.toDateString() === today.toDateString()) {
                dayElem.classList.add('today');
            }

            // Check if tasks exist on this day
            const taskCount = tasks.filter(task => new Date(task.deadline).toDateString() === currentDate.toDateString()).length;
            if (taskCount > 0) {
                const taskCountElem = document.createElement('span');
                taskCountElem.classList.add('task-count');
                taskCountElem.textContent = taskCount;
                dayElem.appendChild(taskCountElem);
            }

            // Add click event
            dayElem.addEventListener('click', () => {
                selectedDate = currentDate;
                renderTasks();
                highlightSelectedDate();
            });

            // Highlight selected date
            if (currentDate.toDateString() === selectedDate.toDateString()) {
                dayElem.classList.add('selected');
            }
        } else {
            // Empty slots
            dayElem.classList.add('empty');
        }

        calendarGrid.appendChild(dayElem);
    }

    // Update calendar header
    updateCalendarHeader();
}

// Update Calendar Header
function updateCalendarHeader() {
    let calendarHeader = document.querySelector('.calendar-header');
    if (!calendarHeader) {
        calendarHeader = document.createElement('div');
        calendarHeader.classList.add('calendar-header');

        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() - 1);
            generateCalendar(selectedDate);
        });

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', () => {
            selectedDate.setMonth(selectedDate.getMonth() + 1);
            generateCalendar(selectedDate);
        });

        const monthYearTitle = document.createElement('h3');
        monthYearTitle.id = 'monthYearTitle';

        calendarHeader.appendChild(prevBtn);
        calendarHeader.appendChild(monthYearTitle);
        calendarHeader.appendChild(nextBtn);

        calendarGrid.parentElement.insertBefore(calendarHeader, calendarGrid);
    }

    const monthYearTitle = document.getElementById('monthYearTitle');
    const options = { month: 'long', year: 'numeric' };
    monthYearTitle.textContent = selectedDate.toLocaleDateString(undefined, options);

    // Weekdays Header
    let weekdaysHeader = document.querySelector('.calendar-weekdays');
    if (!weekdaysHeader) {
        weekdaysHeader = document.createElement('div');
        weekdaysHeader.classList.add('calendar-weekdays');
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const dayElem = document.createElement('div');
            dayElem.textContent = day;
            weekdaysHeader.appendChild(dayElem);
        });
        calendarGrid.parentElement.insertBefore(weekdaysHeader, calendarGrid);
    }
}

// Highlight Selected Date
function highlightSelectedDate() {
    const dayElems = document.querySelectorAll('.calendar-day');
    dayElems.forEach(dayElem => {
        dayElem.classList.remove('selected');
        const dayNumber = parseInt(dayElem.textContent);
        if (!isNaN(dayNumber)) {
            const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayNumber);
            if (date.toDateString() === selectedDate.toDateString()) {
                dayElem.classList.add('selected');
            }
        }
    });
}

// Initialize Calendar
function initializeCalendar() {
    generateCalendar(selectedDate);
    renderTasks();
}

// Task Modal Functions
function openTaskModal(editing = false) {
    taskModal.style.display = 'block';
    if (editing) {
        modalTitle.textContent = 'Edit Task';
        taskTitleInput.value = tasks[editingTaskIndex].title;
        taskDescriptionInput.value = tasks[editingTaskIndex].description;
        taskDeadlineInput.value = tasks[editingTaskIndex].deadline;
    } else {
        modalTitle.textContent = 'Add Task';
        taskForm.reset();
        taskDeadlineInput.value = selectedDate.toISOString().substr(0, 10);
    }
}

function closeTaskModal() {
    taskModal.style.display = 'none';
    editingTaskIndex = null;
}

// Add or Edit Task
function addTask(e) {
    e.preventDefault();
    const title = taskTitleInput.value;
    const description = taskDescriptionInput.value;
    const deadline = taskDeadlineInput.value;

    const task = {
        title,
        description,
        deadline,
    };

    if (editingTaskIndex !== null) {
        tasks[editingTaskIndex] = task;
        editingTaskIndex = null;
    } else {
        tasks.push(task);
    }

    saveTasks();
    generateCalendar(selectedDate);
    renderTasks();
    closeTaskModal();
}

// Render Tasks
function renderTasks() {
    taskList.innerHTML = '';

    let filteredTasks = tasks;

    // Search Filter
    const searchTerm = searchTasks.value.toLowerCase();
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }

    // Deadline Filter
    const filterValue = filterTasks.value;
    const today = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + 7);

    if (filterValue === 'today') {
        filteredTasks = filteredTasks.filter(task => new Date(task.deadline).toDateString() === today.toDateString());
    } else if (filterValue === 'week') {
        filteredTasks = filteredTasks.filter(task => {
            const taskDate = new Date(task.deadline);
            return taskDate >= today && taskDate <= endOfWeek;
        });
    }

    // Filter by selected date
    filteredTasks = filteredTasks.filter(task => new Date(task.deadline).toDateString() === selectedDate.toDateString());

    // Sort Tasks by Deadline
    filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('task-item', 'empty');
        emptyMessage.textContent = 'No tasks for this day.';
        taskList.appendChild(emptyMessage);
    } else {
        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');

            const h3 = document.createElement('h3');
            h3.textContent = task.title;
            taskItem.appendChild(h3);

            const pDesc = document.createElement('p');
            pDesc.textContent = task.description;
            taskItem.appendChild(pDesc);

            const pDeadline = document.createElement('p');
            pDeadline.classList.add('task-deadline');
            pDeadline.textContent = `Deadline: ${task.deadline}`;
            taskItem.appendChild(pDeadline);

            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('task-actions');

            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
            editBtn.addEventListener('click', () => {
                editingTaskIndex = tasks.indexOf(task);
                openTaskModal(true);
            });
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Delete';
            deleteBtn.addEventListener('click', () => deleteTask(tasks.indexOf(task)));
            actionsDiv.appendChild(deleteBtn);

            taskItem.appendChild(actionsDiv);

            taskList.appendChild(taskItem);
        });
    }
}

// Delete Task
function deleteTask(index) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks.splice(index, 1);
        saveTasks();
        generateCalendar(selectedDate);
        renderTasks();
    }
}

// Save Tasks to Local Storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load Tasks from Local Storage
function loadTasks() {
    const data = localStorage.getItem('tasks');
    if (data) {
        tasks = JSON.parse(data);
    }
}

// Chatbot Functions

// Open Chatbot Modal
function openChatbot() {
    chatbotModal.style.display = 'block';
    chatbotInput.focus();
}

// Close Chatbot Modal
function closeChatbot() {
    chatbotModal.style.display = 'none';
}

// Send Message
function sendChatbotMessage() {
    const message = chatbotInput.value.trim();
    if (message === '') return;

    // Add user message to chat
    addChatbotMessage('user', message);

    // Clear input
    chatbotInput.value = '';

    // Show typing indicator
    chatbotTyping.style.display = 'block';

    // Get AI response
    getAIResponse(message);
}

// Add Message to Chat
function addChatbotMessage(sender, text, timestamp = new Date()) {
    const messageElem = document.createElement('div');
    messageElem.classList.add('chatbot-message', sender);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    const messageText = document.createElement('p');
    messageText.classList.add('message-text');
    messageText.textContent = text;

    const messageTime = document.createElement('span');
    messageTime.classList.add('message-time');
    messageTime.textContent = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageContent.appendChild(messageText);
    messageContent.appendChild(messageTime);

    // Message Options
    const messageOptions = document.createElement('div');
    messageOptions.classList.add('message-options');

    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Edit Message';
    editBtn.addEventListener('click', () => editChatbotMessage(messageElem, messageText));

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.title = 'Delete Message';
    deleteBtn.addEventListener('click', () => deleteChatbotMessage(messageElem));

    messageOptions.appendChild(editBtn);
    messageOptions.appendChild(deleteBtn);

    messageContent.appendChild(messageOptions);

    messageElem.appendChild(messageContent);
    chatbotMessages.appendChild(messageElem);

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Edit Message
function editChatbotMessage(messageElem, messageTextElem) {
    const originalText = messageTextElem.textContent;
    const newText = prompt('Edit your message:', originalText);
    if (newText !== null) {
        messageTextElem.textContent = newText.trim();
    }
}

// Delete Message
function deleteChatbotMessage(messageElem) {
    if (confirm('Are you sure you want to delete this message?')) {
        messageElem.remove();
    }
}

// Get AI Response
function getAIResponse(userMessage) {
    const apiKey = window.OPENAI_API_KEY; // Access API key from config.js

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are an AI assistant.' },
                { role: 'user', content: userMessage },
            ],
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        chatbotTyping.style.display = 'none';
        if (data.choices && data.choices.length > 0) {
            const aiMessage = data.choices[0].message.content.trim();
            addChatbotMessage('ai', aiMessage);
        } else {
            addChatbotMessage('ai', 'Sorry, I could not understand that.');
        }
    })
    .catch(error => {
        chatbotTyping.style.display = 'none';
        console.error('Error:', error);
        let errorMessage = 'An error occurred while fetching the response.';
        if (error && error.error && error.error.message) {
            errorMessage = error.error.message;
        }
        addChatbotMessage('ai', errorMessage);
    });
}

// Event Listeners

// Reader View Event Listeners
inputText.addEventListener('input', () => {
    updateOutput();
    updateStyles();
});

fontSizeSlider.addEventListener('input', updateStyles);
lineHeightSlider.addEventListener('input', updateStyles);
wordSpacingSlider.addEventListener('input', updateStyles);
fontSelect.addEventListener('change', updateStyles);

speechRateSlider.addEventListener('input', updateSpeechSettings);
speechPitchSlider.addEventListener('input', updateSpeechSettings);
speechVolumeSlider.addEventListener('input', updateSpeechSettings);

readAloudBtn.addEventListener('click', readAloud);
translateBtn.addEventListener('click', translateText);
themeSelect.addEventListener('change', switchTheme);
clearBtn.addEventListener('click', clearInput);
saveSessionBtn.addEventListener('click', saveSession);
copyTextBtn.addEventListener('click', copyText);

uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    handleFileUpload(file);
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
});

// Calendar View Event Listeners
viewSelect.addEventListener('change', switchView);
addTaskBtn.addEventListener('click', () => openTaskModal());
closeModalBtn.addEventListener('click', closeTaskModal);
window.addEventListener('click', (e) => {
    if (e.target == taskModal) {
        closeTaskModal();
    }
});
taskForm.addEventListener('submit', addTask);
searchTasks.addEventListener('input', renderTasks);
filterTasks.addEventListener('change', renderTasks);

// Voice Loading
speechSynthesis.addEventListener('voiceschanged', loadVoices);

// Chatbot Event Listeners
chatbotBtn.addEventListener('click', openChatbot);
chatbotCloseBtn.addEventListener('click', closeChatbot);
sendChatbotMsgBtn.addEventListener('click', sendChatbotMessage);
chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendChatbotMessage();
    }
});

// Close chatbot when clicking outside
window.addEventListener('click', (e) => {
    if (e.target == chatbotModal) {
        closeChatbot();
    }
});

// Initialize the application
updateStyles();
updateOutput();
switchTheme();
loadHistory();
switchView();
loadTasks();
initializeCalendar();
loadVoices();
updateSpeechSettings();
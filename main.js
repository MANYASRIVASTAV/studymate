/* ===============================
   GLOBAL DATA
=============================== */

// Load saved tasks (array of objects) or empty array
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Study minutes today
let studyMinutes =
    Number(localStorage.getItem("studyMinutes")) || 0;

// Last study date
let lastDate = localStorage.getItem("lastDate") || "";

// Current streak
let streak =
    Number(localStorage.getItem("streak")) || 0;


/* ===============================
   REAL-TIME NEET COUNTDOWN
=============================== */

function updateCountdown() {

    // NEET Exam Date (3rd May 2026, 12:00 AM)
    const neetDate = new Date(2026, 4, 3, 0, 0, 0);
    // Month starts from 0 (Jan = 0, May = 4)

    // Current system date & time
    const now = new Date();

    // Difference in milliseconds
    const diff = neetDate - now;

    // Convert to days (round UP)
    const daysLeft = Math.ceil(
        diff / (1000 * 60 * 60 * 24)
    );

    let el = document.getElementById("countdown");

    if (!el) return;

    // If exam passed
    if (daysLeft <= 0) {

        el.innerText = "NEET DAY IS HERE! 🔥💪";

    } else {

        el.innerText =
            daysLeft + " Days Remaining 🔥";
    }
}


// Update once when page loads
updateCountdown();


// Update every 60 seconds (1 minute)
setInterval(updateCountdown, 60000);


/* ===============================
   QUOTES
=============================== */

const quotes = [

    "Discipline brings freedom 💪",
    "Small steps daily 🔥",
    "NEET warrior 💙",
    "Trust your hard work 🎯",
    "Consistency beats talent 🙏"
];

function loadQuote() {

    let index =
        Math.floor(Math.random() * quotes.length);

    let el = document.getElementById("quoteBox");

    if (el) {
        el.innerText = quotes[index];
    }
}

loadQuote();


/* ===============================
   TASK SYSTEM (NEW VERSION)
=============================== */

// Show tasks
function renderTasks() {

    let list = document.getElementById("taskList");

    if (!list) return;

    list.innerHTML = "";

    tasks.forEach((task, index) => {

        // Create <li>
        let li = document.createElement("li");

        li.className = "task-item";


        /* ---------- Checkbox ---------- */
        let checkbox = document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.checked = task.done;

        checkbox.onclick = function () {
            toggleTask(index);
        };


        /* ---------- Task Text ---------- */
        let span = document.createElement("span");

        span.className = "task-text";

        span.innerText = task.text;

        // If completed, add style
        if (task.done) {
            span.classList.add("task-done");
        }


        /* ---------- Delete Button ---------- */
        let delBtn = document.createElement("button");

        delBtn.innerText = "❌";

        delBtn.className = "task-delete";

        delBtn.onclick = function () {
            deleteTask(index);
        };


        /* ---------- Add to li ---------- */
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);

        list.appendChild(li);
    });

    // Save in browser
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// Add new task
function addTask() {

    let input = document.getElementById("taskInput");

    if (!input) return;

    let text = input.value.trim();

    if (text === "") return;

    // Push object (not string)
    tasks.push({
        text: text,
        done: false
    });

    input.value = "";

    renderTasks();
}


// Delete task
function deleteTask(index) {

    tasks.splice(index, 1);

    renderTasks();
}


// Toggle complete / incomplete
function toggleTask(index) {

    tasks[index].done = !tasks[index].done;

    renderTasks();
}


// Load tasks on page start
renderTasks();


/* ===============================
   POMODORO TIMER
=============================== */

/* ===============================
   CUSTOM POMODORO SYSTEM
=============================== */

// Timer data
let timer = null;

let totalSeconds = 0;

let sessionSeconds = 0;

let isStudy = true; // true = study, false = break


/* ===============================
   START TIMER
=============================== */

function startTimer() {

    clearInterval(timer);


    // Get user input
    let studyMin =
        Number(document.getElementById("studyInput").value);

    let breakMin =
        Number(document.getElementById("breakInput").value);


  if (studyMin <= 0 || breakMin <= 0) {

    alert("Enter valid time!");
    return;
}


// If new session, set time
if (totalSeconds <= 0) {

    if (isStudy) {

        totalSeconds = studyMin * 60;


        // ✅ User started studying
        updateGroupStatus("studying", studyMinutes);


    } else {

        totalSeconds = breakMin * 60;


        // ✅ User started break
        updateGroupStatus("break", studyMinutes);
    }
}


// Start timer
timer = setInterval(runTimer, 1000);

}


/* ===============================
   RUN TIMER
=============================== */

function runTimer() {

    let min = Math.floor(totalSeconds / 60);

    let sec = totalSeconds % 60;


    document.getElementById("timer")
        .innerText =
        min + ":" + (sec < 10 ? "0" + sec : sec);


    // Show mode
    let mode =
        document.getElementById("modeText");

    mode.innerText =
        isStudy ? "Study Mode 📘" : "Break Mode ☕";


    // Count only study time
    if (isStudy) {

        sessionSeconds++;
    }


    totalSeconds--;


    // Session finished
    if (totalSeconds < 0) {

        clearInterval(timer);


        // Save studied minutes
        if (isStudy) {

            let minutes =
                Math.floor(sessionSeconds / 60);

            if (minutes > 0) {

                addStudyTime(minutes);
            }

            sessionSeconds = 0;
        }


        // Switch mode
        isStudy = !isStudy;

        totalSeconds = 0;


        alert(
            isStudy
                ? "Back to Study 💪"
                : "Take a Break ☕"
        );


        startTimer();
    }
}


/* ===============================
   STOP TIMER
=============================== */

function stopTimer() {

    clearInterval(timer);

                   updateGroupStatus("offline", studyMinutes);
    // Save partial study
    if (isStudy) {

        let minutes =
            Math.floor(sessionSeconds / 60);

        if (minutes > 0) {

            addStudyTime(minutes);
        }
    }


    sessionSeconds = 0;

    totalSeconds = 0;

    isStudy = true;


    document.getElementById("timer")
        .innerText = "00:00";

    document.getElementById("modeText")
        .innerText = "Stopped ⏹️";
}



/* ===============================
   STUDY TIME + STREAK
=============================== */

function addStudyTime(minutes) {

    const today =
        new Date().toDateString();

    // New day detected
    if (lastDate !== today) {

        if (lastDate !== "") {
            streak++;
        }

        studyMinutes = 0;

        lastDate = today;
    }

    studyMinutes += minutes;

    // Save
    localStorage.setItem(
        "studyMinutes",
        studyMinutes
    );

    localStorage.setItem(
        "lastDate",
        lastDate
    );

    localStorage.setItem(
        "streak",
        streak
    );

    updateProgress();
}


// Update progress UI
function updateProgress() {

    let timeEl = document.getElementById("studyTime");

    let streakEl = document.getElementById("streak");

    if (timeEl) {

        timeEl.innerText =
            "Today: " + studyMinutes + " min";
    }

    if (streakEl) {

        streakEl.innerText =
            "Streak: 🔥 " + streak + " Days";
    }
}

updateProgress();



/* ===============================
   NOTES SYSTEM
=============================== */

// Load notes or empty array
let notes = JSON.parse(localStorage.getItem("notes")) || [];


// Show notes
function renderNotes() {

    let box = document.getElementById("notesList");

    if (!box) return;

    box.innerHTML = "";

    notes.forEach((note, index) => {

        let div = document.createElement("div");

        div.className = "box";


        // Subject
        let h4 = document.createElement("h4");

        h4.innerText = note.subject;


        // Date
        let small = document.createElement("small");

        small.innerText = note.date;


        // Content
        let p = document.createElement("p");

        p.innerText = note.content;


        // Edit Button
        let editBtn = document.createElement("button");

        editBtn.innerText = "Edit ✏️";

        editBtn.onclick = function () {
            editNote(index);
        };


        // Delete Button
        let delBtn = document.createElement("button");

        delBtn.innerText = "Delete ❌";

        delBtn.className = "task-delete";

        delBtn.onclick = function () {
            deleteNote(index);
        };


        div.appendChild(h4);
        div.appendChild(small);
        div.appendChild(p);
        div.appendChild(editBtn);
        div.appendChild(delBtn);

        box.appendChild(div);
    });


    // Save notes
    localStorage.setItem("notes", JSON.stringify(notes));
}


// Add new note
function addNote() {

    let subject =
        document.getElementById("noteSubject").value.trim();

    let content =
        document.getElementById("noteContent").value.trim();

    if (subject === "" || content === "") {

        alert("Please fill all fields!");
        return;
    }

    // Current date
    let today = new Date().toDateString();

    notes.push({

        subject: subject,
        content: content,
        date: today

    });

    // Clear inputs
    document.getElementById("noteSubject").value = "";
    document.getElementById("noteContent").value = "";

    renderNotes();
}


// Delete note
function deleteNote(index) {

    notes.splice(index, 1);

    renderNotes();
}


// Edit note
function editNote(index) {

    let note = notes[index];

    document.getElementById("noteSubject").value =
        note.subject;

    document.getElementById("noteContent").value =
        note.content;

    // Remove old note
    deleteNote(index);
}


// Load notes on start
renderNotes();



/* ===============================
   PLANNER SYSTEM
=============================== */

// Load plans or empty array
let plans = JSON.parse(localStorage.getItem("plans")) || [];


// Show plans
function renderPlans() {

    let list = document.getElementById("planList");

    if (!list) return;

    list.innerHTML = "";

    plans.forEach((plan, index) => {

        let li = document.createElement("li");

        li.className = "task-item";


        // Subject
        let spanSub = document.createElement("span");

        spanSub.className = "task-text";

        spanSub.innerText =
            plan.subject + " → " + plan.time;


        // Delete Button
        let delBtn = document.createElement("button");

        delBtn.innerText = "❌";

        delBtn.className = "task-delete";

        delBtn.onclick = function () {
            deletePlan(index);
        };


        li.appendChild(spanSub);
        li.appendChild(delBtn);

        list.appendChild(li);

    });


    // Save plans
    localStorage.setItem(
        "plans",
        JSON.stringify(plans)
    );
}


// Add new plan
function addPlan() {

    let subject =
        document.getElementById("planSubject").value.trim();

    let time =
        document.getElementById("planTime").value.trim();


    if (subject === "" || time === "") {

        alert("Please fill all fields!");
        return;
    }


    // Store as object
    plans.push({

        subject: subject,
        time: time

    });


    // Clear inputs
    document.getElementById("planSubject").value = "";
    document.getElementById("planTime").value = "";


    renderPlans();
}


// Delete plan
function deletePlan(index) {

    plans.splice(index, 1);

    renderPlans();
}


// Load plans on start
renderPlans();



/* ===============================
   EXAM SYSTEM (MCQ TEST)
=============================== */

// MCQ Questions (You can add more later)
const examQuestions = [

    {
        q: "Which gas is needed for respiration?",
        options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        ans: 0
    },

    {
        q: "Human heart has how many chambers?",
        options: ["2", "3", "4", "5"],
        ans: 2
    },

    {
        q: "Unit of force is?",
        options: ["Joule", "Newton", "Watt", "Volt"],
        ans: 1
    },

    {
        q: "pH of pure water is?",
        options: ["5", "6", "7", "8"],
        ans: 2
    },

    {
        q: "DNA full form?",
        options: [
            "Deoxyribonucleic Acid",
            "Dynamic Acid",
            "Nitro Acid",
            "None"
        ],
        ans: 0
    },

    {
        q: "Speed = ?",
        options: ["D/T", "T/D", "D×T", "D+T"],
        ans: 0
    },

    {
        q: "Largest organ in human body?",
        options: ["Heart", "Brain", "Skin", "Liver"],
        ans: 2
    },

    {
        q: "SI unit of current?",
        options: ["Volt", "Ampere", "Ohm", "Watt"],
        ans: 1
    },

    {
        q: "Plant food is?",
        options: ["Protein", "Glucose", "Vitamin", "Fat"],
        ans: 1
    },

    {
        q: "Blood is filtered by?",
        options: ["Heart", "Lungs", "Kidney", "Liver"],
        ans: 2
    }

];


// Exam variables
let currentQ = 0;
let score = 0;
let selected = null;
let examTime = 10 * 60; // 10 min
let examTimer;


/* ===============================
   START EXAM
=============================== */

function startExam() {

    document.getElementById("startBox").style.display = "none";

    document.getElementById("quizBox").style.display = "block";

    currentQ = 0;
    score = 0;

    showQuestion();

    startExamTimer();
}


/* ===============================
   SHOW QUESTION
=============================== */

function showQuestion() {

    let q = examQuestions[currentQ];

    document.getElementById("question")
        .innerText =
        (currentQ + 1) + ". " + q.q;


    let optionsBox =
        document.getElementById("options");

    optionsBox.innerHTML = "";

    selected = null;


    q.options.forEach((opt, index) => {

        let btn = document.createElement("button");

        btn.innerText = opt;

        btn.style.display = "block";

        btn.style.width = "100%";

        btn.onclick = function () {
            selectOption(index, btn);
        };

        optionsBox.appendChild(btn);

    });
}


/* ===============================
   SELECT OPTION
=============================== */

function selectOption(index, btn) {

    selected = index;

    // Remove old highlight
    let allBtns =
        document.querySelectorAll("#options button");

    allBtns.forEach(b => b.style.background = "");

    // Highlight selected
    btn.style.background =
        "linear-gradient(to right,#00c6ff,#0072ff)";
}


/* ===============================
   NEXT QUESTION
=============================== */

function nextQuestion() {

    if (selected === null) {

        alert("Select an option first!");
        return;
    }

    if (selected === examQuestions[currentQ].ans) {

        score++;
    }

    currentQ++;

    if (currentQ < examQuestions.length) {

        showQuestion();

    } else {

        finishExam();
    }
}


/* ===============================
   FINISH EXAM
=============================== */

function finishExam() {

    clearInterval(examTimer);

    document.getElementById("quizBox").style.display = "none";

    document.getElementById("resultBox").style.display = "block";


    let text =
        "You scored " +
        score + " / " +
        examQuestions.length;

    document.getElementById("scoreText")
        .innerText = text;


    saveBestScore();
}


/* ===============================
   TIMER
=============================== */

function startExamTimer() {

    examTimer = setInterval(function () {

        let min =
            Math.floor(examTime / 60);

        let sec = examTime % 60;

        document.getElementById("timerBox")
            .innerText =
            "Time: " +
            min + ":" +
            (sec < 10 ? "0" + sec : sec);

        examTime--;

        if (examTime < 0) {

            finishExam();
        }

    }, 1000);
}


/* ===============================
   BEST SCORE
=============================== */

function saveBestScore() {

    let best =
        Number(localStorage.getItem("bestScore")) || 0;

    if (score > best) {

        localStorage.setItem("bestScore", score);

        best = score;
    }

    document.getElementById("bestScore")
        .innerText =
        "Best Score: " +
        best + " / " +
        examQuestions.length;
}


// Show best score on load
window.onload = function () {

    let best =
        Number(localStorage.getItem("bestScore")) || 0;

    let el = document.getElementById("bestScore");

    if (el) {

        el.innerText =
            "Best Score: " +
            best + " / " +
            examQuestions.length;
    }
};



/* ===============================
   MOCK TEST SYSTEM
=============================== */

// Load mock results
let mocks = JSON.parse(localStorage.getItem("mocks")) || [];


// Show mocks
function renderMocks() {

    let box = document.getElementById("mockList");

    if (!box) return;

    box.innerHTML = "";

    mocks.forEach((mock, index) => {

        let div = document.createElement("div");

        div.className = "box";

        div.innerHTML = `

            <b>Date:</b> ${mock.date}<br>

            Biology: ${mock.bio}/360<br>
            Physics: ${mock.phy}/180<br>
            Chemistry: ${mock.chem}/180<br>

            <b>Total: ${mock.total}/720</b>

        `;

        box.appendChild(div);
    });

    localStorage.setItem("mocks", JSON.stringify(mocks));

    updateMotivation();
}


// Add mock
function addMock() {

    let date =
        document.getElementById("mockDate").value;

    let bio =
        Number(document.getElementById("bioMarks").value);

    let phy =
        Number(document.getElementById("phyMarks").value);

    let chem =
        Number(document.getElementById("chemMarks").value);


    if (!date || isNaN(bio) || isNaN(phy) || isNaN(chem)) {

        alert("Fill all fields correctly!");
        return;
    }


    let total = bio + phy + chem;


    mocks.push({

        date: date,
        bio: bio,
        phy: phy,
        chem: chem,
        total: total

    });


    // Clear form
    document.getElementById("mockDate").value = "";
    document.getElementById("bioMarks").value = "";
    document.getElementById("phyMarks").value = "";
    document.getElementById("chemMarks").value = "";


    renderMocks();
}


// Motivation logic
function updateMotivation() {

    let box = document.getElementById("motivationBox");

    if (!box || mocks.length === 0) return;


    let last = mocks[mocks.length - 1];

    let msg = "";


    if (last.total < 400) {

        msg = "Low score 😔 Don’t give up. Revise weak topics 💪";

    } else if (last.total < 550) {

        msg = "Good 👍 Now push harder 🔥";

    } else if (last.total < 650) {

        msg = "Very good 😍 Almost there!";

    } else {

        msg = "Excellent 🏆 NEET Ready 🔥🔥";
    }


    box.innerText = msg;
}


renderMocks();

/* ===============================
   SYLLABUS SETUP + TRACKER
=============================== */

// Load syllabus from storage
let syllabus =
    JSON.parse(localStorage.getItem("syllabus")) || [];


// Show syllabus
function renderSyllabus() {

    let list =
        document.getElementById("syllabusList");

    if (!list) return;

    list.innerHTML = "";


    syllabus.forEach((item, index) => {

        let li = document.createElement("li");

        li.className = "task-item";


        // Checkbox
        let cb = document.createElement("input");

        cb.type = "checkbox";

        cb.checked = item.done;

        cb.onclick = function () {
            toggleTopic(index);
        };


        // Text
        let span = document.createElement("span");

        span.className = "task-text";

        span.innerText =
            item.subject + " - " + item.topic;

        if (item.done) {
            span.classList.add("task-done");
        }


        // Delete button
        let del = document.createElement("button");

        del.innerText = "❌";

        del.className = "task-delete";

        del.onclick = function () {
            deleteTopic(index);
        };


        li.appendChild(cb);
        li.appendChild(span);
        li.appendChild(del);

        list.appendChild(li);

    });


    // Save
    localStorage.setItem(
        "syllabus",
        JSON.stringify(syllabus)
    );
}


// Setup syllabus (first time entry)
function setupSyllabus() {

    let subject =
        document.getElementById("syllabusSubject").value.trim();

    let topicsText =
        document.getElementById("syllabusTopics").value.trim();


    if (subject === "" || topicsText === "") {

        alert("Please enter subject and topics!");
        return;
    }


    // Split topics by comma
    let topics = topicsText.split(",");


    topics.forEach(t => {

        syllabus.push({

            subject: subject,

            topic: t.trim(),

            done: false

        });
    });


    // Clear inputs
    document.getElementById("syllabusSubject").value = "";
    document.getElementById("syllabusTopics").value = "";


    renderSyllabus();
}


// Mark topic done / undone
function toggleTopic(index) {

    syllabus[index].done =
        !syllabus[index].done;

    renderSyllabus();
}


// Delete topic
function deleteTopic(index) {

    syllabus.splice(index, 1);

    renderSyllabus();
}


// Load on start
renderSyllabus();



/* ===============================
   PROFILE SYSTEM
=============================== */

// Load profile from storage
let profile =
    JSON.parse(localStorage.getItem("profile")) || {};


// Save profile
function saveProfile() {

    let name =
        document.getElementById("profileName").value.trim();

    let goal =
        document.getElementById("profileGoal").value.trim();

    let target =
        document.getElementById("profileTarget").value.trim();

    let quote =
        document.getElementById("profileQuote").value.trim();


    if (name === "" || goal === "" || target === "") {

        alert("Please fill all required fields!");
        return;
    }


    // Store in object
    profile = {

        name: name,
        goal: goal,
        target: target,
        quote: quote

    };


    // Save in browser
    localStorage.setItem(
        "profile",
        JSON.stringify(profile)
    );


    showProfile();

    alert("Profile Saved ✅");
}


// Show profile on screen
function showProfile() {

    if (!profile.name) return;


    document.getElementById("viewName")
        .innerText = profile.name;

    document.getElementById("viewGoal")
        .innerText = profile.goal;

    document.getElementById("viewTarget")
        .innerText = profile.target;

    document.getElementById("viewQuote")
        .innerText =
        profile.quote || "Stay focused 💪";


    // Fill inputs also (for editing)
    document.getElementById("profileName").value =
        profile.name;

    document.getElementById("profileGoal").value =
        profile.goal;

    document.getElementById("profileTarget").value =
        profile.target;

    document.getElementById("profileQuote").value =
        profile.quote;
}


// Load profile on page open
window.addEventListener("load", showProfile);



/* ===============================
   DARK MODE SYSTEM
=============================== */

// Load saved mode
let darkMode =
    localStorage.getItem("darkMode") === "on";


// Apply on load
if (darkMode) {

    document.body.classList.add("dark-mode");
}


// Toggle mode
function toggleDarkMode() {

    document.body.classList.toggle("dark-mode");


    // Check current mode
    if (document.body.classList.contains("dark-mode")) {

        localStorage.setItem("darkMode", "on");

    } else {

        localStorage.setItem("darkMode", "off");
    }
}



/* ===============================
   FOCUS MODE SYSTEM
=============================== */

let focusInterval;
let focusTime = 25 * 60;
let totalFocusTime = 25 * 60;
let isPaused = false;


/* Open fullscreen */
function openFocusMode() {

    document
        .getElementById("focusOverlay")
        .classList.add("active");

    focusTime = time; // Sync with main timer
    totalFocusTime = time;

    startFocusTimer();
}


/* Close fullscreen */
function closeFocusMode() {

    document
        .getElementById("focusOverlay")
        .classList.remove("active");

    clearInterval(focusInterval);
}


/* Start focus timer */
function startFocusTimer() {

    clearInterval(focusInterval);

    focusInterval = setInterval(() => {

        if (isPaused) return;


        let min = Math.floor(focusTime / 60);
        let sec = focusTime % 60;


        document.getElementById("focusTimer")
            .innerText =
            min + ":" + (sec < 10 ? "0" + sec : sec);


        updateFocusRing();


        focusTime--;


      if (focusTime < 0) {

    clearInterval(focusInterval);


    // ✅ Update group: user finished studying
    updateGroupStatus("studying", studyMinutes);


    alert("Focus Session Complete 💙🔥");


    closeFocusMode();
}


    }, 1000);
}


/* Pause */
function pauseFocus() {

    isPaused = !isPaused;
}


/* ===============================
   PROGRESS RING
=============================== */

function updateFocusRing() {

    let ring =
        document.querySelector(".focus-ring::before");

    let percent =
        (focusTime / totalFocusTime) * 100;

    document
        .querySelector(".focus-ring")
        .style.setProperty(
            "--progress",
            percent
        );
}



/* ===============================
   YEAR / SEMESTER PROGRESS
=============================== */

function updateYearProgress() {

    let bar = document.getElementById("yearProgress");

    if (!bar) return;


    let start = new Date(2025, 3, 1);   // April 1, 2025
    let end   = new Date(2026, 4, 3);   // NEET 2026


    let now = new Date();


    let total = end - start;

    let passed = now - start;


    let percent =
        Math.min(
            100,
            Math.max(0, (passed / total) * 100)
        );


    bar.style.width = percent + "%";
}

updateYearProgress();


/* ===============================
   PROFILE IMAGE SYSTEM (FIXED)
=============================== */

window.addEventListener("load", function () {

    let pic = document.getElementById("profilePic");

    let input = document.getElementById("imageInput");


    // Safety check
    if (!pic || !input) return;


    /* When circle clicked → open file */
    pic.addEventListener("click", function () {

        input.click();
    });


    /* When file selected */
    input.addEventListener("change", function (event) {

        let file = event.target.files[0];

        if (!file) return;


        let reader = new FileReader();


        reader.onload = function () {

            let base64 = reader.result;


            // Save
            localStorage.setItem(
                "profileImage",
                base64
            );


            showProfileImage(base64);
        };


        reader.readAsDataURL(file);
    });


    // Load saved image
    let saved =
        localStorage.getItem("profileImage");

    if (saved) {

        showProfileImage(saved);
    }
});


/* Show image */
function showProfileImage(src) {

    let img =
        document.getElementById("profileImage");

    let pic =
        document.getElementById("profilePic");

    let icon =
        document.getElementById("cameraIcon");


    if (!img || !pic) return;


    img.src = src;

    img.style.display = "block";


    if (icon) icon.style.display = "none";
}



/* ===============================
   FULLSCREEN FOCUS MODE
=============================== */

let focusPaused = false;


/* Open Focus */
function openFocusMode() {

    // Request browser fullscreen
    if (document.documentElement.requestFullscreen) {

        document.documentElement.requestFullscreen();
    }


    document
        .getElementById("focusOverlay")
        .classList.add("active");


    syncFocusUI();
}


/* Close Focus */
function closeFocusMode() {

    document
        .getElementById("focusOverlay")
        .classList.remove("active");


    // Exit fullscreen
    if (document.fullscreenElement) {

        document.exitFullscreen();
    }
}


/* Pause / Resume */
function pauseFocus() {

    focusPaused = !focusPaused;
}


/* Sync big timer with main timer */
function syncFocusUI() {

    let interval = setInterval(() => {

        let overlay =
            document.getElementById("focusOverlay");

        if (!overlay.classList.contains("active")) {

            clearInterval(interval);

            return;
        }


        if (focusPaused) return;


        // Copy main timer text
        let mainTimer =
            document.getElementById("timer").innerText;

        let mainMode =
            document.getElementById("modeText").innerText;


        document.getElementById("focusTimer")
            .innerText = mainTimer;

        document.getElementById("focusModeText")
            .innerText = mainMode;

    }, 300);
}



/* ===============================
   LOGIN SYSTEM (FRONTEND ONLY)
=============================== */

function loginUser(e) {

    e.preventDefault(); // stop reload


    // Get input values
    let email =
        document.getElementById("loginEmail").value.trim();

    let pass =
        document.getElementById("loginPassword").value.trim();


    // Check empty
    if (email === "" || pass === "") {

        alert("Fill all fields ❗");
        return;
    }


    // Get saved account
    let savedUser =
        JSON.parse(localStorage.getItem("savedUser"));


    /* ===============================
       FIRST TIME LOGIN
    =============================== */

    if (!savedUser) {

        let user = {

            email: email,

            password: pass
        };


        // Save account
        localStorage.setItem(
            "savedUser",
            JSON.stringify(user)
        );


        // Mark logged in
        localStorage.setItem("loggedIn", "yes");


        alert("Account Created Successfully ✅");


        // Go dashboard
        window.location = "dashboard.html";

        return;
    }


    /* ===============================
       NEXT LOGIN
    =============================== */

    if (
        savedUser.email === email &&
        savedUser.password === pass
    ) {

        localStorage.setItem("loggedIn", "yes");

        window.location = "dashboard.html";

    } else {

        alert("❌ Wrong Email or Password!");
    }
}



/* ===============================
   RESET ACCOUNT
=============================== */

function resetAccount() {

    // Clear all browser data
    localStorage.clear();


    alert("Login Reset ✅ Create New Account");


    // Reload page
    location.reload();
}

/* ===============================
   GROUP STUDY LOGIC + TOAST
=============================== */


/* Toast Notification */
function showToast(msg) {

    let toast = document.createElement("div");

    toast.className = "toast";

    toast.innerText = msg;

    document.body.appendChild(toast);


    // Show
    setTimeout(() => {
        toast.classList.add("show");
    }, 100);


    // Hide
    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 400);

    }, 3000);
}










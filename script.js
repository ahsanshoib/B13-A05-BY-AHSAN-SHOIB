const API_URL = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
let allIssues = [];

     document.addEventListener("DOMContentLoaded", function() {
     showPage("login");

    let loginBtn = document.getElementById("login-btn");

    if (loginBtn) {
        loginBtn.onclick = function() {
        let username = document.getElementById("username").value.trim();
        let password = document.getElementById("password").value.trim();

    if (username === "admin" && password === "admin123") {
        showPage("dashboard");
        fetchIssues();
        setupFeatures();} 
    else {
                alert("Invalid Login Credentials!");}
        };}});

function showPage(pageId) {

         let loginPage = document.getElementById("login-page");
         let dashboardPage = document.getElementById("dashboard-page");

    if (!loginPage || !dashboardPage) return;

    if (pageId === "login") {
        loginPage.classList.remove("hidden");
        dashboardPage.classList.add("hidden");
    } else {
        loginPage.classList.add("hidden");
        dashboardPage.classList.remove("hidden");
    }}

function fetchIssues() {
         let loader = document.getElementById("loader");
         if (loader) loader.style.display = "block";

    fetch(API_URL)
        .then(function(response) {
         return response.json(); })


        .then(function(result) {
         allIssues = result.data || [];
         renderIssues(allIssues); })

    .catch(function(error) {
         console.log("Fetch Error:", error);
        alert("Failed to load issues");})
        .finally(function() {

    if (loader) loader.style.display = "none";});}

function renderIssues(issues) {

       let container = document.getElementById("issues-container");
       let count = document.getElementById("issue-count");
       if (!container) return
       if (count) count.innerText = issues.length;

    container.innerHTML = "";

    for (
        
        let i = 0; i < issues.length; i++) {
        let issue = issues[i];
        let card = document.createElement("div");

        let borderClass = "";
        if (issue.status === "open") {
        borderClass = "border-t-[6px] border-t-[#10B981]";
        } else {
        borderClass = "border-t-[6px] border-t-[#A855F7]";
        }

        card.className = "bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all " + borderClass + " flex flex-col h-full";

        let imgSrc = "./assets/Closed-Status.png";
        if (issue.status === "open") {
        imgSrc = "./assets/Open-Status.png";
        }

        card.innerHTML = ""
        + "<div class='flex justify-between items-start mb-4'>"
        + "<img src='" + imgSrc + "' class='w-5 h-5'>"
        + "<span class='px-3 py-1 rounded-full text-[10px] font-bold " + getPriorityStyle(issue.priority) + "'>" + issue.priority.toUpperCase() + "</span>"
        + "</div>"
        + "<h3 class='font-bold text-base mb-2 text-[#111827] line-clamp-2'>" + issue.title + "</h3>"
        + "<p class='text-xs text-gray-400 line-clamp-2 mb-4'>" + (issue.description || "No description") + "</p>"
        + "<div class='flex flex-wrap gap-2 mb-6'>" + renderLabels(issue.labels) + "</div>"
        + "<div class='mt-auto pt-4 border-t border-gray-50 flex flex-col gap-1 text-[11px] text-gray-400 font-medium'>"
        + "<span>#" + issue.id + " by " + issue.author + "</span>"
        + "<span>" + new Date(issue.createdAt).toLocaleDateString() + "</span>"
        + "</div>";

        card.onclick = (function(issueCopy) {
            return function() { openModal(issueCopy); };
        })(issue);

        container.appendChild(card);}}

function setupFeatures() {

        let searchInput = document.getElementById("search-input");
        if (searchInput) {
        searchInput.oninput = function(e) {
        let term = e.target.value.toLowerCase().trim();
        let filtered = [];
        for (let i = 0; i < allIssues.length; i++) {
        let issue = allIssues[i];
        if (issue.title.toLowerCase().indexOf(term) !== -1 || issue.id.toString().indexOf(term) !== -1)
            {
                    filtered.push(issue);
                }}
            renderIssues(filtered);
        };}

let tabButtons = document.querySelectorAll(".tab-btn");

        for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].onclick = function() {
        for (let j = 0; j < tabButtons.length; j++) {
        tabButtons[j].classList.remove("active-tab", "bg-[#5C2DFF]", "text-white");}

        this.classList.add("active-tab");

        let filter = this.dataset.tab;
        let filtered = [];
        if (filter === "all") {
        filtered = allIssues;
        } else {
        for (let k = 0; k < allIssues.length; k++) {
        if (allIssues[k].status === filter) filtered.push(allIssues[k]);
            }
        }
 
        renderIssues(filtered);};}

        let closeBtn = document.getElementById("close-modal");

        if (closeBtn) {
        closeBtn.onclick = function() {
        document.getElementById("modal").classList.add("hidden");
        };}}

function openModal(issue) {

    document.getElementById("modal-title").innerText = issue.title;
    document.getElementById("modal-desc").innerText = issue.description || "";
    document.getElementById("modal-author").innerText = issue.author;
    document.getElementById("modal-date").innerText = new Date(issue.createdAt).toLocaleDateString();
    document.getElementById("modal-assignee").innerText = issue.assignee || "Not Assigned";

    let badge = document.getElementById("modal-status-badge");
    badge.innerText = issue.status === "open" ? "Opened" : "Closed";
    badge.style.backgroundColor = issue.status === "open" ? "#10B981" : "#A855F7";

    let pBadge = document.getElementById("modal-priority-badge");
    pBadge.innerText = issue.priority;
    pBadge.className = "px-6 py-2 rounded-lg text-sm font-black uppercase " + getPriorityStyle(issue.priority);

    document.getElementById("modal-labels").innerHTML = renderLabels(issue.labels);
    document.getElementById("modal").classList.remove("hidden");
}

function getPriorityStyle(priority) {

    if (!priority) return "bg-gray-100 text-gray-600";
    let p = priority.toLowerCase();
    if (p === "high") return "bg-[#FEE2E2] text-[#EF4444]";
    if (p === "medium") return "bg-[#FEF3C7] text-[#F59E0B]";
    return "bg-[#F3F4F6] text-[#6B7280]";
}

function renderLabels(labels) {

    if (!labels) return "";
    let html = "";
    for (let i = 0; i < labels.length; i++) {
    let label = labels[i];
    let color = "bg-gray-100 text-gray-600";
    let l = label.toLowerCase();
    if (l.indexOf("bug") !== -1) color = "bg-[#FEE2E2] text-[#EF4444]";
    else if (l.indexOf("help") !== -1) color = "bg-[#FEF3C7] text-[#D97706]";
    else if (l.indexOf("enhancement") !== -1) color = "bg-[#DCFCE7] text-[#059669]";

    html += "<span class='px-3 py-1 rounded-full text-[10px] font-bold border border-opacity-50 " + color + "'>" + label.toUpperCase() + "</span>";
    }
    return html;
}
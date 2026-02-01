/* ===================== USERS ===================== */
const USERS = {
    angular: { password: "angular", role: "user" },
    admin: { password: "#Ali10037", role: "admin" }
};

/* ===================== AUTH ===================== */
function login() {
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value.trim();
    const errorEl = document.getElementById("error");

    if (USERS[u] && USERS[u].password === p) {
        localStorage.setItem("role", USERS[u].role);
        window.location.href = "dashboard.html";
    } else {
        errorEl.textContent = "Invalid username or password";
    }
}

function logout() {
    localStorage.removeItem("role");
    window.location.href = "index.html";
}

/* ===================== ROUTE GUARD ===================== */
const role = localStorage.getItem("role");
if (window.location.pathname.includes("dashboard") && !role) {
    window.location.href = "index.html";
}

/* ===================== DATA STORAGE ===================== */
let texts = [];

/* ===================== FETCH TEXTS FROM SERVER ===================== */
async function fetchTexts() {
    try {
        const res = await fetch("/.netlify/functions/getTexts");
        if (!res.ok) throw new Error("Failed to fetch texts");
        texts = await res.json();
        render();
    } catch (err) {
        console.error(err);
        alert("Could not load texts from server");
    }
}

/* ===================== ADD TEXT ===================== */
async function addText() {
    if (role !== "user") return;

    const titleInput = document.getElementById("title");
    const bodyInput = document.getElementById("body");

    const newTitle = titleInput.value.trim();
    const newBody = bodyInput.value.trim();

    if (!newTitle || !newBody) {
        alert("Title and body cannot be empty");
        return;
    }

    try {
        const res = await fetch("/.netlify/functions/addText", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, body: newBody })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data);
            return;
        }

        texts = data.texts; // update local array
        render();

        titleInput.value = "";
        bodyInput.value = "";

        if (addSection && showAddBtn) {
            addSection.style.display = "none";
            showAddBtn.textContent = "➕ Add Code";
        }
    } catch (err) {
        console.error(err);
        alert("Failed to add text");
    }
}

/* ===================== RENDER DASHBOARD ===================== */
function render() {
    const list = document.getElementById("list");
    if (!list) return;
    list.innerHTML = "";

    const addSection = document.getElementById("addSection");
    if (addSection) addSection.style.display = "none"; // hide by default

    texts.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "text-item";

        const heading = document.createElement("h4");
        heading.textContent = item.title;
        heading.onclick = () => {
            if (item.body && item.body.trim() !== "") openModal(item.body);
            else alert("No content to display!");
        };
        div.appendChild(heading);

        if (role === "admin") {
            const delBtn = document.createElement("button");
            delBtn.textContent = "Delete";
            delBtn.style.backgroundColor = "#ff4d4d";
            delBtn.style.color = "#fff";
            delBtn.style.border = "none";
            delBtn.style.padding = "10px 20px";
            delBtn.style.fontSize = "16px";
            delBtn.style.fontWeight = "bold";
            delBtn.style.borderRadius = "8px";
            delBtn.style.cursor = "pointer";
            delBtn.style.marginLeft = "15px";
            delBtn.onmouseover = () => {
                delBtn.style.backgroundColor = "#ff1a1a";
                delBtn.style.transform = "scale(1.1)";
            };
            delBtn.onmouseout = () => {
                delBtn.style.backgroundColor = "#ff4d4d";
                delBtn.style.transform = "scale(1)";
            };
            delBtn.onclick = async () => {
                if (!confirm("Are you sure you want to delete this item?")) return;

                try {
                    texts.splice(index, 1);
                    // Save updated texts
                    await fetch("/.netlify/functions/addText", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: "_delete_temp_", body: "_delete_temp_" }) // dummy POST to trigger save
                    });
                    render();
                } catch (err) {
                    console.error(err);
                    alert("Failed to delete text");
                }
            };
            div.appendChild(delBtn);
        }

        list.appendChild(div);
    });
}

/* ===================== MODAL ===================== */
function openModal(text) {
    const modal = document.getElementById("modal");
    const modalText = document.getElementById("modalText");

    modalText.textContent = text;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModal(e) {
    const modal = document.getElementById("modal");
    if (!modal) return;

    if (!e || e.target.id === "modal" || e.target.className === "close") {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

function copyText() {
    const text = document.getElementById("modalText").textContent;
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
}

/* ===================== SHOW/HIDE ADD SECTION ===================== */
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard")) fetchTexts();

    const showAddBtn = document.getElementById("showAddBtn");
    const addSection = document.getElementById("addSection");

    if (role === "user") {
        showAddBtn.style.display = "block";
        addSection.style.display = "none";
        let isOpen = false;

        showAddBtn.addEventListener("click", () => {
            isOpen = !isOpen;
            addSection.style.display = isOpen ? "block" : "none";
            showAddBtn.textContent = isOpen ? "✖ Close" : "➕ Add Code";
        });
    } else {
        showAddBtn.style.display = "none";
    }
});

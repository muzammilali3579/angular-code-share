/* ===================== USERS (FRONTEND ONLY DEMO) ===================== */
const USERS = {
    user: { password: "user", role: "user" },
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

/* ===================== FETCH TEXTS ===================== */
async function fetchTexts() {
    try {
        const res = await fetch("/api/texts");
        if (!res.ok) throw new Error("Failed to fetch texts");
        texts = await res.json();
        render();
    } catch (err) {
        console.error(err);
        alert("Could not load texts");
    }
}

/* ===================== ADD TEXT ===================== */
async function addText() {
    if (role !== "user") return;

    const titleInput = document.getElementById("title");
    const bodyInput = document.getElementById("body");

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
        alert("Title and body cannot be empty");
        return;
    }

    try {
        const res = await fetch("/api/texts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, body })
        });

        if (!res.ok) throw new Error("Failed to add");

        const added = await res.json();
        texts.push(added);
        render();

        titleInput.value = "";
        bodyInput.value = "";
    } catch (err) {
        console.error(err);
        alert("Failed to add text");
    }
}

/* ===================== DELETE TEXT (ADMIN) ===================== */
async function deleteText(id) {
    if (role !== "admin") return;

    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
        const res = await fetch(`/api/texts?id=${id}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Delete failed");

        texts = texts.filter(t => t.id !== id);
        render();
    } catch (err) {
        console.error(err);
        alert("Failed to delete text");
    }
}

/* ===================== RENDER DASHBOARD ===================== */
function render() {
    const list = document.getElementById("list");
    if (!list) return;

    list.innerHTML = "";

    texts.forEach(item => {
        const div = document.createElement("div");
        div.className = "text-item";

        const heading = document.createElement("h4");
        heading.textContent = item.title;
        heading.onclick = () => {
            if (item.body) openModal(item.body);
            else alert("No content to display!");
        };
        div.appendChild(heading);

        if (role === "admin") {
            const delBtn = document.createElement("button");
            delBtn.textContent = "Delete";
            delBtn.style.cssText = `
                background-color: #ff4d4d;
                color: #fff;
                border: none;
                padding: 10px 20px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 8px;
                cursor: pointer;
                margin-left: 15px;
            `;

            delBtn.onclick = () => deleteText(item.id);
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

/* ===================== SHOW / HIDE ADD SECTION ===================== */
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("dashboard")) {
        fetchTexts();
    }

    const showAddBtn = document.getElementById("showAddBtn");
    const addSection = document.getElementById("addSection");

    if (!showAddBtn || !addSection) return;

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
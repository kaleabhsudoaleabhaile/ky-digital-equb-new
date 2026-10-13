let members = JSON.parse(localStorage.getItem("ky_members_new")) || [];
let isAdmin = localStorage.getItem("ky_is_admin_new") === "true";

function loginAdmin() {
    const pass = prompt("የአድሚን ፓስወርድ ያስገቡ:");
    if (pass === "182418") {
        isAdmin = true;
        localStorage.setItem("ky_is_admin_new", "true");
        alert("✅ አድሚን ሆኖ ገብቷል!");
        renderMembers();
    } else if (pass !== null) {
        alert("❌ ትክክል ያልሆነ ፓስወርድ!");
    }
}

function logoutAdmin() {
    isAdmin = false;
    localStorage.setItem("ky_is_admin_new", "false");
    alert("🔒 ከአድሚን ወጥተዋል!");
    renderMembers();
}

function renderMembers() {
    const tbody = document.getElementById("membersList");
    if (!tbody) return;
    tbody.innerHTML = "";
    
    const adminCols = document.querySelectorAll(".admin-col");
    adminCols.forEach(col => col.style.display = isAdmin ? "" : "none");
    
    const addCard = document.getElementById("addMemberCard");
    const adminSec = document.getElementById("adminSection");
    const loginSec = document.getElementById("loginSection");
    const drawBtn = document.getElementById("drawBtn");
    const waitingText = document.getElementById("waitingText");

    if (isAdmin) {
        if (addCard) addCard.style.display = "block";
        if (adminSec) adminSec.style.display = "block";
        if (loginSec) loginSec.style.display = "none";
        if (drawBtn) drawBtn.style.display = "block";
        if (waitingText) waitingText.style.display = "none";
    } else {
        if (addCard) addCard.style.display = "none";
        if (adminSec) adminSec.style.display = "none";
        if (loginSec) loginSec.style.display = "block";
        if (drawBtn) drawBtn.style.display = "block";
        if (waitingText) waitingText.style.display = "none";
    }

    members.forEach((m, index) => {
        if (!m.days || m.days.length !== 5) m.days = [false, false, false, false, false];
        if (!m.gender) m.gender = "ወንድ";
        
        const tr = document.createElement("tr");
        let disabledAttr = isAdmin ? "" : "disabled";
        
        tr.innerHTML = `
            <td><strong>${m.name}</strong></td>
            <td>${m.gender}</td>
            <td><strong>50 ብር</strong></td>
            <td><input type="checkbox" class="custom-checkbox" ${m.days[0] ? 'checked' : ''} ${disabledAttr} onclick="toggleDay(${index}, 0)"></td>
            <td><input type="checkbox" class="custom-checkbox" ${m.days[1] ? 'checked' : ''} ${disabledAttr} onclick="toggleDay(${index}, 1)"></td>
            <td><input type="checkbox" class="custom-checkbox" ${m.days[2] ? 'checked' : ''} ${disabledAttr} onclick="toggleDay(${index}, 2)"></td>
            <td><input type="checkbox" class="custom-checkbox" ${m.days[3] ? 'checked' : ''} ${disabledAttr} onclick="toggleDay(${index}, 3)"></td>
            <td><input type="checkbox" class="custom-checkbox" ${m.days[4] ? 'checked' : ''} ${disabledAttr} onclick="toggleDay(${index}, 4)"></td>
            <td>${m.won ? '🏆 የወጣለት' : '-'}</td>
            <td class="admin-col" style="${isAdmin ? '' : 'display:none;'}"><button class="btn btn-danger" onclick="deleteMember(${index})">አጥፋ</button></td>
        `;
        tbody.appendChild(tr);
    });
    
    const totalEl = document.getElementById("totalMembersCount");
    if (totalEl) totalEl.innerText = members.length;
    localStorage.setItem("ky_members_new", JSON.stringify(members));
}

function drawEqub() {
    if (members.length === 0) {
        alert("⚠️ ምንም የተመዘገበ አባል የለም!");
        return;
    }
    
    const eligible = members.filter(m => !m.won);
    if (eligible.length === 0) {
        alert("⚠️ ለሁሉም አባላት ዕጣ ወጥቷል!");
        return;
    }

    const winnerDisplay = document.getElementById("winnerNameDisplay");
    let counter = 0;
    const spinInterval = setInterval(() => {
        const randomMember = eligible[Math.floor(Math.random() * eligible.length)];
        if (winnerDisplay) {
            winnerDisplay.innerText = "🎲 " + randomMember.name + " እየተሽከረከረ ነው...";
        }
        counter++;
        if (counter > 15) {
            clearInterval(spinInterval);
            finalizeWinner(eligible);
        }
    }, 100);
}

function finalizeWinner(eligible) {
    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    const idx = members.findIndex(m => m.name === winner.name);
    if (idx !== -1) members[idx].won = true;

    renderMembers();
    
    const winnerDisplay = document.getElementById("winnerNameDisplay");
    if (winnerDisplay) winnerDisplay.innerText = winner.name + " 🏆 (አሸናፊ!)";

    const genderText = winner.gender === 'ሴት' ? "የዚህ ዙር ዕጣ የወጣላት" : "የዚህ ዙር ዕጣ የወጣለት";
    const telegramMsg = `🎉 *K Y Digital Equb - Live Draw Result* 🎉\n\n` +
                        `የዚህ ዙር ዕጣ አሸናፊ:\n` +
                        `👤 ${genderText}: *${winner.name}*\n` +
                        `💵 የዕቁብ ክፍያ መጠን: 50 ብር\n` +
                        `🏆 አጠቃላይ ድምር: 25,000 ብር\n\n` +
                        `💳 ለዕቁብ አባላት ብቻ የብድር አገልግሎት እናመቻቻለን::\n\n` +
                        `እንኳን ደስ አላችሁ! 🎊 K Y Digital Equb`;

    const shareBtn = document.getElementById("telegramShareBtn");
    if (shareBtn) {
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent("")}&text=${encodeURIComponent(telegramMsg)}`;
        shareBtn.href = telegramUrl;
        shareBtn.style.display = "inline-block";
    }
    
    alert(`🎉 አሸናፊ: ${winner.name} (ዕጣው በስኬት ወጥቷል! አሁን ከታች ያለውን የቴሌግራም ቁልፍ በመንካት ቻናሉ ላይ ሼር ያድርጉት)`);
}

function toggleDay(mIdx, dIdx) {
    if (!isAdmin) return;
    if (!members[mIdx].days) members[mIdx].days = [false, false, false, false, false];
    members[mIdx].days[dIdx] = !members[mIdx].days[dIdx];
    renderMembers();
}

function deleteMember(idx) {
    if (!isAdmin) return;
    if (confirm("እርግጠኛ ነዎት ይህንን አባል ማጥፋት ይፈልጋሉ?")) {
        members.splice(idx, 1);
        renderMembers();
    }
}

function addMember() {
    if (!isAdmin) return;
    const nameInput = document.getElementById("memberNameInput");
    const genderInput = document.getElementById("memberGenderInput");
    if (!nameInput) return;
    const name = nameInput.value.trim();
    const gender = genderInput ? genderInput.value : "ወንድ";
    
    if (!name) {
        alert("እባክዎን ስም ያስገቡ!");
        return;
    }
    
    members.push({ name, gender, days: [false, false, false, false, false], won: false });
    nameInput.value = "";
    renderMembers();
}

document.addEventListener("DOMContentLoaded", () => {
    renderMembers();
    window.addEventListener("storage", () => {
        members = JSON.parse(localStorage.getItem("ky_members_new")) || [];
        renderMembers();
    });
});

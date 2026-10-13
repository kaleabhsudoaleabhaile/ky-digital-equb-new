let members = JSON.parse(localStorage.getItem("ky_members_new")) || [];
let isAdmin = localStorage.getItem("ky_is_admin_new") === "true";
const BOT_TOKEN = "8993924043:AAHtYJM0TBJJm7wM1VAe4Yd0vNPj6pNtc0o";
const CHANNEL_USERNAME = "@ky_digital_equb_channel";

// ወደ ቴሌግራም ቻናል መልእክት መላኪያ
function sendTelegramNotification(message) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const data = {
        chat_id: CHANNEL_USERNAME,
        text: message,
        parse_mode: "Markdown"
    };

    fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    }).catch(err => console.log("Telegram error: ", err));
}

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
        if (drawBtn) drawBtn.style.display = "none";
        if (waitingText) waitingText.style.display = "block";
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
    if (!isAdmin) return;
    
    if (members.length === 0) {
        alert("⚠️ ምንም የተመዘገበ አባል የለም!");
        return;
    }
    
    // የትኛው ቀን ላይ እንዳለን ማወቅ (ለምሳሌ ቀን 1፣ ቀን 2... እስከ ቀን 5)
    let activeDayIndex = members[0].days.findIndex(day => day === false);
    if (activeDayIndex === -1) activeDayIndex = 4; // 5ቱም ከተሞሉ የመጨረሻውን ቀን ይጠቀማል

    // ለወቅታዊው ቀን ሁሉም አባላት ቲክ መደረጋቸውን ማረጋገጥ
    const unpaid = members.filter(m => !m.days || m.days[activeDayIndex] !== true);
    if (unpaid.length > 0) {
        alert(`⚠️ እጣ ማውጣት አይቻልም! ቀን ${activeDayIndex + 1} ላይ ያልከፈሉ/ቲክ ያልተደረጉ ${unpaid.length} አባላት አሉ። እጣ ለማውጣት ሁሉም አባላት ቲክ መደረግ አለባቸው!`);
        return;
    }

    const eligible = members.filter(m => !m.won);
    if (eligible.length === 0) {
        alert("⚠️ ለሁሉም አባላት ዕጣ ወጥቷል!");
        return;
    }

    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    const idx = members.findIndex(m => m.name === winner.name);
    if (idx !== -1) members[idx].won = true;

    // 🔴 አዲስ ህግ፡ 5ቱም ቀናት ቲክ ተደርገው ከነበረ ወይም 5ኛው ቀን እጣ ከወጣ በኋላ ሳጥኖቹ በራሳቸው ጊዜ ባዶ (Reset) እንዲሆኑ ማድረግ
    const allDaysFilled = members.every(m => m.days.every(d => d === true));
    if (allDaysFilled || activeDayIndex === 4) {
        members.forEach(m => {
            m.days = [false, false, false, false, false];
        });
        alert("🔄 የ 5 ቀናት ዙር ስለተጠናቀቀ የሁሉም አባላት የቲክ ሳጥኖች ለቀጣዩ ዙር ባዶ ሆነዋል!");
    }

    renderMembers();
    
    const genderText = winner.gender === 'ሴት' ? "ዕጣው የወጣላት" : "ዕጣው የወጣለት";
    const telegramMsg = `🎉 *K Y Digital Equb - Live Draw Result* 🎉\n\n` +
                        `የዛሬው ዘር ዕጣ አሸናፊ:\n` +
                        `👤 ${genderText}: *${winner.name}*\n` +
                        `💵 የዕቁብ ክፍያ መጠን: 50 ብር\n` +
                        `🏆 አጠቃላይ ድምር: 25,000 ብር\n\n` +
                        `🔗 ቻናላችን: https://t.me/ky_digital_equb_channel\n\n` +
                        `እንኳን ደስ አላችሁ! 🎊 K Y Digital Equb`;
    
    sendTelegramNotification(telegramMsg);
    
    const winnerDisplay = document.getElementById("winnerNameDisplay");
    if (winnerDisplay) winnerDisplay.innerText = winner.name + " 🏆";
    
    alert(`🎉 አሸናፊ: ${winner.name} (ወደ ቴሌግራም ቻናል ተልኳል!)`);
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

document.addEventListener("DOMContentLoaded", renderMembers);

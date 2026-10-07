import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =====================================================
   VCAJ MONDAL & MONDAL TOURNAMENT ACCOUNTS
   Compact Version
===================================================== */

const STORAGE_KEY = "vcaj_mondal_mondal_tournament_accounts";

const state = {
    income: [],
    expenses: [],
    teams: [],
    members: [],
    sponsors: [],
    otherIncome: []
};


/* =====================================================
   BASIC HELPERS
===================================================== */

const $ = id => document.getElementById(id);

const money = value =>
    "₹ " + Number(value || 0).toLocaleString("en-IN");

const esc = value =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");


function saveState() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}


function loadState() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {

        const data = JSON.parse(saved);

        Object.keys(state).forEach(key => {

            state[key] =
                Array.isArray(data[key])
                    ? data[key]
                    : [];

        });

    } catch (error) {

        console.error(
            "VCAJ data loading error:",
            error
        );

    }
}


loadState();

let vcajMembers = [];


/* =====================================================
   LOAD VCAJ MEMBERS FROM FIREBASE
===================================================== */

async function loadVCAJMembers() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "members")
            );


        vcajMembers = [];


        snapshot.forEach(docSnap => {

            const data = docSnap.data();

            vcajMembers.push({

                firestoreId:
                    docSnap.id,

                memberId:
                    data.memberId || "",

                fullName:
                    data.fullName || "",

                status:
                    data.status || "Active"

            });

        });


        console.log(
            "VCAJ Members loaded:",
            vcajMembers.length
        );


    } catch (error) {

        console.error(
            "Unable to load VCAJ Members:",
            error
        );

    }

}


/* =====================================================
   MODULE INFORMATION
===================================================== */

const moduleInfo = {

    "team-payments": [
        "TEAM PAYMENTS",
        "Team Payments",
        "Manage Entry Fee, Security Deposit and Other Team Payments.",
        "＋ Add Team Payment"
    ],

    "member-contributions": [
        "MEMBER CONTRIBUTIONS",
        "Member Contributions",
        "Track fixed contribution, paid amount and due.",
        "＋ Receive Contribution"
    ],

    "tournament-members": [
        "TOURNAMENT MEMBERS",
        "Tournament Base Members",
        "Manage tournament-specific members.",
        "＋ Add Tournament Member"
    ],

    "sponsorship": [
        "SPONSORSHIP",
        "Sponsorship",
        "Manage sponsor payments and advertisement details.",
        "＋ Add Sponsorship"
    ],

    "other-income": [
        "OTHER INCOME",
        "Other Income",
        "Record donation and miscellaneous tournament income.",
        "＋ Add Income"
    ],

    "expenses": [
        "TOURNAMENT EXPENSES",
        "Tournament Expenses",
        "Record all tournament expenses category-wise.",
        "＋ Add Expense"
    ],

    "reports": [
        "REPORTS & AUDIT",
        "Reports & Audit",
        "Financial reports, audit trail and complete statement.",
        "Export Report"
    ],

    "receipt": [
        "RECEIPTS",
        "Receipt Print",
        "Find and print tournament receipts.",
        "Search Receipt"
    ],

    "cashbook": [
        "CASH BOOK",
        "Cash Book",
        "Track cash received and cash paid.",
        "Print Cash Book"
    ],

    "bankbook": [
        "BANK / UPI",
        "Bank / UPI Book",
        "Track UPI and bank transactions.",
        "View Statement"
    ],

    "settings": [
        "SETTINGS",
        "Settings",
        "Tournament accounts settings.",
        "Save Settings"
    ]

};


/* =====================================================
   NAVIGATION
===================================================== */

function navigate(section) {

    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.section === section
            );

        });


    const dashboard =
        $("section-dashboard");

    const module =
        $("section-module");


    if (section === "dashboard") {

        dashboard?.classList.add(
            "active-section"
        );

        module?.classList.remove(
            "active-section"
        );

        refreshDashboard();

        return;
    }


    dashboard?.classList.remove(
        "active-section"
    );

    module?.classList.add(
        "active-section"
    );


    const info =
        moduleInfo[section] || [
            "MODULE",
            "Module",
            "Module ready for development.",
            "＋ Add New"
        ];


    if ($("moduleBadge"))
        $("moduleBadge").textContent = info[0];

    if ($("moduleTitle"))
        $("moduleTitle").textContent = info[1];

    if ($("moduleDescription"))
        $("moduleDescription").textContent = info[2];

    if ($("primaryModuleAction"))
        $("primaryModuleAction").textContent = info[3];


    renderModule(section);
}


/* =====================================================
   MODULE RENDER
===================================================== */

function renderModule(section) {

    const box =
        $("moduleContent");

    if (!box) return;


    switch (section) {

        case "team-payments":
            renderTeamPayments(box);
            break;

        case "member-contributions":
            renderMembers(box);
            break;

        case "tournament-members":
            renderTournamentMembers(box);
            break;

        case "sponsorship":
            renderSponsors(box);
            break;

        case "other-income":
            renderOtherIncome(box);
            break;

        case "expenses":
            renderExpenses(box);
            break;

        case "reports":
            renderReports(box);
            break;

        default:
            renderPlaceholder(
                box,
                moduleInfo[section]?.[1] || "Module"
            );
    }
}


/* =====================================================
   TEAM PAYMENTS
===================================================== */

function renderTeamPayments(box) {

    const paid =
        state.teams.reduce(
            (s, x) => s + Number(x.totalPaid || 0),
            0
        );

    const due =
        state.teams.reduce(
            (s, x) => s + Number(x.due || 0),
            0
        );

    const security =
        state.teams.reduce(
            (s, x) => s + Number(x.securityPaid || 0),
            0
        );


    const rows =
        state.teams.map(team => {

            const payable =
                Number(team.entryFee || 0) +
                Number(team.securityDeposit || 0) +
                Number(team.otherPayment || 0);


            const status =
                team.due === 0 && team.totalPaid > 0
                    ? "Paid"
                    : team.totalPaid > 0
                        ? "Partial"
                        : "Pending";


            return `
                <tr>

                    <td class="${
                        Number(team.due) > 0
                            ? "team-due-name"
                            : "team-paid-name"
                    }">
                        ${esc(team.teamName)}
                    </td>

                    <td>${money(team.entryFee)}</td>

                    <td>${money(team.securityDeposit)}</td>

                    <td>${money(team.otherPayment)}</td>

                    <td>${money(payable)}</td>

                    <td>${money(team.totalPaid)}</td>

                    <td>${money(team.due)}</td>

                    <td>
                        <span class="payment-status ${status.toLowerCase()}">
                            ${status}
                        </span>
                    </td>

                    <td>
                        ${esc(team.paymentDate)}
                    </td>

                    <td>
                        ${esc(team.paymentMode)}
                    </td>

                    <td>

                        <button
                            class="action-btn"
                            onclick="editTeamPayment('${team.id}')"
                        >
                            Edit
                        </button>

                        <button
                            class="action-btn danger"
                            onclick="deleteTeamPayment('${team.id}')"
                        >
                            Delete
                        </button>

                    </td>

                </tr>
            `;

        }).join("");


    box.innerHTML = `

        <div class="module-summary">

            <div>
                <span>Total Teams</span>
                <strong>${state.teams.length}</strong>
            </div>

            <div>
                <span>Total Paid</span>
                <strong>${money(paid)}</strong>
            </div>

            <div>
                <span>Total Receivable</span>
                <strong>${money(due)}</strong>
            </div>

            <div>
                <span>Security Deposit</span>
                <strong>${money(security)}</strong>
            </div>

        </div>


        <div class="team-table-box">

            <div class="table-scroll">

                <table class="team-payment-table">

                    <thead>

                        <tr>
                            <th>Team Name</th>
                            <th>Entry Fee</th>
                            <th>Security</th>
                            <th>Other</th>
                            <th>Total Payable</th>
                            <th>Total Paid</th>
                            <th>Due</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Mode</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${
                            rows ||
                            `
                            <tr>
                                <td
                                    colspan="11"
                                    class="team-empty"
                                >
                                    No team payment recorded yet.
                                </td>
                            </tr>
                            `
                        }

                    </tbody>

                </table>

            </div>

        </div>

    `;
}


/* =====================================================
   TEAM PAYMENT FORM
===================================================== */

function openTeamPaymentForm(teamId = null) {

    const team =
        state.teams.find(
            x => x.id === teamId
        ) || {};


    const modal =
        document.createElement("div");

    modal.id = "teamPaymentModal";


    modal.innerHTML = `

        <div class="payment-modal">

            <div class="payment-modal-header">

                <div>

                    <small>TEAM PAYMENT</small>

                    <h3>
                        ${
                            teamId
                                ? "Edit Team Payment"
                                : "Add Team Payment"
                        }
                    </h3>

                </div>

                <button
                    onclick="closeTeamPaymentForm()"
                    class="modal-close"
                >
                    ×
                </button>

            </div>


            <form
                id="teamPaymentForm"
                class="payment-form"
            >

                <div class="form-grid">

                    ${field(
                        "Team Name",
                        "teamName",
                        team.teamName,
                        "text",
                        true
                    )}

                    ${field(
                        "Payment Date",
                        "paymentDate",
                        team.paymentDate ||
                        new Date()
                            .toISOString()
                            .slice(0,10),
                        "date"
                    )}

                    ${field(
                        "Entry Fee",
                        "entryFee",
                        team.entryFee
                    )}

                    ${field(
                        "Security Deposit",
                        "securityDeposit",
                        team.securityDeposit
                    )}

                    ${field(
                        "Other Payment",
                        "otherPayment",
                        team.otherPayment
                    )}

                    ${field(
                        "Total Paid",
                        "totalPaid",
                        team.totalPaid
                    )}

                    ${field(
                        "Due Amount (Manual)",
                        "due",
                        team.due
                    )}

                    <div class="form-field">

                        <label>
                            Payment Mode
                        </label>

                        <select id="paymentMode">

                            <option>Cash</option>
                            <option>UPI</option>
                            <option>Bank Transfer</option>

                        </select>

                    </div>


                    ${field(
                        "Receipt / Transaction No.",
                        "receiptNo",
                        team.receiptNo
                    )}

                    <div class="form-field full">

                        <label>
                            Remarks
                        </label>

                        <textarea
                            id="remarks"
                        >${esc(team.remarks)}</textarea>

                    </div>

                </div>


                <div class="form-actions">

                    <button
                        type="button"
                        onclick="closeTeamPaymentForm()"
                    >
                        Cancel
                    </button>

                    <button type="submit">
                        Save Payment
                    </button>

                </div>

            </form>

        </div>

    `;


    document.body.appendChild(modal);


    $("paymentMode").value =
        team.paymentMode || "Cash";


    $("teamPaymentForm").onsubmit =
        e => {

            e.preventDefault();

            saveTeamPayment(teamId);

        };
}


function field(
    label,
    id,
    value = "",
    type = "number",
    required = false
) {

    return `

        <div class="form-field">

            <label>
                ${label}
            </label>

            <input
                id="${id}"
                type="${type}"
                value="${esc(value)}"
                ${required ? "required" : ""}
            >

        </div>

    `;
}


/* =====================================================
   SAVE TEAM PAYMENT
===================================================== */

function saveTeamPayment(teamId) {

    const team = {

        id:
            teamId ||
            "TEAM-" +
            Date.now(),

        teamName:
            $("teamName").value.trim(),

        paymentDate:
            $("paymentDate").value,

        entryFee:
            Number($("entryFee").value || 0),

        securityDeposit:
            Number(
                $("securityDeposit").value || 0
            ),

        otherPayment:
            Number(
                $("otherPayment").value || 0
            ),

        totalPaid:
            Number(
                $("totalPaid").value || 0
            ),

        due:
            Number(
                $("due").value || 0
            ),

        paymentMode:
            $("paymentMode").value,

        receiptNo:
            $("receiptNo").value.trim(),

        remarks:
            $("remarks").value.trim()

    };


    const payable =
        team.entryFee +
        team.securityDeposit +
        team.otherPayment;


    if (!team.teamName) {

        alert("Please enter Team Name.");

        return;
    }


    if (team.totalPaid > payable) {

        alert(
            "Total Paid cannot be greater than Total Payable."
        );

        return;
    }


    team.status =
        team.due === 0 &&
        team.totalPaid > 0
            ? "Paid"
            : team.totalPaid > 0
                ? "Partial"
                : "Pending";


    team.securityPaid =
        Math.min(
            team.securityDeposit,
            team.totalPaid
        );


    if (teamId) {

        const index =
            state.teams.findIndex(
                x => x.id === teamId
            );

        if (index !== -1)
            state.teams[index] = team;

    } else {

        state.teams.push(team);

    }


    saveState();

    closeTeamPaymentForm();

    renderTeamPayments(
        $("moduleContent")
    );

    refreshDashboard();

    updateNotification();

}


/* =====================================================
   EDIT / DELETE
===================================================== */

function editTeamPayment(id) {

    openTeamPaymentForm(id);

}


function deleteTeamPayment(id) {

    if (
        !confirm(
            "Delete this team payment?"
        )
    ) return;


    state.teams =
        state.teams.filter(
            x => x.id !== id
        );


    saveState();

    renderTeamPayments(
        $("moduleContent")
    );

    refreshDashboard();

    updateNotification();

}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeTeamPaymentForm() {

    const modal =
        $("teamPaymentModal");

    if (modal)
        modal.remove();

}


/* =====================================================
   OTHER MODULES
===================================================== */

function renderMembers(box) {

    const totalContribution = state.members.reduce(
        (s, x) => s + Number(x.contribution || 0),
        0
    );

    const totalPaid = state.members.reduce(
        (s, x) => s + Number(x.paid || 0),
        0
    );

    const totalDue = state.members.reduce(
        (s, x) => s + Number(x.due || 0),
        0
    );

    const rows = state.members.map(member => {

        const status =
            Number(member.due || 0) === 0 && Number(member.paid || 0) > 0
                ? "Paid"
                : Number(member.paid || 0) > 0
                    ? "Partial"
                    : "Pending";

        return `
            <tr>
                <td>${esc(member.memberId)}</td>

                <td class="member-contribution-name">
                    ${esc(member.memberName)}
                </td>

                <td>${money(member.contribution)}</td>

                <td>${money(member.paid)}</td>

                <td>${money(member.due)}</td>

                <td>
                    <span class="payment-status ${status.toLowerCase()}">
                        ${status}
                    </span>
                </td>

                <td>${esc(member.paymentDate)}</td>

                <td>${esc(member.paymentMode)}</td>

                <td>
                    <button
                        class="action-btn"
                        onclick="editMemberContribution('${member.id}')"
                    >
                        Edit
                    </button>

                    <button
                        class="action-btn danger"
                        onclick="deleteMemberContribution('${member.id}')"
                    >
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    box.innerHTML = `

        <div class="module-summary">

            <div>
                <span>Total Contribution</span>
                <strong>${money(totalContribution)}</strong>
            </div>

            <div>
                <span>Total Received</span>
                <strong>${money(totalPaid)}</strong>
            </div>

            <div>
                <span>Total Due</span>
                <strong>${money(totalDue)}</strong>
            </div>

            <div>
                <span>Total Members</span>
                <strong>${state.members.length}</strong>
            </div>

        </div>


        <div class="team-table-box">

            <div class="table-scroll">

                <table class="team-payment-table">

                    <thead>
                        <tr>
                            <th>Member ID</th>
                            <th>Member Name</th>
                            <th>Contribution</th>
                            <th>Paid</th>
                            <th>Due</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Mode</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        ${
                            rows ||
                            `
                            <tr>
                                <td
                                    colspan="9"
                                    class="team-empty"
                                >
                                    No member contribution recorded yet.
                                </td>
                            </tr>
                            `
                        }

                    </tbody>

                </table>

            </div>

        </div>
    `;
}
function openMemberContributionForm(memberId = null) {

    const member =
        state.members.find(x => x.id === memberId) || {};

    const modal = document.createElement("div");

    modal.id = "memberContributionModal";

    modal.innerHTML = `
        <div class="payment-modal">

            <div class="payment-modal-header">

                <div>
                    <small>MEMBER CONTRIBUTION</small>

                    <h3>
                        ${
                            memberId
                                ? "Edit Contribution"
                                : "Add Member Contribution"
                        }
                    </h3>
                </div>

                <button
                    onclick="closeMemberContributionForm()"
                    class="modal-close"
                >
                    ×
                </button>

            </div>


            <form
                id="memberContributionForm"
                class="payment-form"
            >

                <div class="form-grid">

                   <div class="form-field full">

    <label>Member Name</label>

    <div class="member-autocomplete">

        <input
            type="text"
            id="memberName"
            value="${esc(member.memberName || "")}"
            placeholder="Type member name..."
            autocomplete="off"
        >

        <div
            id="memberSuggestions"
            class="member-suggestions"
        ></div>

    </div>

</div>


${field(
    "Member ID",
    "memberId",
    member.memberId,
    "text",
    true
)}

                    ${field(
                        "Contribution Amount",
                        "contribution",
                        member.contribution
                    )}

                    ${field(
                        "Paid Amount",
                        "paid",
                        member.paid
                    )}

                    ${field(
                        "Payment Date",
                        "memberPaymentDate",
                        member.paymentDate ||
                        new Date()
                            .toISOString()
                            .slice(0, 10),
                        "date"
                    )}

                    <div class="form-field">

                        <label>Payment Mode</label>

                        <select id="memberPaymentMode">

                            <option>Cash</option>
                            <option>UPI</option>
                            <option>Bank Transfer</option>

                        </select>

                    </div>


                    ${field(
                        "Receipt / Transaction No.",
                        "memberReceiptNo",
                        member.receiptNo
                    )}


                    <div class="form-field full">

                        <label>Remarks</label>

                        <textarea
                            id="memberRemarks"
                        >${esc(member.remarks)}</textarea>

                    </div>

                </div>


                <div class="form-actions">

                    <button
                        type="button"
                        onclick="closeMemberContributionForm()"
                    >
                        Cancel
                    </button>

                    <button type="submit">
                        Save Contribution
                    </button>

                </div>

            </form>

        </div>
    `;

    document.body.appendChild(modal);

    /* =====================================================
   MEMBER NAME AUTOCOMPLETE
===================================================== */

const memberNameInput = $("memberName");
const memberIdInput = $("memberId");
const suggestionsBox = $("memberSuggestions");


memberNameInput.addEventListener("input", function () {

    const query =
        this.value
            .trim()
            .toLowerCase();


    suggestionsBox.innerHTML = "";


    if (!query) {

        suggestionsBox.style.display = "none";

        memberIdInput.value = "";

        return;

    }


    const matches =
        vcajMembers
            .filter(member =>
                member.fullName
                    .toLowerCase()
                    .includes(query)
            )
            .slice(0, 8);


    if (!matches.length) {

        suggestionsBox.style.display = "none";

        return;

    }


    matches.forEach(member => {

        const item =
            document.createElement("div");

        item.className =
            "member-suggestion";


        item.innerHTML = `
            <strong>
                ${esc(member.fullName)}
            </strong>

            <small>
                ${esc(member.memberId)}
            </small>
        `;


        item.addEventListener(
            "click",
            () => {

                memberNameInput.value =
                    member.fullName;

                memberIdInput.value =
                    member.memberId;


                memberNameInput.dataset.memberId =
                    member.memberId;


                suggestionsBox.innerHTML = "";

                suggestionsBox.style.display =
                    "none";

            }
        );


        suggestionsBox.appendChild(item);

    });


    suggestionsBox.style.display =
        "block";

});


    $("memberPaymentMode").value =
        member.paymentMode || "Cash";


    $("memberContributionForm").onsubmit =
        e => {

            e.preventDefault();

            saveMemberContribution(memberId);

        };

        /* =====================================================
   MEMBER CONTRIBUTION MODAL BUTTONS
===================================================== */

const cancelButton =
    modal.querySelector(
        ".form-actions button[type='button']"
    );

if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        () => {
            closeMemberContributionForm();
        }
    );

}

const closeButton =
    modal.querySelector(".modal-close");

if (closeButton) {

    closeButton.addEventListener(
        "click",
        () => {
            closeMemberContributionForm();
        }
    );

}
}
function saveMemberContribution(memberId) {

    const contribution =
        Number($("contribution").value || 0);

    const paid =
        Number($("paid").value || 0);

    const due =
        Math.max(contribution - paid, 0);


    if (!$("memberId").value.trim()) {

        alert("Please enter Member ID.");

        return;
    }


    if (!$("memberName").value.trim()) {

        alert("Please enter Member Name.");

        return;
    }


    if (paid > contribution) {

        alert(
            "Paid Amount cannot be greater than Contribution Amount."
        );

        return;
    }


    const member = {

        id:
            memberId ||
            "MEMBER-CONTRIBUTION-" +
            Date.now(),

        memberId:
            $("memberId").value.trim(),

        memberName:
            $("memberName").value.trim(),

        contribution,

        paid,

        due,

        paymentDate:
            $("memberPaymentDate").value,

        paymentMode:
            $("memberPaymentMode").value,

        receiptNo:
            $("memberReceiptNo").value.trim(),

        remarks:
            $("memberRemarks").value.trim()
    };


    if (memberId) {

        const index =
            state.members.findIndex(
                x => x.id === memberId
            );

        if (index !== -1) {
            state.members[index] = member;
        }

    } else {

        state.members.push(member);

    }


    saveState();

    closeMemberContributionForm();

    renderMembers(
        $("moduleContent")
    );

    refreshDashboard();

    updateNotification();
}
function editMemberContribution(id) {

    openMemberContributionForm(id);

}


function deleteMemberContribution(id) {

    if (
        !confirm(
            "Delete this member contribution?"
        )
    ) return;


    state.members =
        state.members.filter(
            x => x.id !== id
        );


    saveState();

    renderMembers(
        $("moduleContent")
    );

    refreshDashboard();

    updateNotification();
}


function closeMemberContributionForm() {

    const modal =
        $("memberContributionModal");

    if (modal) {
        modal.remove();
    }

}


function renderTournamentMembers(box) {

    box.innerHTML = simpleModule(
        "Tournament Base Members",
        "Member",
        ["Member", "Phone", "Location"]
    );

}


function renderSponsors(box) {

    box.innerHTML = simpleModule(
        "Sponsorship",
        "Sponsor",
        ["Sponsor", "Amount", "Purpose", "Date"]
    );

}


function renderOtherIncome(box) {

    box.innerHTML = simpleModule(
        "Other Income",
        "Income",
        ["Source", "Amount", "Purpose", "Date"]
    );

}


function renderExpenses(box) {

    box.innerHTML = simpleModule(
        "Tournament Expenses",
        "Expense",
        ["Category", "Amount", "Date", "Mode"]
    );

}


function simpleModule(title, name, columns) {

    return `

        <div class="simple-module">

            <div class="empty-module">

                <h3>${title}</h3>

                <p>
                    ${name} records will appear here.
                </p>

                <button
                    class="primary"
                    onclick="alert('Form will be connected next.')"
                >
                    ＋ Add New
                </button>

            </div>

        </div>

    `;

}


function renderReports(box) {

    box.innerHTML = `

        <div class="report-grid">

            <div class="report-card">
                <h3>Total Income</h3>
                <strong>
                    ${money(
                        state.teams.reduce(
                            (s,x) =>
                                s +
                                Number(
                                    x.totalPaid || 0
                                ),0
                        )
                    )}
                </strong>
            </div>

            <div class="report-card">
                <h3>Total Expense</h3>
                <strong>
                    ${money(
                        state.expenses.reduce(
                            (s,x) =>
                                s +
                                Number(
                                    x.amount || 0
                                ),0
                        )
                    )}
                </strong>
            </div>

        </div>

    `;

}


function renderPlaceholder(box,title) {

    box.innerHTML = `

        <div class="empty-module">

            <h3>${title}</h3>

            <p>
                This module is ready for the next development step.
            </p>

        </div>

    `;

}


/* =====================================================
   DASHBOARD
===================================================== */

function refreshDashboard() {

    const teamIncome =
        state.teams.reduce(
            (s,x) =>
                s +
                Number(
                    x.totalPaid || 0
                ),
            0
        );


    const memberIncome =
        state.members.reduce(
            (s,x) =>
                s +
                Number(
                    x.paid || 0
                ),
            0
        );


    const sponsorIncome =
        state.sponsors.reduce(
            (s,x) =>
                s +
                Number(
                    x.received || 0
                ),
            0
        );


    const otherIncome =
        state.otherIncome.reduce(
            (s,x) =>
                s +
                Number(
                    x.amount || 0
                ),
            0
        );


    const expense =
        state.expenses.reduce(
            (s,x) =>
                s +
                Number(
                    x.amount || 0
                ),
            0
        );


    const income =
        teamIncome +
        memberIncome +
        sponsorIncome +
        otherIncome;


    const balance =
        income - expense;


    const due =
        state.teams.reduce(
            (s,x) =>
                s +
                Number(
                    x.due || 0
                ),
            0
        );


    const cashReceived =
        state.teams
            .filter(
                x =>
                    x.paymentMode === "Cash"
            )
            .reduce(
                (s,x) =>
                    s +
                    Number(
                        x.totalPaid || 0
                    ),
                0
            );


    const cashExpense =
        state.expenses
            .filter(
                x =>
                    x.paymentMode === "Cash"
            )
            .reduce(
                (s,x) =>
                    s +
                    Number(
                        x.amount || 0
                    ),
                0
            );


    const cash =
        cashReceived -
        cashExpense;


    const bank =
        balance -
        cash;


    setText(
        "totalIncome",
        money(income)
    );

    setText(
        "totalExpense",
        money(expense)
    );

    setText(
        "availableBalance",
        money(balance)
    );

    setText(
        "cashBalance",
        money(cash)
    );

    setText(
        "bankBalance",
        money(bank)
    );

    setText(
        "totalDue",
        money(due)
    );

}


/* =====================================================
   TEXT HELPER
===================================================== */

function setText(id,value) {

    const element = $(id);

    if (element)
        element.textContent = value;

}


/* =====================================================
   NAVIGATION EVENTS
===================================================== */

document.addEventListener(
    "click",
    event => {

        const nav =
            event.target.closest(
                ".nav-link"
            );


        if (nav) {

            navigate(
                nav.dataset.section
            );

            return;
        }


        const action =
            event.target.closest(
                "[data-section]"
            );


        if (
            action &&
            !action.classList.contains(
                "nav-link"
            )
        ) {

            navigate(
                action.dataset.section
            );

        }

    }
);


/* =====================================================
   PRIMARY ACTION
===================================================== */

document.addEventListener(
    "click",
    event => {

        if (
            event.target.id !==
            "primaryModuleAction"
        ) return;


        const active =
            document.querySelector(
                ".nav-link.active"
            );


        const section =
            active?.dataset.section;


        if (section === "team-payments") {

    openTeamPaymentForm();

} else if (section === "member-contributions") {

    openMemberContributionForm();

} else {

    alert(
        "This module form will be connected next."
    );

}

    }
);


/* =====================================================
   NOTIFICATION
===================================================== */

function updateNotification() {

    const count =
        state.teams.filter(
            x =>
                Number(x.due || 0) > 0
        ).length;


    const badge =
        $("notificationCount") ||
        $("notifyCount");


    if (badge)
        badge.textContent = count;

}


const notification =
    $("notificationButton") ||
    $("dueNotification");


if (notification) {

    notification.addEventListener(
        "click",
        () => {

            const dueTeams =
                state.teams.filter(
                    x =>
                        Number(x.due || 0) > 0
                );


            if (!dueTeams.length) {

                alert(
                    "No pending team payment."
                );

                return;
            }


            alert(
                dueTeams
                    .map(
                        x =>
                            `${x.teamName} : ${money(x.due)}`
                    )
                    .join("\n")
            );

        }
    );

}


/* =====================================================
   SEARCH
===================================================== */

const search =
    $("globalSearch");


if (search) {

    search.addEventListener(
        "input",
        () => {

            const query =
                search.value
                    .trim()
                    .toLowerCase();


            if (
                document.querySelector(
                    ".team-payment-table"
                )
            ) {

                document
                    .querySelectorAll(
                        ".team-payment-table tbody tr"
                    )
                    .forEach(row => {

                        row.style.display =
                            row.textContent
                                .toLowerCase()
                                .includes(query)
                                    ? ""
                                    : "none";

                    });

            }

        }
    );

}


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeTeamPaymentForm();

        }

    }
);


/* =====================================================
   INITIAL LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadVCAJMembers();

        refreshDashboard();

        updateNotification();

        navigate("dashboard");

    }
);


console.log(
    "VCAJ Tournament Accounts loaded."
);

/* =====================================================
   GLOBAL FUNCTION ACCESS
   Required because this file is loaded as ES Module
===================================================== */

window.openTeamPaymentForm =
    openTeamPaymentForm;

window.editTeamPayment =
    editTeamPayment;

window.deleteTeamPayment =
    deleteTeamPayment;

window.closeTeamPaymentForm =
    closeTeamPaymentForm;

window.openMemberContributionForm =
    openMemberContributionForm;

window.editMemberContribution =
    editMemberContribution;

window.deleteMemberContribution =
    deleteMemberContribution;

window.closeMemberContributionForm =
    closeMemberContributionForm;
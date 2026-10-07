/* =========================================================
   VCAJ MEMBERS
   Firebase Firestore + Search + Filters + Edit
   ========================================================= */

import { db } from "./firebase-config.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const searchInput = document.getElementById("memberSearch");
const statusFilter = document.getElementById("statusFilter");
const departmentFilter = document.getElementById("departmentFilter");

const tableBody = document.getElementById("membersTableBody");
const noResults = document.getElementById("noResults");

let members = [];


/* =========================================================
   LOAD MEMBERS FROM FIRESTORE
   ========================================================= */

async function loadMembers() {

    try {

        const snapshot =
            await getDocs(collection(db, "members"));

        members = [];

        snapshot.forEach(document => {

            members.push({
                firestoreId: document.id,
                ...document.data()
            });

        });

        renderMembers(members);
        updateSummary(members);

    } catch (error) {

    console.error("Firebase error:", error);

    tableBody.innerHTML = "";

    noResults.textContent =
        "Firebase Error: " +
        (error.message || "Unable to load members.");

    noResults.style.display = "block";
}
}


/* =========================================================
   RENDER MEMBERS
   ========================================================= */

function renderMembers(data) {

    tableBody.innerHTML = "";

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value;

    const selectedDepartment =
        departmentFilter.value;

    let visibleCount = 0;


    data.forEach(member => {

        const memberId =
            member.memberId || "";

        const fullName =
            member.fullName || "";

        const mobile =
            member.mobileNumber || "";

        const whatsapp =
            member.whatsappNumber || "";

        const email =
            member.emailId || "";

        const joiningDate =
            member.joiningDate || "";

        const department =
            member.department || "";

        const responsibility =
            member.responsibility || "";

        const memberType =
            member.memberType || "";

        const status =
            member.status || "";

        const photo =
            member.photoUrl || "";


        const searchableText = (

            memberId + " " +
            fullName + " " +
            mobile + " " +
            whatsapp + " " +
            email + " " +
            department + " " +
            responsibility + " " +
            memberType + " " +
            status

        ).toLowerCase();


        const matchesSearch =
            searchableText.includes(
                searchValue
            );

        const matchesStatus =
            selectedStatus === "all" ||
            status === selectedStatus;

        const matchesDepartment =
            selectedDepartment === "all" ||
            department === selectedDepartment;


        if (
            !matchesSearch ||
            !matchesStatus ||
            !matchesDepartment
        ) {
            return;
        }


        visibleCount++;


        const initials =
            fullName
                .split(" ")
                .map(word => word.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase();


        const photoHTML = photo

            ? `<img
                src="${photo}"
                alt="${fullName}"
                class="member-photo"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
              >
              <span
                class="member-initials"
                style="display:none;"
              >
                ${initials}
              </span>`

            : `<span class="member-initials">
                ${initials}
              </span>`;


        const statusClass =
            status.toLowerCase();


        const row =
            document.createElement("tr");

        row.dataset.status =
            status;

        row.dataset.department =
            department;


        row.innerHTML = `

            <td>
                <div class="member-avatar">
                    ${photoHTML}
                </div>
            </td>

            <td>
                <span class="member-id">
                    ${memberId}
                </span>
            </td>

            <td>
                <strong>
                    ${fullName}
                </strong>
            </td>

            <td>
                ${mobile}
            </td>

            <td>
                ${whatsapp}
            </td>

            <td>
                ${email}
            </td>

            <td>
                ${joiningDate}
            </td>

            <td>
                ${department}
            </td>

            <td>
                ${responsibility}
            </td>

            <td>
                ${memberType}
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${status}
                </span>
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="view-btn"
                        data-id="${memberId}">
                        View
                    </button>

                    <button
                        class="edit-btn"
                        data-id="${memberId}">
                        Edit
                    </button>

                </div>

            </td>
        `;


        tableBody.appendChild(row);

    });


    noResults.style.display =
        visibleCount === 0
            ? "block"
            : "none";


    attachActionButtons();
}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary(data) {

    document.getElementById(
        "totalMembers"
    ).textContent = data.length;


    document.getElementById(
        "activeMembers"
    ).textContent =
        data.filter(
            member =>
                member.status === "Active"
        ).length;


    document.getElementById(
        "pendingMembers"
    ).textContent =
        data.filter(
            member =>
                member.status === "Pending"
        ).length;


    document.getElementById(
        "inactiveMembers"
    ).textContent =
        data.filter(
            member =>
                member.status === "Inactive"
        ).length;
}


/* =========================================================
   FILTERS
   ========================================================= */

function filterMembers() {

    renderMembers(members);
}


searchInput.addEventListener(
    "input",
    filterMembers
);

statusFilter.addEventListener(
    "change",
    filterMembers
);

departmentFilter.addEventListener(
    "change",
    filterMembers
);


/* =========================================================
   ADD MEMBER
   ========================================================= */

document
    .getElementById("addMemberBtn")
    .addEventListener(
        "click",
        function () {

            window.location.href =
                "member-form.html";

        }
    );


/* =========================================================
   VIEW / EDIT BUTTONS
   ========================================================= */

function attachActionButtons() {

    document
    .querySelectorAll(".view-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const memberId =
                    this.dataset.id;

                window.location.href =
                    "member-profile.html?id=" +
                    encodeURIComponent(memberId);

            }
        );

    });


    document
        .querySelectorAll(".edit-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const memberId =
                        this.dataset.id;

                    window.location.href =
                        "member-form.html?id=" +
                        encodeURIComponent(
                            memberId
                        );

                }
            );

        });
}


/* =========================================================
   START
   ========================================================= */

loadMembers();
/* =========================================================
   VCAJ MEMBER PROFILE
   Firebase Firestore
========================================================= */

import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   GET MEMBER ID
========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const memberId =
    urlParams.get("id");


/* =========================================================
   ELEMENTS
========================================================= */

const loading =
    document.getElementById("loading");

const errorBox =
    document.getElementById("errorBox");

const profileContent =
    document.getElementById("profileContent");

const editButton =
    document.getElementById("editButton");

const editBottomButton =
    document.getElementById(
        "editBottomButton"
    );


/* =========================================================
   GOOGLE DRIVE PHOTO FIX
========================================================= */

function getPhotoUrl(url) {

    if (!url) {
        return "";
    }


    /* Existing Google Drive format */

    if (
        url.includes(
            "drive.google.com/open?id="
        )
    ) {

        const id =
            url.split("id=")[1];

        return (
            "https://drive.google.com/uc?export=view&id=" +
            id
        );

    }


    return url;

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        value || "—";

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {

    if (!name) {
        return "--";
    }


    return name
        .trim()
        .split(/\s+/)
        .map(
            word =>
                word.charAt(0)
        )
        .join("")
        .substring(0, 2)
        .toUpperCase();

}


/* =========================================================
   LOAD MEMBER
========================================================= */

async function loadMember() {

    if (!memberId) {

        showError(
            "No Member ID was provided."
        );

        return;

    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "members"
                )
            );


        let member = null;


        snapshot.forEach(document => {

            const data =
                document.data();


            if (
                String(data.memberId) ===
                String(memberId)
            ) {

                member = data;

            }

        });


        if (!member) {

            showError(
                "Member not found in Firebase."
            );

            return;

        }


        renderProfile(member);

    }

    catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        showError(
            "Unable to load member profile: " +
            error.message
        );

    }

}


/* =========================================================
   RENDER PROFILE
========================================================= */

function renderProfile(member) {

    loading.style.display =
        "none";


    profileContent.style.display =
        "block";


    /* Main information */

    setText(
        "fullName",
        member.fullName
    );

    setText(
        "memberId",
        member.memberId
    );


    /* Hero badges */

    setText(
        "statusBadge",
        member.status
    );

    setText(
        "memberTypeBadge",
        member.memberType
    );


    /* Personal */

    setText(
        "infoFullName",
        member.fullName
    );

    setText(
        "infoMemberId",
        member.memberId
    );

    setText(
        "infoEmail",
        member.emailId
    );

    setText(
        "infoMobile",
        member.mobileNumber
    );

    setText(
        "infoWhatsapp",
        member.whatsappNumber
    );

    setText(
        "infoJoiningDate",
        member.joiningDate
    );

    setText(
        "infoAddress",
        member.address
    );


    /* Membership */

    setText(
        "infoMemberType",
        member.memberType
    );

    setText(
        "infoStatus",
        member.status
    );

    setText(
        "infoDepartment",
        member.department
    );

    setText(
        "infoResponsibility",
        member.responsibility
    );


    /* Other */

    setText(
        "infoEmergency",
        member.emergencyContact
    );

    setText(
        "infoRemarks",
        member.remarks
    );


    /* Photo */

    const photoContainer =
        document.getElementById(
            "profilePhoto"
        );

    const initials =
        document.getElementById(
            "profileInitials"
        );


    const photoUrl =
        getPhotoUrl(
            member.photoUrl
        );


    if (photoUrl) {

        const image =
            document.createElement("img");

        image.src =
            photoUrl;

        image.alt =
            member.fullName || "Member";


        image.onload =
            function () {

                initials.style.display =
                    "none";

            };


        image.onerror =
            function () {

                image.remove();

                initials.textContent =
                    getInitials(
                        member.fullName
                    );

                initials.style.display =
                    "block";

            };


        photoContainer.appendChild(
            image
        );


        setText(
            "infoPhotoStatus",
            "Available"
        );

    }

    else {

        initials.textContent =
            getInitials(
                member.fullName
            );


        setText(
            "infoPhotoStatus",
            "No photo uploaded"
        );

    }


    /* Edit buttons */

    const editUrl =
        "member-form.html?id=" +
        encodeURIComponent(
            member.memberId
        );


    editButton.onclick =
        function () {

            window.location.href =
                editUrl;

        };


    editBottomButton.onclick =
        function () {

            window.location.href =
                editUrl;

        };

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    loading.style.display =
        "none";


    errorBox.textContent =
        message;


    errorBox.style.display =
        "block";

}


/* =========================================================
   START
========================================================= */

loadMember();
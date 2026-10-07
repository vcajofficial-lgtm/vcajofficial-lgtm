/* =========================================================
   VCAJ MEMBER FORM
   Firebase Add / Edit
   ========================================================= */

import { db, storage } from "./firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";


/* =========================================================
   URL / MODE
   ========================================================= */

const urlParams =
    new URLSearchParams(window.location.search);

const memberIdFromUrl =
    urlParams.get("id");


/* =========================================================
   ELEMENTS
   ========================================================= */

const pageTitle =
    document.getElementById("pageTitle");

const formTitle =
    document.getElementById("formTitle");

const formSubtitle =
    document.getElementById("formSubtitle");

const memberForm =
    document.getElementById("memberForm");

const memberId =
    document.getElementById("memberId");

const memberIdHelp =
    document.getElementById("memberIdHelp");

const saveButton =
    document.getElementById("saveButton");

const memberPhoto =
    document.getElementById("memberPhoto");

const photoPreview =
    document.getElementById("photoPreview");


/* =========================================================
   GET NEXT MEMBER ID
   Format: VCAJ-M001
   ========================================================= */

async function getNextMemberId() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "members")
            );

        let highestNumber = 0;

        snapshot.forEach(document => {

            const data =
                document.data();

            const id =
                String(data.memberId || "");

            const match =
                id.match(/^VCAJ-M(\d+)$/i);

            if (match) {

                const number =
                    Number(match[1]);

                if (number > highestNumber) {
                    highestNumber = number;
                }

            }

        });

        const nextNumber =
            highestNumber + 1;

        return (
            "VCAJ-M" +
            String(nextNumber).padStart(3, "0")
        );

    }

    catch (error) {

        console.error(
            "Member ID generation error:",
            error
        );

        throw error;

    }

}


/* =========================================================
   ADD / EDIT MODE
   ========================================================= */

async function initializeForm() {

    if (memberIdFromUrl) {

        /* =========================
           EDIT MODE
           ========================= */

        pageTitle.textContent =
            "Edit Member | VCAJ Official";

        formTitle.textContent =
            "Edit Member";

        formSubtitle.textContent =
            "Update VCAJ member information";

        memberId.value =
            memberIdFromUrl;

        memberIdHelp.textContent =
            "Member ID cannot be changed";

        saveButton.textContent =
            "Update Member";


        await loadMemberForEdit();

    }

    else {

        /* =========================
           ADD MODE
           ========================= */

        pageTitle.textContent =
            "Add Member | VCAJ Official";

        formTitle.textContent =
            "Add Member";

        formSubtitle.textContent =
            "Create a new VCAJ member record";

        memberIdHelp.textContent =
            "Automatically generated";

        saveButton.textContent =
            "Save Member";


        try {

            memberId.value =
                await getNextMemberId();

        }

        catch (error) {

            alert(
                "Unable to generate Member ID.\n\n" +
                error.message
            );

        }

    }

}


/* =========================================================
   LOAD MEMBER FOR EDIT
   ========================================================= */

async function loadMemberForEdit() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "members")
            );

        let memberData = null;
        let firestoreId = null;

        snapshot.forEach(document => {

            const data =
                document.data();

            if (
                String(data.memberId) ===
                String(memberIdFromUrl)
            ) {

                memberData = data;
                firestoreId = document.id;

            }

        });


        if (!memberData) {

            alert(
                "Member not found in Firebase."
            );

            return;

        }


        /* Fill form */

        document.getElementById(
            "fullName"
        ).value =
            memberData.fullName || "";


        document.getElementById(
            "mobileNumber"
        ).value =
            memberData.mobileNumber || "";


        document.getElementById(
            "whatsappNumber"
        ).value =
            memberData.whatsappNumber || "";


        document.getElementById(
            "emailId"
        ).value =
            memberData.emailId || "";


        document.getElementById(
            "joiningDate"
        ).value =
            memberData.joiningDate || "";


        document.getElementById(
            "department"
        ).value =
            memberData.department || "";


        document.getElementById(
            "responsibility"
        ).value =
            memberData.responsibility || "";


        document.getElementById(
            "memberType"
        ).value =
            memberData.memberType || "";


        document.getElementById(
            "status"
        ).value =
            memberData.status || "";


        /* Store Firestore document ID */

        memberForm.dataset.firestoreId =
            firestoreId;


        /* Existing photo */

        if (memberData.photoUrl) {

            photoPreview.innerHTML = "";

            const image =
                document.createElement("img");

            image.src =
                memberData.photoUrl;

            image.style.width = "100%";
            image.style.height = "100%";
            image.style.objectFit = "cover";

            photoPreview.appendChild(image);

        }

    }

    catch (error) {

        console.error(
            "Load member error:",
            error
        );

        alert(
            "Unable to load member.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   PHOTO PREVIEW
   ========================================================= */

memberPhoto.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                photoPreview.innerHTML = "";

                const image =
                    document.createElement("img");

                image.src =
                    event.target.result;

                image.style.width = "100%";
                image.style.height = "100%";
                image.style.objectFit = "cover";

                photoPreview.appendChild(image);

            };


        reader.readAsDataURL(file);

    }
);


/* =========================================================
   FORM SUBMIT
   ========================================================= */

memberForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        saveButton.disabled = true;

        saveButton.textContent =
            memberIdFromUrl
                ? "Updating..."
                : "Saving...";


        try {

            /* =========================
               READ FORM DATA
               ========================= */
/* =========================
   PHOTO UPLOAD
   ========================= */

const photoFile = memberPhoto.files[0];

let photoUrl = "";

if (photoFile) {

    if (!photoFile.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    if (photoFile.size > 5 * 1024 * 1024) {
        alert("Photo size must be less than 5 MB.");
        return;
    }

    const photoRef = ref(
        storage,
        `members/${memberId.value.trim()}/profile_${Date.now()}_${photoFile.name}`
    );

    const uploadResult = await uploadBytes(
        photoRef,
        photoFile
    );

    photoUrl = await getDownloadURL(
        uploadResult.ref
    );
}
            const data = {

                memberId:
                    memberId.value.trim(),

                fullName:
                    document.getElementById(
                        "fullName"
                    ).value.trim(),

                mobileNumber:
                    document.getElementById(
                        "mobileNumber"
                    ).value.trim(),

                whatsappNumber:
                    document.getElementById(
                        "whatsappNumber"
                    ).value.trim(),

                emailId:
                    document.getElementById(
                        "emailId"
                    ).value.trim(),

                joiningDate:
                    document.getElementById(
                        "joiningDate"
                    ).value,

                department:
                    document.getElementById(
                        "department"
                    ).value,

                responsibility:
                    document.getElementById(
                        "responsibility"
                    ).value,

                memberType:
                    document.getElementById(
                        "memberType"
                    ).value,

                status:
                    document.getElementById(
                        "status"
                    ).value,

                updatedAt:
                    new Date().toISOString(),
                    photoUrl:
                     photoUrl || ""

            };


            /* =========================
               ADD MEMBER
               ========================= */

            if (!memberIdFromUrl) {

                data.createdAt =
                    new Date().toISOString();


                await addDoc(
                    collection(
                        db,
                        "members"
                    ),
                    data
                );


                alert(
                    "Member added successfully!\n\n" +
                    "Member ID: " +
                    data.memberId
                );

            }


            /* =========================
               UPDATE MEMBER
               ========================= */

            else {

                const firestoreId =
                    memberForm.dataset.firestoreId;


                if (!firestoreId) {

                    throw new Error(
                        "Firebase document ID not found."
                    );

                }


                await updateDoc(
                    doc(
                        db,
                        "members",
                        firestoreId
                    ),
                    data
                );


                alert(
                    "Member updated successfully!\n\n" +
                    "Member ID: " +
                    data.memberId
                );

            }


            /* =========================
               GO BACK
               ========================= */

            window.location.href =
                "members.html";

        }

        catch (error) {

            console.error(
                "Firebase save error:",
                error
            );


            alert(
                "Firebase Error\n\n" +
                error.message
            );


            saveButton.disabled = false;

            saveButton.textContent =
                memberIdFromUrl
                    ? "Update Member"
                    : "Save Member";

        }

    }
);


/* =========================================================
   START
   ========================================================= */

initializeForm();
/*
-----------------------------------
TUTOR DATA
-----------------------------------
*/

const tutors = {

    maya: {
        id: "maya",
        name: "Maya Thompson",
        initials: "MT",
        subjects: "Math • Algebra • Geometry",
        grades: "6–10",
        rate: "$45/hour",
        availability: "Monday, Wednesday & Saturday",
        photoClass: "tutor-one",
        bio:
            "Maya enjoys helping students build confidence in math by breaking difficult concepts into clear, manageable steps. She focuses on creating a supportive learning environment and helping students strengthen both problem-solving skills and foundational understanding."
    },

    daniel: {
        id: "daniel",
        name: "Daniel Kim",
        initials: "DK",
        subjects: "Chemistry • Biology • Science",
        grades: "8–12",
        rate: "$50/hour",
        availability: "Tuesday, Thursday & Sunday",
        photoClass: "tutor-two",
        bio:
            "Daniel works with middle and high school students in biology, chemistry, and general science. His sessions focus on helping students understand the reasoning behind scientific concepts instead of relying only on memorization."
    },

    sofia: {
        id: "sofia",
        name: "Sofia Martinez",
        initials: "SM",
        subjects: "English • Writing • Reading",
        grades: "3–9",
        rate: "$40/hour",
        availability: "Monday–Friday",
        photoClass: "tutor-three",
        bio:
            "Sofia helps students become stronger readers and more confident writers. She enjoys working with students on reading comprehension, essay organization, grammar, and developing their own writing voice."
    }

};


/*
-----------------------------------
VIEW TUTOR PROFILE
-----------------------------------
*/

function viewTutor(tutorId) {

    window.location.href =
        "profile.html?tutor=" +
        encodeURIComponent(tutorId);

}


/*
-----------------------------------
BOOK TUTOR
-----------------------------------
Used when booking directly from
the tutor card.
-----------------------------------
*/

function bookTutor(tutorName) {

    /*
    Track booking start from tutor card.
    */

    if (window.posthog) {

        posthog.capture(
            "booking_started",
            {
                tutor_name: tutorName,
                booking_source: "tutor_card"
            }
        );

    }

    window.location.href =
        "booking.html?tutor=" +
        encodeURIComponent(tutorName);

}


/*
-----------------------------------
PROFILE PAGE
-----------------------------------
*/

const profileName =
    document.getElementById("profileName");

if (profileName) {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const tutorId =
        params.get("tutor");

    const tutor =
        tutors[tutorId];


    /*
    Invalid tutor ID.
    */

    if (!tutor) {

        window.location.href =
            "index.html#tutors";

    }

    else {

        /*
        Fill profile information.
        */

        document.getElementById(
            "profileName"
        ).textContent = tutor.name;


        document.getElementById(
            "profileSubjects"
        ).textContent = tutor.subjects;


        document.getElementById(
            "profileGrades"
        ).textContent = tutor.grades;


        document.getElementById(
            "profileRate"
        ).textContent = tutor.rate;


        document.getElementById(
            "profileAvailability"
        ).textContent =
            tutor.availability;


        document.getElementById(
            "profileBio"
        ).textContent = tutor.bio;


        /*
        Tutor photo placeholder.
        */

        const profilePhoto =
            document.getElementById(
                "profilePhoto"
            );

        profilePhoto.textContent =
            tutor.initials;

        profilePhoto.classList.add(
            tutor.photoClass
        );


        /*
        Track tutor profile view.
        */

        if (window.posthog) {

            posthog.capture(
                "tutor_profile_viewed",
                {
                    tutor_id: tutor.id,
                    tutor_name: tutor.name,
                    subjects: tutor.subjects,
                    grade_levels: tutor.grades,
                    hourly_rate: tutor.rate
                }
            );

        }


        /*
        Book This Tutor button.
        */

        const profileBookButton =
            document.getElementById(
                "profileBookButton"
            );

        if (profileBookButton) {

            profileBookButton.addEventListener(
                "click",
                function () {

                    /*
                    Track booking start
                    from tutor profile.
                    */

                    if (window.posthog) {

                        posthog.capture(
                            "booking_started",
                            {
                                tutor_id: tutor.id,
                                tutor_name: tutor.name,
                                booking_source: "profile_page"
                            }
                        );

                    }

                    window.location.href =
                        "booking.html?tutor=" +
                        encodeURIComponent(
                            tutor.name
                        );

                }
            );

        }

    }

}


/*
-----------------------------------
BOOKING PAGE
-----------------------------------
*/

const bookingForm =
    document.getElementById("bookingForm");

if (bookingForm) {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const tutorName =
        params.get("tutor");


    /*
    Fill selected tutor.
    */

    const tutorInput =
        document.getElementById("tutor");

    if (tutorName && tutorInput) {

        tutorInput.value =
            tutorName;

    }


    /*
    Prevent past dates.
    */

    const dateInput =
        document.getElementById("date");

    if (dateInput) {

        const today =
            new Date()
                .toISOString()
                .split("T")[0];

        dateInput.min =
            today;

    }


    /*
    Booking submission.
    */

    bookingForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const grade =
                document.getElementById(
                    "grade"
                ).value;

            const subject =
                document.getElementById(
                    "subject"
                ).value;

            const date =
                document.getElementById(
                    "date"
                ).value;

            const time =
                document.getElementById(
                    "time"
                ).value;


            /*
            Track completed booking.

            Notice:
            We do NOT send:
            - parent name
            - parent email
            - student name
            */

            if (window.posthog) {

                posthog.capture(
                    "booking_completed",
                    {
                        tutor_name: tutorName,
                        student_grade: grade,
                        requested_subject: subject,
                        booking_date: date,
                        booking_time: time
                    }
                );

            }


            console.log(
                "Booking completed:",
                {
                    tutor: tutorName,
                    grade: grade,
                    subject: subject,
                    date: date,
                    time: time
                }
            );


            alert(
                "Booking confirmed! " +
                "A confirmation will be sent shortly."
            );


            window.location.href =
                "index.html";

        }
    );

}
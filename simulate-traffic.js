const { chromium } = require("playwright");

const BASE_URL = "http://localhost:8000";


const POSTHOG_TOKEN = "phc_CpMNttkQwHVp3jsmstbLWY39oPDVn7Nd5kLj4geA8n2d";

const POSTHOG_HOST = "https://us.i.posthog.com";


const tutors = [
    {
        id: "maya",
        name: "Maya Thompson"
    },
    {
        id: "daniel",
        name: "Daniel Kim"
    },
    {
        id: "sofia",
        name: "Sofia Martinez"
    }
];


function chooseTutor() {

    const random = Math.random();

    if (random < 0.50) {
        return tutors[0];
    }

    if (random < 0.80) {
        return tutors[1];
    }

    return tutors[2];
}


function randomGrade() {

    const grades = [
        "6th",
        "7th",
        "8th",
        "9th",
        "10th"
    ];

    return grades[
        Math.floor(Math.random() * grades.length)
    ];
}


function randomSubject(tutorId) {

    const subjects = {

        maya: [
            "Math",
            "Algebra",
            "Geometry"
        ],

        daniel: [
            "Biology",
            "Chemistry",
            "Science"
        ],

        sofia: [
            "English",
            "Writing",
            "Reading"
        ]

    };

    const options = subjects[tutorId];

    return options[
        Math.floor(Math.random() * options.length)
    ];
}


/*
-----------------------------------
SEND EVENT DIRECTLY TO POSTHOG
-----------------------------------
*/

async function sendPostHogEvent(
    eventName,
    userId,
    properties = {}
) {

    const response = await fetch(
        `${POSTHOG_HOST}/capture/`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                api_key: POSTHOG_TOKEN,

                event: eventName,

                distinct_id: userId,

                properties: {
                    ...properties,

                    simulation: true
                }
            })
        }
    );

    if (!response.ok) {

        throw new Error(
            `PostHog returned ${response.status}`
        );

    }

}


/*
-----------------------------------
SIMULATE ONE USER
-----------------------------------
*/

async function simulateUser(
    browser,
    userNumber
) {

    const context =
        await browser.newContext();

    const page =
        await context.newPage();

    const tutor =
        chooseTutor();

    /*
    Give every simulated user
    their own identity.
    */
    const userId =
        `simulated-user-${Date.now()}-${userNumber}`;


    console.log(
        `\nUser ${userNumber}: ${tutor.name}`
    );


    /*
    -----------------------------
    HOMEPAGE
    -----------------------------
    */

    await page.goto(
        BASE_URL,
        {
            waitUntil: "networkidle"
        }
    );

    await page.waitForTimeout(500);


    /*
    -----------------------------
    PROFILE VIEW
    -----------------------------
    */

    await page.goto(
        `${BASE_URL}/profile.html?tutor=${tutor.id}`,
        {
            waitUntil: "networkidle"
        }
    );


    /*
    Explicitly send the analytics event.
    */

    await sendPostHogEvent(
        "tutor_profile_viewed",
        userId,
        {
            tutor_id: tutor.id,
            tutor_name: tutor.name
        }
    );


    console.log(
        "  ✓ profile viewed"
    );


    /*
    About 30% leave here.
    */

    if (Math.random() > 0.70) {

        console.log(
            "  ✗ left after profile"
        );

        await context.close();

        return;
    }


    /*
    -----------------------------
    START BOOKING
    -----------------------------
    */

    await page.click(
        "#profileBookButton"
    );

    await page.waitForLoadState(
        "networkidle"
    );


    await sendPostHogEvent(
        "booking_started",
        userId,
        {
            tutor_id: tutor.id,
            tutor_name: tutor.name,
            booking_source: "profile_page"
        }
    );


    console.log(
        "  ✓ booking started"
    );


    /*
    About 30% abandon.
    */

    if (Math.random() > 0.70) {

        console.log(
            "  ✗ abandoned booking"
        );

        await context.close();

        return;
    }


    /*
    -----------------------------
    FILL BOOKING FORM
    -----------------------------
    */

    await page.fill(
        "#parentName",
        `Test Parent ${userNumber}`
    );

    await page.fill(
        "#parentEmail",
        `test${userNumber}@example.com`
    );

    await page.fill(
        "#studentName",
        `Student${userNumber}`
    );


    const grade =
        randomGrade();

    const subject =
        randomSubject(tutor.id);


    await page.selectOption(
        "#grade",
        {
            label: grade
        }
    );


    await page.selectOption(
        "#subject",
        {
            label: subject
        }
    );


    const futureDate =
        new Date();

    futureDate.setDate(
        futureDate.getDate() + 7
    );

    const formattedDate =
        futureDate
            .toISOString()
            .split("T")[0];


    await page.fill(
        "#date",
        formattedDate
    );


    await page.fill(
        "#time",
        "16:00"
    );


    /*
    -----------------------------
    COMPLETED BOOKING EVENT
    -----------------------------
    */

    await sendPostHogEvent(
        "booking_completed",
        userId,
        {
            tutor_id: tutor.id,
            tutor_name: tutor.name,
            student_grade: grade,
            requested_subject: subject
        }
    );


    /*
    Still click the actual website
    button so this is genuine browser
    traffic too.
    */

    page.once(
        "dialog",
        async dialog => {

            await dialog.accept();

        }
    );


    await page.click(
        ".booking-submit"
    );


    console.log(
        "  ✓ booking completed"
    );


    await page.waitForTimeout(500);

    await context.close();

}


/*
-----------------------------------
RUN SIMULATION
-----------------------------------
*/

async function runSimulation() {

    const browser =
        await chromium.launch({
            headless: true
        });


    const NUMBER_OF_USERS = 30;


    for (
        let i = 1;
        i <= NUMBER_OF_USERS;
        i++
    ) {

        try {

            await simulateUser(
                browser,
                i
            );

        }

        catch (error) {

            console.error(
                `User ${i} failed:`,
                error.message
            );

        }

    }


    await browser.close();


    console.log(
        "\nTraffic simulation finished."
    );

}


runSimulation();
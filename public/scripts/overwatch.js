// (()=>{
//     console.log(document.querySelectorAll("#mainContent_EliteStatus"))
//     const firstName = document.querySelector("#guestFirstName")
//     console.log(firstName.value)
//     const lastName = document.querySelector("#guestLastName")
//     console.log(lastName.value)
// })()

// identifier for Guest Info page => #mainContent_EliteStatus

(function () {
    if (document.querySelector("#Guest_Info_Body")) {
        console.log("Guest Info Page")
        console.log(document.querySelectorAll("#Guest_Info_Body"))
        const firstName = document.querySelector("#guestFirstName")
        console.log(firstName.value)
        const lastName = document.querySelector("#guestLastName")
        console.log(lastName.value)
    }
})()
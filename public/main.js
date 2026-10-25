

// select the icons here
const completedIcon = document.querySelectorAll(".completed")
const deleteBtn = document.querySelectorAll(".delete") 
const button = document.querySelectorAll(".vote")


// FLOW
// user clicks the upvote button 
// main.js sends put request with the id
// express recieves this id and try to find the question with that specific id
// mongoDB add 1 to the vote
// server sends the updated vote count and renders to the ejs

button.forEach(function(element) {
    console.log(element)

element.addEventListener("click",()=>{
    const id = element.dataset.questionId // we use this id to send it to the server side
  console.log(id)

  // send the fetch request 
  fetch("/upvote",{
    method:"put",
    headers : {"Content-Type" : "application/json" } ,
    body: JSON.stringify({ // must manually convert the object into json  "id" : "63232322323...."
    id })
  }) 
  .then(response=>{
    if(response.ok){
    window.location.reload() // to show the updated count 
    }
  }) 
.then(data=>{
    console.log(data)
})
})
})


// delete event listener
// the user clicks delete button
// we extract the id for that specific question from the data attribute
// fetch with the id wot
// express recieve the request  and attach moogoose method to delete that specific question
// respond with client with the updateed question queue
 deleteBtn.forEach(function(element){
  console.log(element)
  element.addEventListener("click",()=>{
    const id = element.dataset.questionId
    console.log(id)

    // build the confirm window for mistake deletion
    const confirmText = confirm("Delete the question ? It can be undone 🥸")
    if(confirmText){
      // fetch if the user clicks ok
      fetch("/delete-question",{
        method:"delete",
        headers : {"Content-Type" : "application/json " } , 
        body:JSON.stringify({
          id
        })
      }) .then(response=>{
        if(response.ok) {
          window.location.reload()
        }
      }) 
    } 
  })
 })

 // Event listener for completed button
completedIcon.forEach(function(element){
  element.addEventListener("click" , ()=>{
    const id = element.dataset.questionId

    fetch("/completed",{
      method:"put",
      headers : {"Content-Type" : "application/json" } ,
      body:JSON.stringify({
        id
      })
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Could not mark question answered (${response.status})`)
      }
      window.location.reload()
    }).catch(error => {
      console.error(error)
    })
  })
})
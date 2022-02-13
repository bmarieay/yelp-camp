const pageButton = document.querySelectorAll('.page-num');
const prevBtn = document.querySelector('.page-prev');
const nextBtn = document.querySelector('.page-next');
const previousContainer = document.querySelector('.prev-btn');
const nextContainer = document.querySelector('.next-btn');
// const firstIndex = document.querySelector('.page-num-first');
// const lastIndex = document.querySelector('.page-num-last');


// alert(localStorage.getItem("currentPage"))


//update total later according to data
const pageNumber = (total, max, current) => {
    const half = Math.round(max / 2);
    let to = max;
    
    if(current + half >= total){
        to = total;
    } else if(current > half){
        to = current + half;
    }
    
    let from = to - max;
    
    if(current === 1){
        previousContainer.firstChild.classList.add('text-muted');
    } else {
        previousContainer.firstChild.classList.remove('text-muted');
    }
    
    if(current === total){
        nextContainer.firstChild.classList.add('text-muted');
    } else {
        nextContainer.firstChild.classList.remove('text-muted');
    }
    
    
    return Array.from({length: max}, (_, i) => (i + 1) + from)
}

initialize();

function initialize (){
    console.log(parseInt(localStorage.getItem("currentPage")))
    let arrayofBtns = pageNumber(10, 5, parseInt(localStorage.getItem("currentPage")));
    generateButtons(pageButton, arrayofBtns);
}


function renderCorrectPages(currentPage){
    //set the new page
    localStorage.setItem("currentPage", currentPage);
    // for(let btn of pageButton){
    //     if(btn.innerText === localStorage.getItem("currentPage")){
    //         btn.classList.add('active-btn');
    //     }
    // }

    console.log("CURRENT:", currentPage);
    // initialize();
    let btnArray = pageNumber(10, 5, parseInt(localStorage.getItem("currentPage")))
    generateButtons(pageButton, btnArray);
}

function generateButtons(buttons, numbers){
    let i = 0;
    for(let button of buttons){
        button.innerText = numbers[i];
        i++;
    }
}



for(let button of pageButton){
    button.addEventListener('click', () => {
        button.setAttribute('href', `/campgrounds?page=${button.innerText}`);
        renderCorrectPages(parseInt(button.innerText))
    });
}


prevBtn.addEventListener('click', () => {
    if(localStorage.getItem("currentPage") > 0){
        // previousContainer.firstChild.classList.remove('text-muted');
        // console.log("previous", localStorage.getItem("currentPage"))
        prevBtn.setAttribute('href', `/campgrounds?page=${parseInt(localStorage.getItem("currentPage")) - 1}`);
        //update the currennt page
        renderCorrectPages(parseInt(localStorage.getItem("currentPage")) -1);
    }
    
})

nextBtn.addEventListener('click', () => {
    if(localStorage.getItem("currentPage") < 10){
        // console.log("next", localStorage.getItem("currentPage"))
        nextBtn.setAttribute('href', `/campgrounds?page=${parseInt(localStorage.getItem("currentPage")) + 1}`);
        renderCorrectPages(parseInt(localStorage.getItem("currentPage")) + 1);
    }
})


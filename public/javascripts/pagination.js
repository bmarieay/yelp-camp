const pageButton = document.querySelectorAll('.page-num');
const prevBtn = document.querySelector('.page-prev');
const nextBtn = document.querySelector('.page-next');
const previousContainer = document.querySelector('.prev-btn');
const nextContainer = document.querySelector('.next-btn');


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

initialize();//initialize everything for new load

function initialize (){
    console.log(parseInt(localStorage.getItem("currentPage")))
    let arrayofBtns = pageNumber(10, 5, parseInt(localStorage.getItem("currentPage")));
    generateButtons(pageButton, arrayofBtns);
}

//calls the new list of pages
function renderCorrectPages(currentPage){
    //set the new page
    localStorage.setItem("currentPage", currentPage);

    console.log("CURRENT:", currentPage);
    initialize();
    // let btnArray = pageNumber(10, 5, parseInt(localStorage.getItem("currentPage")))
    // generateButtons(pageButton, btnArray);
}

//updates the buttons
function generateButtons(buttons, numbers){
    let i = 0;
    for(let button of buttons){
        button.innerText = numbers[i];
        i++;
    }
}

//acts like a pagination driver
function paginationHandler(url, page){
    alert(this);
    this.setAttribute('href',url);
    renderCorrectPages(page)
}

for(let button of pageButton){
    button.addEventListener('click', function() {
        paginationHandler.call(this, `/campgrounds?page=${button.innerText}`, parseInt(button.innerText));
    });
}

prevBtn.addEventListener('click', function() {
    if(localStorage.getItem("currentPage") > 0){
        paginationHandler.call(
            this,
            `/campgrounds?page=${parseInt(localStorage.getItem("currentPage")) - 1}`,
            parseInt(localStorage.getItem("currentPage")) -1
            );
        }
        
    })
    
    nextBtn.addEventListener('click', function() {
        if(localStorage.getItem("currentPage") < 10){
            paginationHandler.call(
                this,
                `/campgrounds?page=${parseInt(localStorage.getItem("currentPage")) + 1}`,
                parseInt(localStorage.getItem("currentPage")) + 1
                );
    }
})


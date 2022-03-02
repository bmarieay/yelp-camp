const pageButton = document.querySelectorAll('.page-num');
const prevBtn = document.querySelector('.page-prev');
const nextBtn = document.querySelector('.page-next');
const previousContainer = document.querySelector('.prev-btn');
const nextContainer = document.querySelector('.next-btn');
let max = Math.ceil(resultLength / 20.0);
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

    if(current <= 1){
        previousContainer.classList.add('disabled');
        previousContainer.setAttribute('tabindex', '-1');
    } else {
        previousContainer.removeAttribute('tabindex');
        previousContainer.classList.remove('disabled');
    }

    if(current === total){
        nextContainer.classList.add('disabled')
    } else {
        nextContainer.classList.remove('disabled');
    }
    
    return Array.from({length: max}, (_, i) => (i + 1) + from)
}

initialize();//initialize everything for new load



function initialize (){
    let arrayofBtns = pageNumber(max, 5, readCookie());
    generateButtons(pageButton, arrayofBtns);
}


function readCookie() {
    let allcookies = document.cookie;
    let key, value;
    
    // Get all the cookies pairs in an array
    cookiearray = allcookies.split(';');
    // Now take key value pair out of this array
    for(let i=0; i<cookiearray.length; i++) {
       key = cookiearray[i].split('=')[0];
       if(key === 'currentPage'){
            value = parseInt(cookiearray[i].split('=')[1]);
       }
    }
    return value;
}

//calls the new list of pages
function renderCorrectPages(currentPage){
    //set the new page
    document.cookie = `currentPage=${currentPage}`;
    initialize();
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
    this.setAttribute('href',url);
    renderCorrectPages(page)
}

//will listen when user clicks any page buttons
for(let button of pageButton){
    button.addEventListener('click', function() {
        paginationHandler.call(this, `/campgrounds?page=${button.innerText}`, parseInt(button.innerText));
    });
}

//previous button
prevBtn.addEventListener('click', function() {
    if(readCookie() >= 0){
        paginationHandler.call(
            this,
            `/campgrounds?page=${readCookie() - 1}`,
            readCookie() -1
            );
        }
        
})

//next button
nextBtn.addEventListener('click', function() {
        if(readCookie() < max){
            paginationHandler.call(
                this,
                `/campgrounds?page=${readCookie() + 1}`,
                readCookie() + 1
                );
    }
})

//apply accent color to current page 
for(let button of pageButton){
    if(parseInt(button.innerText) === readCookie()){
        button.classList.add('active-btn');
        break;
    }
}
const pageButton = document.querySelectorAll('.page-num');
const prevBtn = document.querySelector('.page-prev');
const nextBtn = document.querySelector('.page-next');
const previousContainer = document.querySelector('.prev-btn');
const nextContainer = document.querySelector('.next-btn');
//TODO: FIX CORRECT PAGINATION BUTTONS WHEN URL IS MODIFIED
let max = Math.ceil(resultLength / 5.0);

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
        prevBtn.classList.add('text-muted');
        if(current <= 0){
            prevBtn.removeAttribute('href')
        }
    } else {
        prevBtn.classList.remove('text-muted');
    }
    
    if(current === total){
        nextBtn.classList.add('text-muted');
        nextBtn.removeAttribute('href');
    } else {
        nextBtn.classList.remove('text-muted');
    }
    
    
    return Array.from({length: max}, (_, i) => (i + 1) + from)
}

initialize();//initialize everything for new load

function initialize (){
    let arrayofBtns = pageNumber(max, 5, readCookie());

    generateButtons(pageButton, arrayofBtns);
}


function readCookie() {
    var allcookies = document.cookie;
    let key, value;
    
    // Get all the cookies pairs in an array
    cookiearray = allcookies.split(';');
    
    // Now take key value pair out of this array
    for(var i=0; i<cookiearray.length; i++) {
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
    // localStorage.setItem("currentPage", currentPage);
    document.cookie = `currentPage=${currentPage}`;
    console.log("CURRENT:", currentPage);
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

    
nextBtn.addEventListener('click', function() {
        if(readCookie() < max){
            paginationHandler.call(
                this,
                `/campgrounds?page=${readCookie() + 1}`,
                readCookie() + 1
                );
    }
})


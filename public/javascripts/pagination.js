const pageButton = document.querySelectorAll('.page-num');
const prevBtn = document.querySelector('.page-prev');
const nextBtn = document.querySelector('.page-next');

const pageNumber = (total, max, current) => {
    const half = Math.round(max / 2);
    let to = max;

    if(current + half >= total){
        to = total;
    } else if(current > half){
        to = current + half;
    }

    let from = to - max;

    return Array.from({length: max}, (_, i) => (i + 1) + from)
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
        console.log("triggered with innertext: " , button.innerText)
        localStorage.setItem("currentPage", parseInt(button.innerText));
        console.log(localStorage.getItem("currentPage"))
        let btnArray = pageNumber(10, 5, parseInt(localStorage.getItem("currentPage")))
        generateButtons(pageButton, btnArray);
    })
}


prevBtn.addEventListener('click', () => {
   if(localStorage.getItem("currentPage") > 0){
        localStorage.setItem("currentPage", parseInt(localStorage.getItem("currentPage")) -1);
        let btnArray = pageNumber(10, 5, parseInt(localStorage.getItem("currentPage")))
        generateButtons(pageButton, btnArray);
        console.log("Prev button:", localStorage.getItem("currentPage"))
   }
})

nextBtn.addEventListener('click', () => {
    if(localStorage.getItem("currentPage") < 10){
        localStorage.setItem("currentPage", parseInt(localStorage.getItem("currentPage")) + 1);
        let btnArray = pageNumber(10, 5, parseInt(localStorage.getItem("currentPage")))
        generateButtons(pageButton, btnArray);
        console.log("Next button:", localStorage.getItem("currentPage"))
    }
})


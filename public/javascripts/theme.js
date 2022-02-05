const mode = document.querySelector('#theme');
const element = document.querySelectorAll('.theme-target');
const inner = document.querySelectorAll('.nav-link');
const brand = document.querySelector('.navbar-brand');
const targets = [...element, ...inner];
// const element = document.body;

// const setCookie = (name, value, exdays) => {
//     const d = new Date(); // Gets current date
//     d.setTime(d.getTime() + (exdays*24*60*60*1000)); //calculates the date when it has to expire
//     const expires = "expires="+ d.toUTCString();
//     document.cookie = name + "=" + value + ";" + expires + ";path=/"; // sets the cookie
// }
if(localStorage.getItem("theme") === 'dark'){
    for(let target of targets){
        target.classList.add('dark-theme');
    }
    brand.classList.add('dark-theme')
} else {
    for(let target of targets){
        target.classList.remove('dark-theme');
    }
    brand.classList.remove('dark-theme')
}


const toggleTheme = () => {
    const theme = localStorage.getItem("theme");
    if(!theme){
        console.log("entered")
        localStorage.setItem("theme", "light");
        console.log(localStorage.getItem("theme"))
    }
    for(let target of targets){
        target.classList.toggle('dark-theme');
    }
    brand.classList.toggle('dark-theme')
    
    if(theme === "dark"){
        console.log("user want light")
        localStorage.setItem("theme", "light")//user wants a light mode
        mode.innerText = "Dark Mode"
    } 
    else {
        console.log("user changed to dark")
        localStorage.setItem("theme", "dark")
        mode.innerText = "Light Mode"
    }

}

// toggleTheme();
mode.addEventListener('click', toggleTheme);

// const togTheme = () => { 
//     const theme = localstorage.getItem(''theme); 
//     if(!theme) {localstorage.setItem('theme', 'Light')} 
//     const element = document.body; 
//     element.classList.toggle("dark-theme"); 
//     const x = document.getElementById("theme"); 
//     if (theme === "Dark") { 
//         localstorage.setItem('theme', 'Light');
//         x.innerHTML = "Light Mode"; 
//     } else { 
//         localstorage.setItem('theme', 'Dark'); 
//         x.innerHTML = "Dark Mode"; 
//     } 
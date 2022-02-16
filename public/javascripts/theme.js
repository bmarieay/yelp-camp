const mode = document.querySelector('#theme');
const togglerMode = document.querySelector('.form-check-input');
const themeLabel = document.querySelector('#theme-label')
const element = document.querySelectorAll('.theme-target');
const pageLinks = document.querySelectorAll('.page-link');
const accentTexts = document.querySelectorAll('.accent');
const inner = document.querySelectorAll('.nav-link');
const brand = document.querySelector('.navbar-brand');
const targets = [...element, ...inner, ...pageLinks];
//TODO: ONLY TARGET ACCENT TITLES
function setTheme(mode){
    if(mode === 'dark'){
        togglerMode.checked = true;
        for(let target of targets){
            target.classList.add(`${mode}-theme`);
        }
        brand.classList.add(`${mode}-theme`);
        themeLabel.innerText = "Light Mode"
    }
    if(mode === 'light'){
        for(let target of targets){
            target.classList.remove(`${mode}-theme`);
        }
        brand.classList.remove(`${mode}-theme`)
        themeLabel.innerText = "Dark Mode"
    } 
}

function cookieSetter(mode){
    if(mode === 'light'){
        localStorage.setItem("theme", mode)//user wants a light mode
        themeLabel.innerText = "Dark Mode"
    } else {
        localStorage.setItem("theme", mode)
        themeLabel.innerText = "Light Mode"
    }
}

//set the correct css from cookie theme once reloaded
localStorage.getItem("theme") === 'dark' ? setTheme('dark') : setTheme('light');

const toggleTheme = () => {
    const theme = localStorage.getItem("theme");
    if(!theme){//default theme is light
        localStorage.setItem("theme", "light");
        themeLabel.innerText = "Dark Mode"
    }

    //toggle the css
    for(let target of targets){
        target.classList.toggle('dark-theme');
    }
    brand.classList.toggle('dark-theme')

    //toggle the cookie and label
    theme === "dark" ? cookieSetter('light') : cookieSetter('dark');
}

mode.addEventListener('click', toggleTheme);
//bind the label for toggling the theme
themeLabel.addEventListener('click', toggleTheme);
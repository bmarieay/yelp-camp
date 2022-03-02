const options = document.querySelectorAll('option');
const stateLabel = document.querySelector('.state-label')
let state;
const stateCode = filter;

//apply selected attribute to filtered state
for(let option of options){
    if(option.getAttribute('value') == stateCode){
        state = option.innerText;
        option.selected = true;
        break;
    }
}

stateLabel.innerText = state;

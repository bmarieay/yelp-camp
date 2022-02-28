const options = document.querySelectorAll('option');

const stateCode = filter;

//apply selected attribute to filtered state
for(let option of options){
    if(option.getAttribute('value') == stateCode){
        option.selected = true;
        break;
    }
}


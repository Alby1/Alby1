function onLoad() {
    document.addEventListener("scroll", pageOnScroll)
    pageOnScroll()
}

function pageOnScroll(event) {
    if (window.innerWidth > 730) return
    let elements = document.getElementsByClassName("flex-item")
    for (el of elements) {
        let elY = el.getBoundingClientRect().y
        const wHeight = window.innerHeight
        const wHeight3 = wHeight / 3
        const wHeight32 = wHeight3 * 2
        /* if(elY < wHeight3 || elY > wHeight32) continue */
        const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
        el.style.width = `${85 + clampNumber(wHeight32 / elY * 20, 0, 20)}%`
        
    }
    console.log("--------------")
    
}
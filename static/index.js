function onLoad() {
    document.addEventListener("scroll", pageOnScroll)
    pageOnScroll()
    /* document.addEventListener("mousemove", mouseOnMove, {passive: true})
    SWidth = 100
    SHeight = 100
    shadow = document.getElementById("mouse_shadow")
    shadow.style.width = SWidth + "px"
    shadow.style.height = SHeight + "px" */
}

function pageOnScroll(event) {
    // return // boh forse ci torno
    if (window.innerWidth > 730) return
    let elements = document.getElementsByClassName("flex-item")
    for (el of elements) {
        let elY = el.getBoundingClientRect().y
        const wHeight = window.innerHeight
        const wHeight3 = wHeight / 3
        const wHeight32 = wHeight3 * 2
        // if(elY < wHeight3 || elY > wHeight32) {
        //     el.style.width = "85%"
        //     continue
        // }
        const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
        let factor = (elY < wHeight3 ? (elY / wHeight3) : (wHeight32 / elY))
        el.style.width = `${70 + clampNumber(factor * 20, 0, 20)}%`
        /* TODO: fare ↑ ma col padding */
        
        // el.style.padding = ``
    }
}

function mouseOnMove(event) {
    shadow.style.left = `${event.pageX-(SWidth/2)}px`
    shadow.style.top = `${event.pageY-(SHeight/2)}px`
    let eFP = document.elementFromPoint(event.clientX, event.clientY)
}
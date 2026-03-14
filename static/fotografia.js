const isBigUncompressed = false


function onLoad() {
    const bic = document.getElementById('big-image-container')

    bic.addEventListener('click', hideBigImage)
    document.addEventListener('keyup', moveBigImage)

    for (const img of document.getElementsByTagName('img')) {
        if (img.id != 'big-image')
            img.addEventListener('click', (event) => {openImgBig(img)})
    }
}

/**
 * 
 * @param {HTMLImageElement} img 
 */
function openImgBig(img) {
    const bic = document.getElementById('big-image-container')

    bic.classList.remove('hidden')

    applyBigImg(img.src)
}

/**
 * 
 * @param {string} src 
 */
function applyBigImg(src) {
    /**
     * @type {HTMLImageElement}
     */
    const bi = document.getElementById('big-image')

    if (isBigUncompressed) src = src.replace("/compressed", '')

    bi.src = src
}

function hideBigImage() {
    const bic = document.getElementById('big-image-container')

    bic.classList.add('hidden')
}

/**
 * 
 * @param {KeyboardEvent} event 
 */
function moveBigImage(event) {
    const bic = document.getElementById('big-image-container')

    if (isBigImageShown()) return
    
    /**
     * @type {HTMLImageElement}
     */
    const bi = document.getElementById('big-image')
    
    if(event.key == 'ArrowLeft') {
        // previous image
        const imgs = document.getElementsByTagName('img')

        const i = findCurrentImageIndex(imgs, bi)

        if (imgs[i-1]) applyBigImg(imgs[i-1].src)
    }

    if(event.key == 'ArrowRight') {
        // next image
        const imgs = document.getElementsByTagName('img')

        const i = findCurrentImageIndex(imgs, bi)

        if (imgs[i+1]) applyBigImg(imgs[i+1].src)
    }

    if(event.key == 'Escape') {
        bic.classList.add('hidden')
    }
}

function isBigImageShown() {
    /**
     * @type {HTMLDivElement}
     */
    const bic = document.getElementById('big-image-container')

    return bic.classList.contains('hidden')
}




/**
 * @type {Object<string, number>}
 */
let imgIdMap = { }

/**
 * 
 * @param {HTMLCollectionOf<HTMLImageElement>} imgs 
 * @param {HTMLImageElement} bi 
 * @returns {number}
 */
function findCurrentImageIndex(imgs, bi) {
    let big = bi.src
    if (isBigUncompressed) big = big.replace('/fotografia1/', '/fotografia1/compressed/')
    if (imgIdMap[big]) return imgIdMap[big]
    
    let i = 0
    for (const img of imgs) {
        if (img.src == big && img.id != 'big-image')
            break
        i++
    }
    imgIdMap[big] = i
    return i
}
